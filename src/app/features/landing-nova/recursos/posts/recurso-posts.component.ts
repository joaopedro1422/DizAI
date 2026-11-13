import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { TipoLanding } from '../../../landing/conteudo-landing';
import { PaginaRecursoComponent } from '../pagina-recurso.component';
import { CenaPosts, RECURSO_POSTS } from './conteudo-recurso-posts';
import { PainelPostsMockComponent } from './painel-posts-mock.component';

/**
 * Página do recurso Posts (/vendas/posts e /agendamentos/posts), na estrutura comum das páginas de recurso
 * (PaginaRecursoComponent). O mock do topo é o gerador do painel no celular, da escolha do que divulgar ao post
 * publicado no feed.
 */
@Component({
  selector: 'app-recurso-posts',
  imports: [PaginaRecursoComponent, PainelPostsMockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let conteudo = c();
    <app-pagina-recurso [conteudo]="conteudo">
      <ng-template #cena let-cena>
        <app-painel-posts-mock [cena]="comoCena(cena)" [tipo]="conteudo.tipo" [exemplo]="conteudo.exemplo" />
      </ng-template>
    </app-pagina-recurso>
  `,
})
export class RecursoPostsComponent {
  readonly tipo = input.required<TipoLanding>();

  protected readonly c = computed(() => RECURSO_POSTS[this.tipo()]);
  protected readonly comoCena = (cena: string) => cena as CenaPosts;
}
