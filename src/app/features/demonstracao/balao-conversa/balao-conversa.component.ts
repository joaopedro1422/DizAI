import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { SegmentoDemonstracao } from '../conversas-demonstracao';
import { ItemConversa } from '../reprodutor-conversa';

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
