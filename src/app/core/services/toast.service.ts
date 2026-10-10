import { Injectable, signal } from '@angular/core';

export interface MensagemToast {
  id: number;
  texto: string;
}

const DURACAO_PADRAO_MS = 2600;

/** Mensagens curtas de confirmação ("Produto adicionado"). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly mensagemAtual = signal<MensagemToast | null>(null);
  private temporizador?: ReturnType<typeof setTimeout>;
  private contador = 0;

  readonly mensagem = this.mensagemAtual.asReadonly();

  mostrar(texto: string, duracaoMs = DURACAO_PADRAO_MS): void {
    clearTimeout(this.temporizador);
    this.mensagemAtual.set({ id: ++this.contador, texto });
    this.temporizador = setTimeout(() => this.mensagemAtual.set(null), duracaoMs);
  }

  fechar(): void {
    clearTimeout(this.temporizador);
    this.mensagemAtual.set(null);
  }
}
