import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { CenaVideo, VideoTutorialComponent } from '../../../shared/components/video-tutorial/video-tutorial.component';

const CENAS: CenaVideo[] = [
  { nome: 'Boas-vindas', duracao: 6000 },
  { nome: 'A IA conduz o pedido', duracao: 12000 },
  { nome: 'Resumo do pedido', duracao: 10000 },
  { nome: 'Dica 1: confirme o pedido', duracao: 10000 },
  { nome: 'Dica 2: até a entrega, é com você', duracao: 10000 },
  { nome: 'Dica 3: resolvido', duracao: 10000 },
  { nome: 'Cada um na sua parte', duracao: 6000 },
];

/** Resumo do pedido de exemplo (o mesmo da conversa da cena 2). */
const RESUMO = [
  { campo: 'Produto', valor: 'Bolo de chocolate com morango' },
  { campo: 'Tamanho', valor: '20 pessoas' },
  { campo: 'Data', valor: 'Sábado, 25/10' },
  { campo: 'Entrega', valor: 'Centro' },
];

/** Vídeo explicativo dos chats, para os ramos de produtos (cenas no template). */
@Component({
  selector: 'app-video-chats',
  imports: [VideoTutorialComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-chats.component.html',
  styleUrls: ['../../../shared/components/video-tutorial/cenas-video.css', './video-chats.component.css'],
})
export class VideoChatsComponent {
  readonly rotuloBotao = input('Entendi');
  readonly confirmar = output<void>();
  readonly fechar = output<void>();

  protected readonly cenas = CENAS;
  protected readonly resumo = RESUMO;
}
