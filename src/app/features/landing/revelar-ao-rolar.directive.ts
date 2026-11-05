import { DestroyRef, Directive, ElementRef, afterNextRender, inject, signal } from '@angular/core';

/**
 * Entrada da seção ao rolar: a seção começa um pouco abaixo e transparente e sobe quando chega na tela (uma vez só).
 * O desenho fica em `landing-page.component.css` (.revelar / .revelado); com movimento reduzido, nada se mexe.
 */
@Directive({
  selector: '[appRevelar]',
  host: { class: 'revelar', '[class.revelado]': 'revelado()' },
})
export class RevelarAoRolarDirective {
  protected readonly revelado = signal(false);

  constructor() {
    const elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    let observador: IntersectionObserver | undefined;
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') {
        this.revelado.set(true);
        return;
      }
      observador = new IntersectionObserver(
        ([entrada]) => {
          if (entrada.isIntersecting) {
            this.revelado.set(true);
            observador?.disconnect();
          }
        },
        { threshold: 0, rootMargin: '0px 0px -12% 0px' },
      );
      observador.observe(elemento);
    });
    inject(DestroyRef).onDestroy(() => observador?.disconnect());
  }
}
