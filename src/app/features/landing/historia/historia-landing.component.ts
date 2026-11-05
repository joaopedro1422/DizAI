import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import type { TipoLanding } from '../conteudo-landing';
import { HISTORIAS } from './historia';

/**
 * "Do primeiro oi ao pedido entregue": a história do atendimento contada com a rolagem. À esquerda os passos (o que
 * está no meio da tela fica ativo e enche a linha de progresso); à direita, um palco fixo no tom do público com a foto
 * e a cena do passo ativo (a conversa, o resumo, o aviso, a agenda...). No celular, cada passo traz a própria cena.
 */
@Component({
  selector: 'app-historia-landing',
  imports: [IconeComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './historia-landing.component.html',
  styleUrls: ['./historia-landing.component.css', './historia-cenas.css'],
})
export class HistoriaLandingComponent {
  readonly tipo = input.required<TipoLanding>();
  protected readonly historia = computed(() => HISTORIAS[this.tipo()]);
  protected readonly ativo = signal(0);

  private readonly passos = viewChildren<ElementRef<HTMLElement>>('passo');

  constructor() {
    let observador: IntersectionObserver | undefined;
    afterNextRender(() => {
      // o passo que cruza a faixa do meio da tela é o ativo
      observador = new IntersectionObserver(
        (entradas) => {
          for (const entrada of entradas) {
            if (entrada.isIntersecting) {
              this.ativo.set(Number((entrada.target as HTMLElement).dataset['indice']));
            }
          }
        },
        { rootMargin: '-45% 0px -45% 0px' },
      );
      this.passos().forEach((passo) => observador!.observe(passo.nativeElement));
    });
    inject(DestroyRef).onDestroy(() => observador?.disconnect());
  }

  protected numero(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
}
