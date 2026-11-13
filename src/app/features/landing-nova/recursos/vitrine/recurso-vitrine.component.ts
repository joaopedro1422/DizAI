import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';

import type { TipoLanding } from '../../../landing/conteudo-landing';
import { VitrineMockComponent } from '../../landing/vitrine-mock.component';
import { PaginaRecursoComponent } from '../pagina-recurso.component';
import { CenaVitrine, RECURSO_VITRINE } from './conteudo-recurso-vitrine';
import { PainelVitrineMockComponent } from './painel-vitrine-mock.component';

/**
 * Página do recurso Vitrine (/vendas/vitrine e /agendamentos/vitrine, o tipo vem do data da rota), na estrutura comum
 * das páginas de recurso (PaginaRecursoComponent). Aqui ficam as cenas do mock (o painel de verdade no celular:
 * personalizar, fotos, mapa, feedback, [agenda] e a vitrine pronta) e, nos serviços, o cartão da agenda online.
 */
@Component({
  selector: 'app-recurso-vitrine',
  imports: [PaginaRecursoComponent, VitrineMockComponent, PainelVitrineMockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './recurso-vitrine.component.html',
  styleUrl: './recurso-vitrine.css',
})
export class RecursoVitrineComponent {
  readonly tipo = input.required<TipoLanding>();

  protected readonly c = computed(() => RECURSO_VITRINE[this.tipo()]);
  protected readonly comoCena = (cena: string) => cena as CenaVitrine;
}
