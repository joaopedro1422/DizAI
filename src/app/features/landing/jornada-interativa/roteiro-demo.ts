import { DestroyRef, WritableSignal } from '@angular/core';

/**
 * Roteiro das telas de demonstração da landing: agenda ações no tempo (tocar um botão, abrir um modal)
 * e "digita" textos letra a letra. Tudo é cancelado quando a cena sai da tela.
 * Com movimento reduzido, quem usa mostra direto o estado final.
 */
export class RoteiroDemo {
  readonly movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly temporizadores: number[] = [];

  constructor(destroyRef: DestroyRef) {
    destroyRef.onDestroy(() => this.temporizadores.forEach((temporizador) => window.clearTimeout(temporizador)));
  }

  /** Executa a ação depois de `ms` milissegundos do início da cena. */
  em(ms: number, acao: () => void): void {
    this.temporizadores.push(window.setTimeout(acao, ms));
  }

  /** Escreve o texto aos poucos no sinal, começando em `inicioMs`. Devolve o instante em que termina. */
  digitar(alvo: WritableSignal<string>, texto: string, inicioMs: number, msPorLetra = 30): number {
    for (let i = 1; i <= texto.length; i++) {
      this.em(inicioMs + i * msPorLetra, () => alvo.set(texto.slice(0, i)));
    }
    return inicioMs + texto.length * msPorLetra;
  }
}
