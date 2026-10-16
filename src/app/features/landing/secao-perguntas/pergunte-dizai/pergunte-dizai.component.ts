import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { mensagemDoErro } from '../../../../core/api/erro-api';
import { AssistenteDizaiService, TrocaDizai } from '../../../../core/services/assistente-dizai.service';
import { IconeComponent } from '../../../../shared/components/icone/icone.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';

/** Quantas trocas anteriores vão junto com a pergunta (o backend aceita até 6). */
const TROCAS_DE_CONTEXTO = 4;
const LIMITE_LETRAS = 600;
/** A resposta aparece aos poucos, como num chat de IA: letras por passo a cada 16 ms. */
const LETRAS_POR_PASSO = 3;

/** Abaixo das perguntas frequentes: o visitante pergunta o que quiser e a IA do DizAI responde logo abaixo. */
@Component({
  selector: 'app-pergunte-dizai',
  imports: [FormsModule, IconeComponent, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pergunte-dizai.component.html',
  styleUrl: './pergunte-dizai.component.css',
})
export class PergunteDizaiComponent {
  private readonly assistente = inject(AssistenteDizaiService);
  private readonly campo = viewChild<ElementRef<HTMLTextAreaElement>>('campo');
  private readonly movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private digitacao?: number;

  protected readonly limiteLetras = LIMITE_LETRAS;
  protected readonly texto = signal('');
  protected readonly trocas = signal<TrocaDizai[]>([]);
  /** Quantas letras da última resposta já apareceram. */
  protected readonly letrasVisiveis = signal(0);
  /** Pergunta enviada que ainda espera a resposta. */
  protected readonly perguntaPendente = signal<string | null>(null);
  protected readonly erro = signal<string | null>(null);

  constructor() {
    inject(DestroyRef).onDestroy(() => window.clearInterval(this.digitacao));
  }

  /** Enter envia; Shift+Enter quebra a linha. */
  protected aoTeclar(evento: KeyboardEvent): void {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault();
      void this.enviar();
    }
  }

  protected async enviar(): Promise<void> {
    const pergunta = this.texto().trim();
    if (!pergunta || this.perguntaPendente()) {
      return;
    }
    this.terminarDigitacao();
    this.erro.set(null);
    this.perguntaPendente.set(pergunta);
    this.texto.set('');
    try {
      const resposta = await this.assistente.perguntar(pergunta, this.trocas().slice(-TROCAS_DE_CONTEXTO));
      this.trocas.update((trocas) => [...trocas, { pergunta, resposta }]);
      this.digitar(resposta);
    } catch (erro) {
      this.erro.set(mensagemDoErro(erro, 'Não consegui responder agora. Tente de novo em instantes.'));
      this.texto.set(pergunta);   // devolve a pergunta para não precisar digitar de novo
    } finally {
      this.perguntaPendente.set(null);
      this.campo()?.nativeElement.focus();
    }
  }

  private digitar(resposta: string): void {
    if (this.movimentoReduzido) {
      this.letrasVisiveis.set(resposta.length);
      return;
    }
    this.letrasVisiveis.set(0);
    this.digitacao = window.setInterval(() => {
      const proximas = Math.min(this.letrasVisiveis() + LETRAS_POR_PASSO, resposta.length);
      this.letrasVisiveis.set(proximas);
      if (proximas >= resposta.length) {
        window.clearInterval(this.digitacao);
      }
    }, 16);
  }

  /** Uma pergunta nova antes de a anterior terminar de aparecer: mostra a anterior inteira. */
  private terminarDigitacao(): void {
    window.clearInterval(this.digitacao);
    this.letrasVisiveis.set(Number.MAX_SAFE_INTEGER);
  }
}
