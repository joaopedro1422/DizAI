import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { EXEMPLOS_GALERIA, FotoExemplo } from './exemplos-galeria';

/** Mesmo ritmo do celular do topo da página. */
const INTERVALO_TROCA_MS = 7000;

const BENEFICIOS = [
  'Fotos separadas por tópico, como "unhas em gel" ou "bolos de aniversário".',
  'Com a sua logo e a cor da sua marca.',
  'Um link só, que também serve para a bio do Instagram.',
];

/**
 * Seção da landing que mostra a galeria pública da loja dentro de um celular,
 * com a conversa em que o assistente envia o link.
 * Troca sozinha entre lojas de exemplo; pausa com o mouse ou o foco em cima
 * e fica parada para quem pediu menos movimento no sistema.
 */
@Component({
  selector: 'app-secao-galeria',
  imports: [RouterLink, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secao-galeria.component.html',
  styleUrl: './secao-galeria.component.css',
})
export class SecaoGaleriaComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly beneficios = BENEFICIOS;
  protected readonly indiceAtual = signal(0);
  protected readonly pausado = signal(false);

  protected readonly exemploAtual = computed(() => EXEMPLOS_GALERIA[this.indiceAtual()]);
  protected readonly inicialLoja = computed(() => this.exemploAtual().nomeLoja.charAt(0));

  ngOnInit(): void {
    if (this.prefereMenosMovimento()) {
      return;
    }
    const temporizador = setInterval(() => this.avancarAutomaticamente(), INTERVALO_TROCA_MS);
    this.destroyRef.onDestroy(() => clearInterval(temporizador));
  }

  protected fundoDaFoto(foto: FotoExemplo): string {
    return `radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.55), transparent 45%), linear-gradient(150deg, ${foto.claro}, ${foto.escuro})`;
  }

  private avancarAutomaticamente(): void {
    if (this.pausado() || document.hidden) {
      return;
    }
    this.indiceAtual.update((indice) => (indice + 1) % EXEMPLOS_GALERIA.length);
  }

  private prefereMenosMovimento(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
