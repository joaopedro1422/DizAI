import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';

/** Largura do celular em que as telas do painel são desenhadas (o tamanho real do app). */
const LARGURA_REAL = 375;

/**
 * Tela do painel por cima do WhatsApp, no celular da demonstração: o conteúdo é desenhado no tamanho real (375 px)
 * e reduzido para caber na tela, seja qual for o tamanho do celular. O transform também prende os elementos
 * `position: fixed` (a janela que sobe de baixo) dentro do celular.
 */
@Component({
  selector: 'app-moldura-tela-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="tela" [style.--escala]="escala()"><ng-content /></div>`,
  styles: `
    :host {
      position: absolute;
      inset: 0;
      z-index: 6;
      overflow: hidden;
      background: var(--cor-fundo);
      animation: moldura-entra 0.35s ease both;
    }

    .tela {
      position: relative;
      width: ${LARGURA_REAL}px;
      height: calc(100% / var(--escala));
      overflow: hidden;
      background: var(--cor-fundo);
      color: var(--cor-texto);
      font-size: 16px;
      text-align: left;
      transform: scale(var(--escala));
      transform-origin: 0 0;
    }

    @keyframes moldura-entra {
      from { opacity: 0; transform: translateX(14px); }
      to { opacity: 1; transform: none; }
    }

    @media (prefers-reduced-motion: reduce) {
      :host { animation: none; }
    }
  `,
})
export class MolduraTelaDemoComponent {
  protected readonly escala = signal(0.8);

  constructor() {
    const elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    let observador: ResizeObserver | undefined;
    afterNextRender(() => {
      const medir = () => this.escala.set(elemento.clientWidth / LARGURA_REAL || 0.8);
      medir();
      observador = new ResizeObserver(medir);
      observador.observe(elemento);
    });
    inject(DestroyRef).onDestroy(() => observador?.disconnect());
  }
}
