import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { DemonstracaoConversaComponent } from '../demonstracao-conversa/demonstracao-conversa.component';
import { CONTEUDO_LANDING, TipoLanding } from '../conteudo-landing';

/** Primeira dobra da landing: promessa, chamadas para ação e o celular com a conversa de exemplo. */
@Component({
  selector: 'app-secao-hero',
  imports: [RouterLink, IconeComponent, DemonstracaoConversaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secao-hero.component.html',
  styleUrl: './secao-hero.component.css',
})
export class SecaoHeroComponent {
  readonly tipo = input.required<TipoLanding>();
  protected readonly hero = computed(() => CONTEUDO_LANDING[this.tipo()].hero);
  protected readonly cadastro = computed(() => ({ tipo: this.tipo() }));
}
