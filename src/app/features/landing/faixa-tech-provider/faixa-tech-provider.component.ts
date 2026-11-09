import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';

/** A faixa curta de confiança entre "Para quem é" e as perguntas. */
@Component({
  selector: 'app-faixa-tech-provider',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './faixa-tech-provider.component.html',
  styleUrl: './faixa-tech-provider.component.css',
})
export class FaixaTechProviderComponent {
  protected readonly garantias = ['API oficial', 'Empresa verificada pela Meta'];
}
