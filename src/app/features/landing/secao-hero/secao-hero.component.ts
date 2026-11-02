import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { DemonstracaoConversaComponent } from '../demonstracao-conversa/demonstracao-conversa.component';

/** Primeira dobra da landing: promessa, chamadas para ação e o celular com a conversa de exemplo. */
@Component({
  selector: 'app-secao-hero',
  imports: [RouterLink, IconeComponent, DemonstracaoConversaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secao-hero.component.html',
  styleUrl: './secao-hero.component.css',
})
export class SecaoHeroComponent {
  protected readonly garantias = [
    'No seu número de sempre',
    'Para todo tipo de negócio',
    'Você no controle de tudo',
    'Pronto em poucos minutos',
  ];
}
