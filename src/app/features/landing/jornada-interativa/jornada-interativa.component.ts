import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';

import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { MockAgendaPublicaJornadaComponent } from './mock-agenda-publica.component';
import { MockChatsJornadaComponent } from './mock-chats.component';
import { MockConversaJornadaComponent } from './mock-conversa.component';
import { MockGaleriaJornadaComponent } from './mock-galeria.component';
import { MockMinhaAgendaJornadaComponent } from './mock-minha-agenda.component';
import { MockPainelJornadaComponent } from './mock-painel.component';
import { MockVitrineJornadaComponent } from './mock-vitrine.component';

/** Tempo padrão de cada cena; as telas com mais passos (agenda, chats) ficam mais tempo. */
const DURACAO_PADRAO_MS = 9000;

type TipoJornada = 'produtos' | 'servicos';

/** Cada cena diz o texto ao lado e qual tela mostra no palco. */
type TelaCena =
  | 'produto'
  | 'conversa-produto'
  | 'instrucoes'
  | 'conversa-domingo'
  | 'galeria'
  | 'conversa-galeria'
  | 'vitrine'
  | 'fechamento'
  | 'conversa-fechamento'
  | 'chats'
  | 'servico'
  | 'conversa-servico'
  | 'conversa-horarios'
  | 'agenda-publica'
  | 'conversa-agendamento'
  | 'minha-agenda';

interface CenaJornada {
  titulo: string;
  descricao: string;
  rotulo: string;
  tela: TelaCena;
  /** Descrição do palco para leitores de tela. */
  rotuloTela: string;
  duracaoMs?: number;
}

/** Loja de bolos: cadastro, atendimento, regra, galeria e o pedido chegando nos Chats. */
const CENAS_PRODUTOS: CenaJornada[] = [
  {
    rotulo: '01 · Cadastre',
    titulo: 'Cadastre um produto ou serviço',
    descricao: 'A descrição é digitada no painel e o produto é salvo, com sabores e massas para o assistente consultar.',
    tela: 'produto',
    rotuloTela: 'Cadastro de produto no painel mobile',
  },
  {
    rotulo: '02 · Atenda',
    titulo: 'Uma pergunta. Uma resposta precisa.',
    descricao: 'O cliente pergunta pelos sabores da torta para 20 pessoas. O assistente responde com as opções cadastradas.',
    tela: 'conversa-produto',
    rotuloTela: 'Pergunta sobre sabores e resposta do assistente',
  },
  {
    rotulo: '03 · Oriente',
    titulo: 'Defina uma regra do seu negócio',
    descricao: 'Escreva a instrução no painel. O assistente vai respeitá-la durante os atendimentos.',
    tela: 'instrucoes',
    rotuloTela: 'Instrução obrigatória sendo cadastrada no painel mobile',
  },
  {
    rotulo: '04 · Aplique',
    titulo: 'A regra é respeitada na conversa',
    descricao: 'Quando o cliente pergunta sobre uma entrega no domingo, o assistente explica que não é possível.',
    tela: 'conversa-domingo',
    rotuloTela: 'Pergunta sobre entrega no domingo e resposta do assistente',
  },
  {
    rotulo: '05 · Apresente',
    titulo: 'Organize sua galeria',
    descricao: 'A tela da galeria reúne seus tópicos, fotos e a personalização da vitrine.',
    tela: 'galeria',
    rotuloTela: 'Adicionando uma foto e personalizando a vitrine no painel mobile',
  },
  {
    rotulo: '06 · Compartilhe',
    titulo: 'Suas fotos chegam com um link',
    descricao: 'Quando o cliente pede para ver seus trabalhos, o assistente responde com o link da galeria.',
    tela: 'conversa-galeria',
    rotuloTela: 'Pedido de fotos e resposta com o link da galeria',
  },
  {
    rotulo: '07 · Encante',
    titulo: 'A galeria pública da sua loja',
    descricao: 'O cliente abre o link e encontra seus trabalhos organizados em uma página com a identidade da sua loja.',
    tela: 'vitrine',
    rotuloTela: 'Galeria pública da loja aberta no celular',
  },
  {
    rotulo: '08 · Configure',
    titulo: 'Escolha como fechar os pedidos',
    descricao: 'Defina que o assistente deve coletar os dados do pedido e escreva o que precisa saber: nome, retirada ou entrega e data.',
    tela: 'fechamento',
    rotuloTela: 'Configuração de coleta de dados do pedido no painel mobile',
  },
  {
    rotulo: '09 · Feche',
    titulo: 'O assistente coleta os dados',
    descricao: 'Quando o cliente decide comprar, a IA pede as informações que você configurou para organizar o pedido.',
    tela: 'conversa-fechamento',
    rotuloTela: 'Assistente solicitando os dados necessários para fechar o pedido',
  },
  {
    rotulo: '10 · Confirme',
    titulo: 'O pedido chega pronto para você',
    descricao: 'Você recebe um aviso no celular e a conversa aparece nos Chats com o resumo do pedido. É só confirmar com o cliente.',
    tela: 'chats',
    rotuloTela: 'Aviso de pedido no celular e a tela de Chats com o resumo do pedido',
    duracaoMs: 10000,
  },
];

/** Manicure (Sálvia Nail Studio): cadastro do serviço, horários livres, página de agendamento e a agenda. */
const CENAS_SERVICOS: CenaJornada[] = [
  {
    rotulo: '01 · Cadastre',
    titulo: 'Cadastre seus serviços',
    descricao: 'Nome, preço e duração. A agenda usa a duração para saber quais horários cabem cada serviço.',
    tela: 'servico',
    rotuloTela: 'Cadastro de serviço com a duração do atendimento no painel mobile',
  },
  {
    rotulo: '02 · Atenda',
    titulo: 'Uma pergunta. Uma resposta precisa.',
    descricao: 'A cliente pergunta sobre a esmaltação em gel. O assistente responde com o preço e os detalhes cadastrados.',
    tela: 'conversa-servico',
    rotuloTela: 'Pergunta sobre o serviço e resposta do assistente',
  },
  {
    rotulo: '03 · Ofereça',
    titulo: 'Só horários que estão livres',
    descricao: 'Ela pergunta se tem horário. O assistente consulta a sua agenda, lista os horários livres e indica a página de agendamento.',
    tela: 'conversa-horarios',
    rotuloTela: 'Assistente listando os horários livres e o link da página de agendamento',
  },
  {
    rotulo: '04 · Agende',
    titulo: 'Sua página de agendamento',
    descricao: 'A cliente escolhe o serviço, o dia e o horário e envia tudo pronto pelo WhatsApp.',
    tela: 'agenda-publica',
    rotuloTela: 'Página de agendamento da loja aberta no celular',
    duracaoMs: 11000,
  },
  {
    rotulo: '05 · Confirme',
    titulo: 'Agendado na hora',
    descricao: 'O assistente confere a agenda e confirma o horário com o resumo do agendamento.',
    tela: 'conversa-agendamento',
    rotuloTela: 'Mensagem da página de agendamento e a confirmação do horário',
  },
  {
    rotulo: '06 · Organize',
    titulo: 'Tudo na sua agenda',
    descricao: 'O horário entra na sua agenda, marcado pelo assistente, sem você precisar responder nada.',
    tela: 'minha-agenda',
    rotuloTela: 'Tela Minha Agenda com o novo horário',
  },
];

const CENAS: Record<TipoJornada, CenaJornada[]> = { produtos: CENAS_PRODUTOS, servicos: CENAS_SERVICOS };

@Component({
  selector: 'app-jornada-interativa',
  imports: [
    RouterLink,
    IconeComponent,
    MockAgendaPublicaJornadaComponent,
    MockChatsJornadaComponent,
    MockConversaJornadaComponent,
    MockGaleriaJornadaComponent,
    MockMinhaAgendaJornadaComponent,
    MockPainelJornadaComponent,
    MockVitrineJornadaComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './jornada-interativa.component.html',
  styleUrl: './jornada-interativa.component.css',
})
export class JornadaInterativaComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private temporizador?: number;
  private observer?: IntersectionObserver;
  private movimentoReduzido = false;

  @ViewChild('secaoJornada') private secaoJornada!: ElementRef<HTMLElement>;

  protected readonly tipo = signal<TipoJornada>('produtos');
  protected readonly cenas = computed(() => CENAS[this.tipo()]);
  protected readonly indiceCena = signal(0);
  protected readonly iniciada = signal(false);
  protected readonly pausada = signal(true);
  protected readonly cenaAtual = computed(() => this.cenas()[this.indiceCena()]);

  ngAfterViewInit(): void {
    this.movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.observer = new IntersectionObserver((entradas) => {
      if (entradas.some((entrada) => entrada.isIntersecting)) {
        this.iniciada.set(true);
        if (!this.movimentoReduzido) {
          this.pausada.set(false);
        }
        this.agendarProxima();
        this.observer?.disconnect();
      }
    });
    this.observer.observe(this.secaoJornada.nativeElement);

    this.destroyRef.onDestroy(() => {
      window.clearTimeout(this.temporizador);
      this.observer?.disconnect();
    });
  }

  /** Produtos ou Serviços: começa o fluxo escolhido do início. */
  protected escolherTipo(tipo: TipoJornada): void {
    if (tipo === this.tipo()) {
      return;
    }
    this.tipo.set(tipo);
    this.iniciada.set(true);
    this.irPara(0);
  }

  protected alternarReproducao(): void {
    this.iniciada.set(true);
    this.pausada.update((valor) => !valor);
    this.agendarProxima();
  }

  protected anterior(): void {
    this.irPara((this.indiceCena() - 1 + this.cenas().length) % this.cenas().length);
  }

  protected avancar(): void {
    this.irPara((this.indiceCena() + 1) % this.cenas().length);
  }

  /** "01", "02"… "10" (o contador da navegação). */
  protected numero(valor: number): string {
    return String(valor).padStart(2, '0');
  }

  private irPara(indice: number): void {
    this.indiceCena.set(indice);
    this.agendarProxima();
  }

  /** Cada cena tem o seu tempo: ao mudar de cena (sozinha ou pelas setas), o relógio recomeça. */
  private agendarProxima(): void {
    window.clearTimeout(this.temporizador);
    if (this.pausada()) {
      return;
    }
    this.temporizador = window.setTimeout(() => {
      if (document.hidden) {
        this.agendarProxima();
        return;
      }
      this.avancar();
    }, this.cenaAtual().duracaoMs ?? DURACAO_PADRAO_MS);
  }
}
