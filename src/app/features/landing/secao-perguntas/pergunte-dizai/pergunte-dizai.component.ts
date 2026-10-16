import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { mensagemDoErro } from '../../../../core/api/erro-api';
import { AssistenteDizaiService, TrocaDizai } from '../../../../core/services/assistente-dizai.service';
import { IconeComponent } from '../../../../shared/components/icone/icone.component';

/** Quantas trocas anteriores vão junto com a pergunta (o backend aceita até 6). */
const TROCAS_DE_CONTEXTO = 4;
const LIMITE_LETRAS = 600;

const SUGESTOES = [
  'Tenho um salão de beleza. Faz sentido para mim?',
  'Vendo bolos por encomenda. Como ele me ajudaria?',
  'Quanto tempo leva para deixar tudo funcionando?',
];

/** Abaixo das perguntas frequentes: o visitante pergunta o que quiser e a IA do DizAI responde logo abaixo. */
@Component({
  selector: 'app-pergunte-dizai',
  imports: [FormsModule, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pergunte-dizai.component.html',
  styleUrl: './pergunte-dizai.component.css',
})
export class PergunteDizaiComponent {
  private readonly assistente = inject(AssistenteDizaiService);
  private readonly campo = viewChild<ElementRef<HTMLTextAreaElement>>('campo');

  protected readonly sugestoes = SUGESTOES;
  protected readonly limiteLetras = LIMITE_LETRAS;
  protected readonly texto = signal('');
  protected readonly trocas = signal<TrocaDizai[]>([]);
  /** Pergunta enviada que ainda espera a resposta (aparece com os três pontinhos). */
  protected readonly perguntaPendente = signal<string | null>(null);
  protected readonly erro = signal<string | null>(null);

  protected usarSugestao(sugestao: string): void {
    this.texto.set(sugestao);
    void this.enviar();
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
    this.erro.set(null);
    this.perguntaPendente.set(pergunta);
    this.texto.set('');
    try {
      const resposta = await this.assistente.perguntar(pergunta, this.trocas().slice(-TROCAS_DE_CONTEXTO));
      this.trocas.update((trocas) => [...trocas, { pergunta, resposta }]);
    } catch (erro) {
      this.erro.set(mensagemDoErro(erro, 'Não consegui responder agora. Tente de novo em instantes.'));
      this.texto.set(pergunta);   // devolve a pergunta para não precisar digitar de novo
    } finally {
      this.perguntaPendente.set(null);
      this.campo()?.nativeElement.focus();
    }
  }
}
