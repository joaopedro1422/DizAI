import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { CenaVideo, VideoTutorialComponent } from '../../../shared/components/video-tutorial/video-tutorial.component';

export type TipoVideoPerguntas = 'produtos' | 'servicos';

interface PerguntaExemplo {
  pergunta: string;
  resposta: string;
}

/** Os mesmos passos para os dois tipos; só mudam a loja e as perguntas. */
interface ExemplosPerguntas {
  loja: string;
  inicial: string;
  lista: PerguntaExemplo[];
  /** Pergunta cadastrada na cena 2; a resposta aparece em linhas. */
  nova: { pergunta: string; linhas: string[] };
  conversa: { cliente: string; assistente: string; agradecimento: string };
  /** O que o assistente não soube responder (vira sugestão). */
  semResposta: PerguntaExemplo;
  dicaFinal: string;
}

const EXEMPLOS: Record<TipoVideoPerguntas, ExemplosPerguntas> = {
  produtos: {
    loja: 'Doces da Ana',
    inicial: 'D',
    lista: [
      { pergunta: 'Vocês fazem entrega?', resposta: 'Entregamos no bairro por R$ 5. Retirada grátis.' },
      { pergunta: 'Quais as formas de pagamento?', resposta: 'Pix, cartão e dinheiro.' },
      { pergunta: 'Com quanto tempo preciso encomendar?', resposta: 'Bolos com 2 dias de antecedência.' },
    ],
    nova: {
      pergunta: 'Vocês fazem entrega?',
      linhas: ['Fazemos sim! 🛵', 'Entregamos no bairro por R$ 5', 'e a retirada aqui é grátis.'],
    },
    conversa: {
      cliente: 'vcs entregam aqui no bairro?',
      assistente: 'Entregamos sim! 🛵 Sai por R$ 5, e a retirada aqui é grátis.',
      agradecimento: 'Show, obrigada!',
    },
    semResposta: {
      pergunta: 'Vocês fazem bolo sem lactose?',
      resposta: 'Fazemos sim! Sob encomenda, com 3 dias de antecedência.',
    },
    dicaFinal: 'Comece por entrega, pagamento e prazo.',
  },
  servicos: {
    loja: 'Barbearia do Léo',
    inicial: 'L',
    lista: [
      { pergunta: 'Aceita cartão?', resposta: 'Sim! Pix, débito e crédito.' },
      { pergunta: 'Tem estacionamento?', resposta: 'Tem vaga na rua, bem em frente.' },
      { pergunta: 'Atende sem horário marcado?', resposta: 'Encaixamos quando a agenda deixa.' },
    ],
    nova: {
      pergunta: 'Quais as formas de pagamento?',
      linhas: ['Aceitamos Pix, débito e crédito 💳', 'e parcelamos no cartão', 'acima de R$ 150.'],
    },
    conversa: {
      cliente: 'aceita cartão?',
      assistente: 'Aceitamos sim! 💳 Pix, débito e crédito.',
      agradecimento: 'Fechou, valeu!',
    },
    semResposta: {
      pergunta: 'Vocês fazem pigmentação de barba?',
      resposta: 'Fazemos sim! Leva 30 min e sai por R$ 25.',
    },
    dicaFinal: 'Comece por pagamento, endereço e atrasos.',
  },
};

const CENAS: CenaVideo[] = [
  { nome: 'Boas-vindas', duracao: 6000 },
  { nome: 'Como cadastrar', duracao: 9000 },
  { nome: 'Na conversa', duracao: 10000 },
  { nome: 'Quando o assistente não sabe', duracao: 11000 },
  { nome: 'Vira sugestão', duracao: 11000 },
  { nome: 'Do seu jeito', duracao: 6000 },
];

/** Vídeo explicativo da tela de perguntas frequentes (cenas no template). */
@Component({
  selector: 'app-video-perguntas',
  imports: [VideoTutorialComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-perguntas.component.html',
  styleUrls: ['../../../shared/components/video-tutorial/cenas-video.css', './video-perguntas.component.css'],
})
export class VideoPerguntasComponent {
  readonly tipo = input<TipoVideoPerguntas>('produtos');
  readonly rotuloBotao = input('Entendi');
  readonly confirmar = output<void>();
  readonly fechar = output<void>();

  protected readonly cenas = CENAS;
  protected readonly exemplo = computed(() => EXEMPLOS[this.tipo()]);
}
