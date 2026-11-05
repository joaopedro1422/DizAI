import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, signal } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { CONTEUDO_LANDING, TipoLanding } from '../conteudo-landing';

/**
 * O problema, mostrado em vez de contado: à esquerda o título e as três dores numa lista editorial; à direita a tela de
 * bloqueio do celular do lojista com as mensagens de clientes chegando e ficando sem resposta (caem em cascata).
 */
@Component({
  selector: 'app-problema-landing',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './problema-landing.component.html',
  styleUrl: './problema-landing.component.css',
  host: { '[class.visivel]': 'visivel()' },
})
export class ProblemaLandingComponent {
  readonly tipo = input.required<TipoLanding>();
  protected readonly dores = computed(() => CONTEUDO_LANDING[this.tipo()].dores);
  protected readonly problema = computed(() => CONTEUDO_LANDING[this.tipo()].problema);
  /** As mensagens só começam a cair quando a tela de bloqueio aparece (e ficam). */
  protected readonly visivel = signal(false);

  constructor() {
    const elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    let observador: IntersectionObserver | undefined;
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') {
        this.visivel.set(true);
        return;
      }
      observador = new IntersectionObserver(([entrada]) => {
        if (entrada.isIntersecting) {
          this.visivel.set(true);
          observador?.disconnect();
        }
      }, { threshold: 0.3 });
      observador.observe(elemento);
    });
    inject(DestroyRef).onDestroy(() => observador?.disconnect());
  }
}
