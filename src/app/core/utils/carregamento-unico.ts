import { signal } from '@angular/core';

/**
 * Controla o primeiro carregamento dos dados de um serviço:
 * busca uma única vez, expõe `carregando` para as telas e reaproveita a mesma promessa
 * se duas telas pedirem os dados ao mesmo tempo.
 */
export class CarregamentoUnico {
  private readonly emAndamento = signal(false);
  private promessa: Promise<void> | null = null;

  readonly carregando = this.emAndamento.asReadonly();

  executar(buscar: () => Promise<void>): Promise<void> {
    this.promessa ??= this.buscarComIndicador(buscar);
    return this.promessa;
  }

  /** Esquece o carregamento feito: a próxima chamada a `executar` busca de novo (ex.: troca de conta). */
  reiniciar(): void {
    this.promessa = null;
    this.emAndamento.set(false);
  }

  private async buscarComIndicador(buscar: () => Promise<void>): Promise<void> {
    this.emAndamento.set(true);
    try {
      await buscar();
    } catch (erro) {
      // Permite tentar de novo na próxima vez que a tela pedir os dados.
      this.promessa = null;
      throw erro;
    } finally {
      this.emAndamento.set(false);
    }
  }
}
