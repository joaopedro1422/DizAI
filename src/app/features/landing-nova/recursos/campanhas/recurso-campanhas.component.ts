import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { TipoLanding } from '../../../landing/conteudo-landing';
import { PaginaRecursoComponent } from '../pagina-recurso.component';
import { CenaCampanhas, RECURSO_CAMPANHAS } from './conteudo-recurso-campanhas';
import { PainelCampanhasMockComponent } from './painel-campanhas-mock.component';

/**
 * Página do recurso Campanhas (/vendas/campanhas e /agendamentos/campanhas), na estrutura comum das páginas de recurso
 * (PaginaRecursoComponent). O mock do topo vai da oportunidade no painel ao relatório em reais, passando pelo
 * cliente que responde no WhatsApp.
 */
@Component({
  selector: 'app-recurso-campanhas',
  imports: [PaginaRecursoComponent, PainelCampanhasMockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let conteudo = c();
    <app-pagina-recurso [conteudo]="conteudo">
      <ng-template #cena let-cena>
        <app-painel-campanhas-mock [cena]="comoCena(cena)" [tipo]="conteudo.tipo" [exemplo]="conteudo.exemplo" />
      </ng-template>
    </app-pagina-recurso>
  `,
})
export class RecursoCampanhasComponent {
  readonly tipo = input.required<TipoLanding>();

  protected readonly c = computed(() => RECURSO_CAMPANHAS[this.tipo()]);
  protected readonly comoCena = (cena: string) => cena as CenaCampanhas;
}
