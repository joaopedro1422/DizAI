import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { ConteudoRamoService } from '../../../core/services/conteudo-ramo.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { OnboardingTourService } from './onboarding-tour.service';
import { PassoTour, passosDoTour } from './previas-onboarding';
import { PreviaWhatsappComponent } from './previa-whatsapp.component';

interface Retangulo {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Medidas {
  alvo: Retangulo;
  larguraJanela: number;
  alturaJanela: number;
}

type FaseTour = 'inativo' | 'passo';

/** Mesma duração da transição do recorte no CSS. */
const DURACAO_TRANSICAO_MS = 650;
const TEMPO_MAXIMO_ROLAGEM_MS = 1500;
const QUADROS_PARADOS_PARA_ENCERRAR_ROLAGEM = 6;
const FOLGA_DESTAQUE_PX = 6;
const DISTANCIA_BALAO_PX = 18;
const LARGURA_MAXIMA_BALAO_PX = 448;
const MARGEM_LATERAL_PX = 16;

/**
 * Tour guiado do primeiro acesso: escurece a tela e destaca uma seção por vez.
 *
 * Para a troca de passo ser suave e não "pular", a posição final do recorte é calculada
 * antes de rolar a página: o recorte e a rolagem andam juntos até o mesmo ponto, e o balão
 * só aparece depois que tudo parou.
 */
@Component({
  selector: 'app-onboarding-tour',
  imports: [IconeComponent, PreviaWhatsappComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './onboarding-tour.component.html',
  styleUrl: './onboarding-tour.component.css',
  host: {
    '(window:resize)': 'acompanharAlvo()',
    '(window:scroll)': 'acompanharAlvo()',
    '(document:keydown.escape)': 'aoPressionarEsc()',
  },
})
export class OnboardingTourComponent implements OnDestroy {
  /** Disparado quando o tour acaba: true se o lojista foi até o fim ("Próximo" no último passo), false se pulou. */
  readonly encerrado = output<boolean>();

  private readonly tourService = inject(OnboardingTourService);
  private readonly botaoAvancar = viewChild<ElementRef<HTMLButtonElement>>('botaoAvancar');

  /** Os passos desta loja (pelo ramo), só com os cards que estão na tela. */
  protected readonly passos = signal<PassoTour[]>([]);
  protected readonly fase = signal<FaseTour>('inativo');
  protected readonly indicePasso = signal(0);
  /** Falso enquanto a tela está rolando para o próximo passo. */
  protected readonly balaoVisivel = signal(false);
  /** Liga a animação do recorte só nas trocas de passo (na rolagem manual ele acompanha na hora). */
  protected readonly animarRecorte = signal(false);
  private readonly medidas = signal<Medidas | null>(null);

  private temporizadores: ReturnType<typeof setTimeout>[] = [];
  /** Identifica a troca de passo em andamento; trocas antigas são descartadas. */
  private trocaAtual = 0;
  private destruido = false;

  private readonly conteudoRamo = inject(ConteudoRamoService).conteudo;
  private readonly exemplos = inject(ConteudoRamoService).exemplos;
  private readonly perfil = inject(PerfilService).perfil;
  protected readonly passoAtual = computed(() => this.passos()[this.indicePasso()]);
  protected readonly ehUltimoPasso = computed(() => this.indicePasso() === this.passos().length - 1);
  protected readonly progresso = computed(() => ((this.indicePasso() + 1) / Math.max(this.passos().length, 1)) * 100);

  /** Posição do recorte iluminado em volta da seção. */
  protected readonly destaque = computed(() => {
    const medidas = this.medidas();
    if (!medidas) {
      return null;
    }
    const { alvo } = medidas;
    return {
      top: alvo.top - FOLGA_DESTAQUE_PX,
      left: alvo.left - FOLGA_DESTAQUE_PX,
      width: alvo.width + FOLGA_DESTAQUE_PX * 2,
      height: alvo.height + FOLGA_DESTAQUE_PX * 2,
    };
  });

  /** O balão fica abaixo da seção quando ela está na metade de cima da tela, e acima no caso contrário. */
  protected readonly balao = computed(() => {
    const medidas = this.medidas();
    if (!medidas) {
      return null;
    }
    const { alvo, larguraJanela, alturaJanela } = medidas;
    const largura = Math.min(LARGURA_MAXIMA_BALAO_PX, larguraJanela - MARGEM_LATERAL_PX * 2);
    const esquerda = (larguraJanela - largura) / 2;
    const ficaAbaixo = alvo.top + alvo.height / 2 < alturaJanela / 2;
    const centroAlvo = alvo.left + alvo.width / 2;
    const posicaoSeta = Math.min(Math.max(centroAlvo - esquerda - 7, 24), largura - 38);
    const distancia = FOLGA_DESTAQUE_PX + DISTANCIA_BALAO_PX;

    return {
      largura,
      esquerda,
      topo: ficaAbaixo ? alvo.top + alvo.height + distancia : null,
      base: ficaAbaixo ? null : alturaJanela - alvo.top + distancia,
      setaEmCima: ficaAbaixo,
      posicaoSeta,
    };
  });

  iniciar(): void {
    this.limparTemporizadores();
    const perfil = this.perfil();
    const linkVitrine = `${location.host}/l/${perfil.slug}`;
    this.passos.set(
      passosDoTour(perfil.ramo, this.conteudoRamo(), this.exemplos(), linkVitrine).filter((passo) =>
        this.tourService.obterElemento(passo.alvo),
      ),
    );
    if (this.passos().length === 0) {
      this.encerrar(true);
      return;
    }
    void this.irParaPasso(0);
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.limparTemporizadores();
  }

  protected avancar(): void {
    if (this.ehUltimoPasso()) {
      this.encerrar(true);   // o painel continua o tour na tela do assistente
      return;
    }
    void this.irParaPasso(this.indicePasso() + 1);
  }

  protected voltar(): void {
    void this.irParaPasso(Math.max(0, this.indicePasso() - 1));
  }

  protected encerrar(concluido = false): void {
    this.trocaAtual++;
    this.limparTemporizadores();
    this.fase.set('inativo');
    this.balaoVisivel.set(false);
    this.medidas.set(null);
    this.encerrado.emit(concluido);
  }

  protected aoPressionarEsc(): void {
    if (this.fase() !== 'inativo') {
      this.encerrar();
    }
  }

  /** Rolagem ou redimensionamento feitos pelo usuário: o recorte acompanha sem animação. */
  protected acompanharAlvo(): void {
    if (this.fase() !== 'passo' || !this.balaoVisivel()) {
      return;
    }
    this.animarRecorte.set(false);
    this.medirAlvoAgora();
  }

  private async irParaPasso(indice: number): Promise<void> {
    const elemento = this.tourService.obterElemento(this.passos()[indice].alvo);
    if (!elemento) {
      return;
    }
    const troca = ++this.trocaAtual;

    this.balaoVisivel.set(false);
    this.animarRecorte.set(true);
    this.indicePasso.set(indice);
    this.fase.set('passo');

    // Calcula onde a seção vai ficar depois da rolagem e já leva o recorte para lá.
    const rolagemDestino = this.calcularRolagemParaCentralizar(elemento);
    this.medidas.set(this.medirComRolagem(elemento, rolagemDestino - window.scrollY));
    window.scrollTo({ top: rolagemDestino, behavior: 'smooth' });

    await Promise.all([this.esperarFimDaRolagem(), this.esperar(DURACAO_TRANSICAO_MS)]);
    if (troca !== this.trocaAtual || this.destruido) {
      return; // o lojista já pediu outro passo no meio do caminho
    }

    this.medirAlvoAgora(); // confere a posição real, caso a rolagem tenha parado antes
    this.balaoVisivel.set(true);
    this.botaoAvancar()?.nativeElement.focus({ preventScroll: true });
  }

  private calcularRolagemParaCentralizar(elemento: HTMLElement): number {
    const retangulo = elemento.getBoundingClientRect();
    const topoNaPagina = retangulo.top + window.scrollY;
    const desejado = topoNaPagina - (window.innerHeight - retangulo.height) / 2;
    const maximo = document.documentElement.scrollHeight - window.innerHeight;
    return Math.round(Math.min(Math.max(desejado, 0), Math.max(maximo, 0)));
  }

  private medirAlvoAgora(): void {
    const passo = this.passoAtual();
    const elemento = passo && this.tourService.obterElemento(passo.alvo);
    if (elemento) {
      this.medidas.set(this.medirComRolagem(elemento, 0));
    }
  }

  /** Mede o elemento como se a página tivesse rolado mais `deslocamentoVertical` pixels. */
  private medirComRolagem(elemento: HTMLElement, deslocamentoVertical: number): Medidas {
    const retangulo = elemento.getBoundingClientRect();
    return {
      alvo: {
        top: retangulo.top - deslocamentoVertical,
        left: retangulo.left,
        width: retangulo.width,
        height: retangulo.height,
      },
      larguraJanela: window.innerWidth,
      alturaJanela: window.innerHeight,
    };
  }

  /** Resolve quando a página fica alguns quadros sem rolar (ou depois de um tempo máximo). */
  private esperarFimDaRolagem(): Promise<void> {
    return new Promise((resolver) => {
      const inicio = performance.now();
      let ultimaPosicao = window.scrollY;
      let quadrosParados = 0;

      const verificar = (): void => {
        const posicao = window.scrollY;
        quadrosParados = posicao === ultimaPosicao ? quadrosParados + 1 : 0;
        ultimaPosicao = posicao;

        const parou = quadrosParados >= QUADROS_PARADOS_PARA_ENCERRAR_ROLAGEM;
        const passouDoTempo = performance.now() - inicio > TEMPO_MAXIMO_ROLAGEM_MS;
        if (parou || passouDoTempo || this.destruido) {
          resolver();
          return;
        }
        requestAnimationFrame(verificar);
      };
      requestAnimationFrame(verificar);
    });
  }

  private esperar(milissegundos: number): Promise<void> {
    return new Promise((resolver) => this.agendar(resolver, milissegundos));
  }

  private agendar(acao: () => void, esperaMs: number): void {
    this.temporizadores.push(setTimeout(acao, esperaMs));
  }

  private limparTemporizadores(): void {
    this.temporizadores.forEach(clearTimeout);
    this.temporizadores = [];
  }
}
