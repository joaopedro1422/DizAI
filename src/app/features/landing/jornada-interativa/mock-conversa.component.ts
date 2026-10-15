import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

type TipoConversa = 'produto' | 'fechamento' | 'galeria' | 'domingo';

@Component({
  selector: 'app-mock-conversa-jornada',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mock-conversa.component.html',
  styleUrl: './mock-conversa.component.css',
})
export class MockConversaJornadaComponent {
  @Input() tipo: TipoConversa = 'produto';
}
