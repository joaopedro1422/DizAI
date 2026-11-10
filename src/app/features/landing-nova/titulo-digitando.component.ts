import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject, input, signal } from '@angular/core';

import { esperar, semMovimento } from './movimento';

const FRASES = ['sem resposta', 'indo embora'];
/** "indo embora" aparece 3 vezes e o título para em "sem resposta", para não distrair quem está lendo. */
const TROCAS = 6;

/**
 * "Nenhum cliente sem resposta" com a parte final apagada e escrita como em uma máquina de escrever
 * ("sem resposta" ↔ "indo embora"). As duas frases ficam invisíveis na mesma célula da grade e reservam a largura
 * da maior, para o título não pular. Os pontinhos de "digitando" somem enquanto a frase troca.
 */
@Component({
  selector: 'app-titulo-digitando',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span aria-hidden="true">Nenhum cliente</span>
    @if (quebra()) {
      <br />
    } @else {
      {{ ' ' }}
    }
    <span class="troca" aria-hidden="true">
      @for (frase of frases; track frase) {
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

  protected readonly frases = FRASES;
  protected readonly texto = signal(FRASES[0]);
  protected readonly pontos = signal(true);

  constructor() {
    let ativo = true;
    inject(DestroyRef).onDestroy(() => (ativo = false));
    afterNextRender(() => {
      if (!semMovimento()) {
        void this.trocar(() => ativo);
      }
    });
  }

  private async trocar(ativo: () => boolean): Promise<void> {
    let atual = 0;
    for (let troca = 0; troca < TROCAS; troca++) {
      await esperar(4000);
      if (!ativo()) return;
      this.pontos.set(false);
      const frase = FRASES[atual];
      for (let n = frase.length - 1; n >= 0; n--) {
        this.texto.set(frase.slice(0, n) || '​');
        await esperar(38);
      }
      await esperar(220);
      atual = (atual + 1) % FRASES.length;
      const nova = FRASES[atual];
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
