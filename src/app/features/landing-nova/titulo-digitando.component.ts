import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject, input, signal } from '@angular/core';

import { esperar, semMovimento } from './movimento';

const FRASES = ['sem resposta', 'indo embora'];
/** "indo embora" aparece 3 vezes e o título para em "sem resposta", para não distrair quem está lendo. */
const TROCAS = 6;

/**
 * Um título com a parte final apagada e escrita como em uma máquina de escrever. Padrão (landings): "Nenhum cliente
 * sem resposta" ↔ "indo embora", 6 trocas. O hub passa o próprio início e as próprias frases ("Um assistente que"
 * atende, agenda...). As frases ficam invisíveis na mesma célula da grade e reservam a largura da maior, para o
 * título não pular. Os pontinhos de "digitando" somem enquanto a frase troca.
 */
@Component({
  selector: 'app-titulo-digitando',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span aria-hidden="true">{{ inicio() }}</span>
    @if (quebra()) {
      <br />
    } @else {
      {{ ' ' }}
    }
    <span class="troca" aria-hidden="true">
      @for (frase of frases(); track frase) {
        <span class="troca__reserva">{{ frase }}</span>
      }
      <span class="troca__texto">{{ texto() }}</span>
    </span>
    <span class="digita" [class.oculto]="!pontos()" aria-hidden="true"><i></i><i></i><i></i></span>
  `,
})
export class TituloDigitandoComponent {
  /** Quebra a linha antes da parte que troca (o título centralizado do hub). */
  readonly quebra = input(false);
  readonly inicio = input('Nenhum cliente');
  readonly frases = input<string[]>(FRASES);
  /** Quantas vezes a frase troca antes de parar. */
  readonly trocas = input(TROCAS);
  /** Quanto tempo cada frase fica na tela. */
  readonly pausaMs = input(4000);

  protected readonly texto = signal(FRASES[0]);
  protected readonly pontos = signal(true);

  constructor() {
    let ativo = true;
    inject(DestroyRef).onDestroy(() => (ativo = false));
    afterNextRender(() => {
      this.texto.set(this.frases()[0]);
      if (!semMovimento()) {
        void this.trocar(() => ativo);
      }
    });
  }

  private async trocar(ativo: () => boolean): Promise<void> {
    let atual = 0;
    const frases = this.frases();
    for (let troca = 0; troca < this.trocas(); troca++) {
      await esperar(this.pausaMs());
      if (!ativo()) return;
      this.pontos.set(false);
      const frase = frases[atual];
      for (let n = frase.length - 1; n >= 0; n--) {
        this.texto.set(frase.slice(0, n) || '​');
        await esperar(38);
      }
      await esperar(220);
      atual = (atual + 1) % frases.length;
      const nova = frases[atual];
      for (let n = 1; n <= nova.length; n++) {
        if (!ativo()) return;
        this.texto.set(nova.slice(0, n));
        await esperar(85);
      }
      await esperar(150);
      this.pontos.set(true);
    }
  }
}
