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

import { ConteudoRamo } from '../../../core/constants/conteudo-por-ramo';
import { ConteudoRamoService } from '../../../core/services/conteudo-ramo.service';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { AlvoTour, OnboardingTourService } from './onboarding-tour.service';

interface PassoTour {
  alvo: AlvoTour;
  titulo: string;
  texto: string;
}

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

type FaseTour = 'inativo' | 'boas-vindas' | 'passo';

const PASSOS_TOUR: PassoTour[] = [
  {
    alvo: 'perfil',
    titulo: 'Dados da loja e estatísticas',
    texto: 'Comece por aqui, nos três pontinhos. Em "Editar dados da loja", preencha as formas de pagamento, como o cliente recebe e a antecedência dos pedidos: o assistente usa essas informações para responder. Em "Estatísticas", acompanhe quantos clientes ele atendeu e quanto tempo você economizou.',
  },
  {
    alvo: 'produtos',
    titulo: 'Seus produtos e serviços',
    texto: 'Cadastre o que você vende ou faz, com descrição, preço e opções. O assistente só responde com o que estiver aqui.',
  },
  {
    alvo: 'perguntas',
    titulo: 'Perguntas frequentes',
    texto: 'Escreva as dúvidas que seus clientes sempre mandam, como horário, pagamento e prazo. O assistente usa as suas respostas.',
  },
  {
    alvo: 'galeria',
    titulo: 'Galeria de trabalhos',
    texto: 'Organize fotos por serviço. Quando o cliente pedir para ver, o assistente envia o link do álbum certo.',
  },
  {
    alvo: 'contatos',
    titulo: 'Contatos a ignorar',
    texto: 'Se você usa o mesmo número para a vida pessoal e o trabalho, adicione aqui família e amigos. O assistente não responde esses contatos, e as conversas com eles continuam só com você.',
  },
  {
    alvo: 'modo-pedido',
    titulo: 'Configure o seu assistente',
    texto: 'É aqui que você deixa o assistente com a cara do seu negócio: a saudação, as fotos dos seus trabalhos, o envio do catálogo, como ele fecha os pedidos e as instruções que ele sempre segue. Dá para mudar quando quiser.',
  },
];

/** Troca os textos genéricos do tour por exemplos do ramo da loja. */
function adaptarPassoAoRamo(passo: PassoTour, conteudo: ConteudoRamo): PassoTour {
  switch (passo.alvo) {
    case 'produtos': {
      const exemplo = conteudo.exemploProduto;
      return {
        ...passo,
        titulo: `Seus ${conteudo.tituloItens.toLowerCase()}`,
        texto: `Cadastre o que você ${conteudo.termoItem === 'serviço' ? 'faz' : 'vende ou faz'}${exemplo ? `, como "${exemplo}"` : ''}, com descrição, preço e opções. O assistente só responde com o que estiver aqui.`,
      };
    }
    case 'perguntas': {
      const exemplo = conteudo.perguntasSugeridas[0]?.pergunta;
      return exemplo
        ? { ...passo, texto: `Escreva as dúvidas que seus clientes sempre mandam, como "${exemplo}". O assistente usa as suas respostas.` }
        : passo;
    }
    case 'galeria': {
      const exemplo = conteudo.topicosSugeridos[0];
      return exemplo
        ? { ...passo, texto: `Organize as fotos em tópicos, como "${exemplo}". Quando o cliente pedir para ver, o assistente envia o link do tópico certo.` }
        : passo;
    }
    case 'modo-pedido':
      // serviço fala em atendimento e horário, não em pedido
      return conteudo.termoItem === 'serviço'
        ? {
            ...passo,
            texto: 'É aqui que você deixa o assistente com a cara do seu negócio: a saudação, as fotos dos seus trabalhos, o envio do catálogo, como ele fecha os atendimentos e marca os horários, e as instruções que ele sempre segue. Dá para mudar quando quiser.',
          }
        : passo;
    default:
      return passo;
  }
}

const ESPERA_BOAS_VINDAS_MS = 2500;
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
  imports: [IconeComponent],
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

  protected readonly passos = PASSOS_TOUR;
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
  protected readonly passoAtual = computed(() => adaptarPassoAoRamo(PASSOS_TOUR[this.indicePasso()], this.conteudoRamo()));
  protected readonly ehUltimoPasso = computed(() => this.indicePasso() === PASSOS_TOUR.length - 1);

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
    this.agendar(() => this.fase.set('boas-vindas'), 0);
    this.agendar(() => void this.irParaPasso(0), ESPERA_BOAS_VINDAS_MS);
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
    const elemento = this.tourService.obterElemento(PASSOS_TOUR[indice].alvo);
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
    const elemento = this.tourService.obterElemento(this.passoAtual().alvo);
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
