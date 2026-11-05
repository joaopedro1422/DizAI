import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { ConteudoRamoService } from '../../../core/services/conteudo-ramo.service';
import { CenaVideo, VideoTutorialComponent } from '../../../shared/components/video-tutorial/video-tutorial.component';

export type TipoVideoAtendimento = 'produtos' | 'servicos';

/** Uma opção de card da tela, como aparece no vídeo (a escolhida fica marcada no meio da cena). */
interface OpcaoVideo {
  titulo: string;
  texto: string;
  escolhida?: boolean;
  recomendada?: boolean;
}

/** "Quando o cliente quiser fechar/agendar": as opções que a loja tem, a escolhida e a explicação. */
interface FechamentoVideo {
  titulo: string;
  modos: OpcaoVideo[];
  legenda: string;
  tituloConversa: string;
  legendaConversa: string;
}

const FECHAMENTO_PRODUTOS: FechamentoVideo = {
  titulo: 'Quando o cliente quiser fechar',
  modos: [
    { titulo: 'Me chamar na hora', texto: 'Tira as dúvidas e te chama assim que o cliente quiser comprar.' },
    { titulo: 'Coletar os dados do pedido', texto: 'Anota tudo, manda o resumo e só então te chama.', escolhida: true },
  ],
  legenda: 'Na hora: você assume a conversa. Coletar os dados: ele anota itens, data, entrega e pagamento antes de te chamar.',
  tituloConversa: 'Ele anota o pedido e te chama',
  legendaConversa: 'O pedido chega no Chats com o resumo, e você recebe o aviso no celular para confirmar.',
};

const FECHAMENTO_AGENDA: FechamentoVideo = {
  titulo: 'Quando o cliente quiser agendar',
  modos: [
    { titulo: 'Agendamento automático', texto: 'Confere a sua agenda e marca o cliente sozinho.', escolhida: true, recomendada: true },
    { titulo: 'Agendo por outro app', texto: 'Envia o seu link do Trinks, AppBarber ou Booksy.' },
    { titulo: 'Coletar os dados', texto: 'Anota tudo e te chama para confirmar.' },
  ],
  legenda: 'No automático, ele só oferece horários livres da sua agenda. Já usa outro app? Ele envia o seu link.',
  tituloConversa: 'Ele marca o horário',
  legendaConversa: 'O horário entra na sua agenda na hora, com lembrete para o cliente antes do atendimento.',
};

/** Serviços sem agenda (orçamento, visita): o assistente coleta os dados e passa para o dono. */
const FECHAMENTO_SERVICOS: FechamentoVideo = {
  titulo: 'Quando o cliente quiser agendar',
  modos: [
    { titulo: 'Coletar os dados', texto: 'Anota o que o cliente precisa e te chama para confirmar.', escolhida: true, recomendada: true },
    { titulo: 'Agendo por outro app', texto: 'Envia o seu link do Trinks, AppBarber ou Booksy.' },
  ],
  legenda: 'Ele anota o que o cliente precisa, a data e o local e te chama para fechar o orçamento.',
  tituloConversa: 'Ele anota tudo e te chama',
  legendaConversa: 'O atendimento chega no Chats com o resumo, e você recebe o aviso no celular para confirmar.',
};

const CENAS: CenaVideo[] = [
  { nome: 'Boas-vindas', duracao: 6000 },
  { nome: 'Saudação inicial', duracao: 10000 },
  { nome: 'A saudação na conversa', duracao: 8000 },
  { nome: 'Quando o cliente quiser fechar', duracao: 11000 },
  { nome: 'O fechamento na conversa', duracao: 11000 },
  { nome: 'Fotos dos trabalhos', duracao: 9000 },
  { nome: 'Instruções', duracao: 10000 },
  { nome: 'As instruções na conversa', duracao: 8000 },
  { nome: 'Catálogo', duracao: 9000 },
  { nome: 'Teste antes de ligar', duracao: 6000 },
];

@Component({
  selector: 'app-video-atendimento',
  imports: [VideoTutorialComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-atendimento.component.html',
  styleUrls: ['../../../shared/components/video-tutorial/cenas-video.css', './video-atendimento.component.css'],
})
export class VideoAtendimentoComponent {
  readonly tipo = input<TipoVideoAtendimento>('produtos');
  /** Serviços com agenda automática (as opções do fechamento mudam). */
  readonly comAgenda = input(false);
  readonly rotuloBotao = input('Entendi');
  readonly confirmar = output<void>();
  readonly fechar = output<void>();

  protected readonly cenas = CENAS;
  protected readonly exemplos = inject(ConteudoRamoService).exemplos;
  protected readonly inicial = computed(() => this.exemplos().loja.charAt(0));
  protected readonly fechamento = computed(() =>
    this.tipo() === 'produtos' ? FECHAMENTO_PRODUTOS : this.comAgenda() ? FECHAMENTO_AGENDA : FECHAMENTO_SERVICOS,
  );
  protected readonly respostaFotos = computed(() => `Tenho sim! Veja aqui: dizai.com/l/${this.exemplos().slug}`);
}
