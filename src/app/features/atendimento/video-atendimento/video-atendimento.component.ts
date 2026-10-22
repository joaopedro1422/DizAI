import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { CenaVideo, VideoTutorialComponent } from '../../../shared/components/video-tutorial/video-tutorial.component';

export type TipoVideoAtendimento = 'produtos' | 'servicos';

/** Os mesmos passos para os dois tipos; só mudam a loja e os exemplos. */
interface ExemplosAtendimento {
  loja: string;
  inicial: string;
  saudacao: string[];
  regras: string[];
  conversaRegra: { cliente: string; assistente: string };
  catalogo: string;
}

const EXEMPLOS: Record<TipoVideoAtendimento, ExemplosAtendimento> = {
  produtos: {
    loja: 'Doces da Ana',
    inicial: 'D',
    saudacao: ['Olá! Que bom te ver aqui na Doces da Ana 🎂', '🕘 Seg a sáb, das 9h às 18h', '🛍️ Cardápio: dizai.com/l/doces-da-ana'],
    regras: [
      'Chame o cliente pelo nome',
      'Use no máximo 1 emoji: 🎂 ou 💖',
      'Encomendas só com 50% de sinal no Pix',
      'Não aceitamos vale-alimentação',
    ],
    conversaRegra: {
      cliente: 'Posso pagar com vale-alimentação?',
      assistente: 'Infelizmente não aceitamos vale-alimentação. Aceitamos Pix, débito e crédito.',
    },
    catalogo: 'Cardapio-Doces-da-Ana.pdf',
  },
  servicos: {
    loja: 'Studio Bella',
    inicial: 'B',
    saudacao: ['Olá! Que bom te ver aqui no Studio Bella 💅', '🕘 Ter a sáb, das 9h às 19h', '📅 Agende: dizai.com/l/studio-bella/agenda'],
    regras: [
      'Chame a cliente pelo nome',
      'Use no máximo 1 emoji: 💅 ou ✨',
      'Atrasos acima de 15 min: remarcar',
      'Não atendemos aos domingos',
    ],
    conversaRegra: {
      cliente: 'Posso chegar uns 20 min atrasada?',
      assistente: 'Atrasos acima de 15 minutos precisam ser remarcados. Se precisar, te ajudo a achar outro horário.',
    },
    catalogo: 'Tabela-de-precos.pdf',
  },
};

const CENAS: CenaVideo[] = [
  { nome: 'Boas-vindas', duracao: 6000 },
  { nome: 'Saudação inicial', duracao: 10000 },
  { nome: 'A saudação na conversa', duracao: 9000 },
  { nome: 'Instruções', duracao: 11000 },
  { nome: 'As instruções na conversa', duracao: 9000 },
  { nome: 'Catálogo', duracao: 9000 },
  { nome: 'Teste antes de ligar', duracao: 6000 },
];

/** Vídeo explicativo da tela "Seu assistente" (cenas no template). */
@Component({
  selector: 'app-video-atendimento',
  imports: [VideoTutorialComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-atendimento.component.html',
  styleUrls: ['../../../shared/components/video-tutorial/cenas-video.css', './video-atendimento.component.css'],
})
export class VideoAtendimentoComponent {
  readonly tipo = input<TipoVideoAtendimento>('produtos');
  readonly rotuloBotao = input('Entendi');
  readonly confirmar = output<void>();
  readonly fechar = output<void>();

  protected readonly cenas = CENAS;
  protected readonly exemplo = computed(() => EXEMPLOS[this.tipo()] ?? EXEMPLOS.produtos);
}
