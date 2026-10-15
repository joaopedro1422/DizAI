import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { TelefoneDemoComponent } from './telefone-demo.component';

@Component({
  selector: 'app-mock-vitrine-jornada',
  imports: [IconeComponent, TelefoneDemoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mock-vitrine.component.html',
  styleUrl: './mock-vitrine.component.css',
})
export class MockVitrineJornadaComponent {
  protected readonly logoUrl = '/landing/galeria/pedacinho.png';
}
