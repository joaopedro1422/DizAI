import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  input,
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
  /** Altura do balão deste passo (com a prévia do WhatsApp ele é alto). */
  alturaBalao: number;
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
/** Espaço livre que o balão e o card deixam no topo e no pé da tela. */
const MARGEM_TELA_PX = 16;
/** Altura do balão antes de ele existir na tela (o primeiro passo), com a prévia do WhatsApp. */
const ALTURA_BALAO_ESTIMADA_PX = 380;

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
  /** Altura de um topo preso na tela (ex.: o topo azul da agenda no celular): a seção não para embaixo dele. */
  readonly margemTopo = input(0);

  private readonly tourService = inject(OnboardingTourService);
  private readonly botaoAvancar = viewChild<ElementRef<HTMLButtonElement>>('botaoAvancar');
  private readonly balaoElemento = viewChild<ElementRef<HTMLElement>>('balaoElemento');

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
  /** Depois de um passo interativo não dá para voltar: o que o lojista tocou já mudou a tela. */
  protected readonly podeVoltar = computed(
    () => this.indicePasso() > 0 && !this.passos()[this.indicePasso() - 1]?.aguardar,
  );
  protected readonly ehUltimoPasso = computed(() => this.indicePasso() === this.passos().length - 1);
  protected readonly furoNoBloqueio = computed(() => {
    const recorte = this.destaque();
    if (!this.passoAtual()?.aguardar || !recorte || !this.balaoVisivel()) {
      return null;
    }
    const { top, left, width, height } = recorte;
    const [x1, y1, x2, y2] = [left, top, left + width, top + height].map((valor) => `${Math.round(valor)}px`);
    return `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${x1} ${y1}, ${x2} ${y1}, ${x2} ${y2}, ${x1} ${y2}, ${x1} ${y1})`;
  });
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

  protected readonly balao = computed(() => {
    const medidas = this.medidas();
    if (!medidas) {
      return null;
    }
    const { alvo, larguraJanela, alturaJanela, alturaBalao } = medidas;
    const largura = Math.min(LARGURA_MAXIMA_BALAO_PX, larguraJanela - MARGEM_LATERAL_PX * 2);
    // centrado na seção (no celular ocupa a largura toda); no computador fica perto dela, ex.: o menu à esquerda
    const centroAlvo = alvo.left + alvo.width / 2;
    const esquerda = Math.min(
      Math.max(centroAlvo - largura / 2, MARGEM_LATERAL_PX),
      larguraJanela - largura - MARGEM_LATERAL_PX,
    );
    const distancia = FOLGA_DESTAQUE_PX + DISTANCIA_BALAO_PX;
    const espacoAbaixo = alturaJanela - (alvo.top + alvo.height + distancia) - MARGEM_TELA_PX;
    const espacoAcima = alvo.top - distancia - MARGEM_TELA_PX;
    const ficaAbaixo = espacoAbaixo >= alturaBalao || espacoAbaixo >= espacoAcima;
    const posicaoSeta = Math.min(Math.max(centroAlvo - esquerda - 7, 24), largura - 38);
    const limite = Math.max(alturaJanela - alturaBalao - MARGEM_TELA_PX, MARGEM_TELA_PX);

    return {
      largura,
      esquerda,
      topo: ficaAbaixo ? Math.min(alvo.top + alvo.height + distancia, limite) : null,
      base: ficaAbaixo ? null : Math.min(alturaJanela - alvo.top + distancia, limite),
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

  iniciarCom(passos: PassoTour[]): void {
    this.limparTemporizadores();
    this.passos.set(passos);
    if (passos.length === 0) {
      this.encerrar(true);
      return;
    }
    void this.irParaPasso(0);
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.limparTemporizadores();
  }

  /** A tela avança um passo interativo depois que o lojista fez o que foi pedido. */
  proximoPasso(): void {
    if (this.fase() !== 'inativo') {
      this.avancar();
    }
  }

  protected avancar(): void {
    if (this.ehUltimoPasso()) {
      this.encerrar(true);   // o painel continua o tour na tela do assistente
      return;
    }
    void this.irParaPasso(this.indicePasso() + 1);
  }

  protected voltar(): void {
    void this.irParaPasso(Math.max(0, this.indicePasso() - 1), -1);
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

  /** direcao: para onde seguir se o alvo deste passo não estiver na tela (1 = próximo, -1 = anterior). */
  private async irParaPasso(indice: number, direcao: 1 | -1 = 1): Promise<void> {
    const passo = this.passos()[indice];
    const troca = ++this.trocaAtual;
    if (passo.antes) {
      this.balaoVisivel.set(false);
      passo.antes();
      await this.esperar(passo.esperaMs ?? 0);
      await new Promise((resolver) => requestAnimationFrame(resolver));
      if (troca !== this.trocaAtual || this.destruido) {
        return;
      }
    }
    const elemento = this.tourService.obterElemento(passo.alvo);
    if (!elemento || !estaVisivel(elemento)) {
      const proximo = indice + direcao;
      if (proximo >= 0 && proximo < this.passos().length) {
        void this.irParaPasso(proximo, direcao);
      } else if (direcao === 1) {
        this.encerrar(true);
      }
      return;
    }

    this.balaoVisivel.set(false);
    this.animarRecorte.set(true);
    this.indicePasso.set(indice);
    this.fase.set('passo');
    // um quadro para o balão já ter o texto e a prévia deste passo: a rolagem conta com a altura dele
    await new Promise((resolver) => requestAnimationFrame(resolver));
    if (troca !== this.trocaAtual || this.destruido) {
      return;
    }

    // Calcula onde a seção vai ficar depois da rolagem e já leva o recorte para lá. Num menu preso na tela
    // (a gaveta da agenda, a coluna do computador) a página não rola.
    const rolagemDestino = estaPresoNaTela(elemento) ? window.scrollY : this.calcularRolagem(elemento);
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

  private calcularRolagem(elemento: HTMLElement): number {
    const retangulo = elemento.getBoundingClientRect();
    const topoNaPagina = retangulo.top + window.scrollY;
    const conjunto = retangulo.height + FOLGA_DESTAQUE_PX + DISTANCIA_BALAO_PX + this.alturaDoBalao();
    const folgaMinima = this.margemTopo() + MARGEM_TELA_PX + FOLGA_DESTAQUE_PX;
    const folgaNoTopo = Math.max((window.innerHeight - this.margemTopo() - conjunto) / 2 + this.margemTopo(), folgaMinima);
    const desejado = topoNaPagina - folgaNoTopo;
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
      alturaBalao: this.alturaDoBalao(),
    };
  }

  private alturaDoBalao(): number {
    return this.balaoElemento()?.nativeElement.offsetHeight || ALTURA_BALAO_ESTIMADA_PX;
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

/** Escondido nesta largura (display: none, ou um agrupador "display: contents") não tem tamanho para destacar. */
function estaVisivel(elemento: HTMLElement): boolean {
  const retangulo = elemento.getBoundingClientRect();
  return retangulo.width > 0 && retangulo.height > 0;
}

/** Dentro de algo fixo ou preso na tela: rolar a página não muda a posição dele. */
function estaPresoNaTela(elemento: HTMLElement): boolean {
  for (let atual: HTMLElement | null = elemento; atual; atual = atual.parentElement) {
    const posicao = getComputedStyle(atual).position;
    if (posicao === 'fixed' || posicao === 'sticky') {
      return true;
    }
  }
  return false;
}
