import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { EXEMPLOS_CONVERSA } from './exemplos-conversa';

const INTERVALO_TROCA_MS = 9000;

/**
 * Celular com conversas de exemplo no estilo do WhatsApp.
 * Troca sozinho entre os tipos de negócio; pausa quando o visitante passa o mouse ou foca,
 * e não troca sozinho para quem pediu menos movimento no sistema.
 */
@Component({
  selector: 'app-demonstracao-conversa',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './demonstracao-conversa.component.html',
  styleUrl: './demonstracao-conversa.component.css',
  host: {
    '(mouseenter)': 'pausado.set(true)',
    '(mouseleave)': 'pausado.set(false)',
    '(focusin)': 'pausado.set(true)',
    '(focusout)': 'pausado.set(false)',
  },
})
export class DemonstracaoConversaComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly exemplos = EXEMPLOS_CONVERSA;
  protected readonly indiceAtual = signal(0);
  protected readonly pausado = signal(false);

  protected readonly exemploAtual = computed(() => this.exemplos[this.indiceAtual()]);
  protected readonly inicialLoja = computed(() => this.exemploAtual().nomeLoja.charAt(0));

  ngOnInit(): void {
    if (this.prefereMenosMovimento()) {
      return;
    }
    const temporizador = setInterval(() => this.avancarAutomaticamente(), INTERVALO_TROCA_MS);
    this.destroyRef.onDestroy(() => clearInterval(temporizador));
  }

  protected mostrarExemplo(indice: number): void {
    this.indiceAtual.set(indice);
  }

  private avancarAutomaticamente(): void {
    if (this.pausado() || document.hidden) {
      return;
    }
    this.indiceAtual.update((indice) => (indice + 1) % this.exemplos.length);
  }

  private prefereMenosMovimento(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
