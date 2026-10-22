import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { SegmentoDemonstracao } from '../conversas-demonstracao';
import { ItemConversa } from '../reprodutor-conversa';

/**
 * Uma mensagem da conversa de demonstração, com o visual do WhatsApp: texto (com listas e *negrito*),
 * PDF, cardápio em imagem, link com prévia, aviso do DizAI e separador de dia. A notificação fica com quem usa.
 */
@Component({
  selector: 'app-balao-conversa',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './balao-conversa.component.html',
  styleUrl: './balao-conversa.component.css',
})
export class BalaoConversaComponent {
  readonly item = input.required<ItemConversa>();
  readonly segmento = input.required<SegmentoDemonstracao>();
}
