import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { ramoDeServico } from '../../../core/models/perfil.model';
import { ConteudoRamoService } from '../../../core/services/conteudo-ramo.service';
import { PerfilService } from '../../../core/services/perfil.service';
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

/** Vídeo explicativo dos chats (cenas no template); a conversa e o resumo seguem o segmento da loja. */
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
  protected readonly exemplos = inject(ConteudoRamoService).exemplos;
  private readonly perfil = inject(PerfilService).perfil;
  protected readonly servico = computed(() => ramoDeServico(this.perfil().ramo));
  /** Quando cada mensagem aparece (s): a conversa da cena 2, a confirmação e o acompanhamento. */
  protected readonly atrasosPedido = [0.6, 3, 4.8, 6.4, 8, 9.4];
  protected readonly atrasosConfirmacao = [0.8, 2.4, 4.4, 5.6, 7];
  protected readonly atrasosAcompanhamento = [0.8, 2.6, 5, 6.8];
}
