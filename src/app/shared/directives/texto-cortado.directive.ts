import { DestroyRef, Directive, ElementRef, afterNextRender, inject, signal } from '@angular/core';

/**
 * Diz se o texto com `line-clamp` foi cortado de verdade (mede o elemento, não conta caracteres): o "ver mais" só
 * aparece quando falta texto. Acompanha a largura (girar o celular, redimensionar a janela).
 * Uso: <span appTextoCortado #corte="textoCortado">…</span> @if (corte.cortado()) { ver mais }
 */
@Directive({ selector: '[appTextoCortado]', exportAs: 'textoCortado' })
export class TextoCortadoDirective {
  readonly cortado = signal(false);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destruir = inject(DestroyRef);
    const medir = () => this.cortado.set(el.scrollHeight > el.clientHeight + 1);
    afterNextRender(() => {
      medir();
      const observador = new ResizeObserver(medir);
      observador.observe(el);
      destruir.onDestroy(() => observador.disconnect());
    });
  }
}
