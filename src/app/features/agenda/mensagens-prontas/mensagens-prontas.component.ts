import { ChangeDetectionStrategy, Component, ElementRef, Signal, computed, inject, input, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { mensagemDoErro } from '../../../core/api/erro-api';
import { MensagemPronta, NovaMensagemPronta } from '../../../core/models/agenda.model';
import { AgendaService } from '../../../core/services/agenda.service';
import { ToastService } from '../../../core/services/toast.service';
import { campoComErro } from '../../../core/utils/validadores';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { SUGESTOES_MENSAGEM, VARIAVEIS_MENSAGEM } from './variaveis-mensagem';

const MAXIMO_MENSAGENS = 10;

/** De onde vêm as mensagens e como a tela fala delas: a agenda é o padrão; os pedidos passam a sua. */
export interface ConfigMensagensProntas {
  mensagens: Signal<MensagemPronta[]>;
  criar(mensagem: NovaMensagemPronta): Promise<void>;
  atualizar(id: string, mensagem: NovaMensagemPronta): Promise<void>;
  remover(id: string): Promise<void>;
  variaveis: { chave: string; rotulo: string; exemplo: string }[];
  sugestoes: NovaMensagemPronta[];
  explicacao: string;
  exemploTitulo: string;
  exemploTexto: string;
  dicaVariaveis: string;
}

/**
 * Conteúdo do modal "Mensagens prontas": lista, cria, edita e apaga os modelos que o lojista manda pelo WhatsApp
 * (da agenda, por padrão, ou dos pedidos, com `config`). As variáveis entram com um toque no ponto do cursor.
 */
@Component({
  selector: 'app-mensagens-prontas',
  imports: [ReactiveFormsModule, IconeComponent, CarregandoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mensagens-prontas.component.html',
  styleUrl: './mensagens-prontas.component.css',
})
export class MensagensProntasComponent {
  /** Sem config, são as mensagens da agenda. */
  readonly config = input<ConfigMensagensProntas | null>(null);

  private readonly agendaService = inject(AgendaService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  private readonly configAgenda: ConfigMensagensProntas = {
    mensagens: this.agendaService.mensagensProntas,
    criar: (mensagem) => this.agendaService.criarMensagemPronta(mensagem),
    atualizar: (id, mensagem) => this.agendaService.atualizarMensagemPronta(id, mensagem),
    remover: (id) => this.agendaService.removerMensagemPronta(id),
    variaveis: VARIAVEIS_MENSAGEM,
    sugestoes: SUGESTOES_MENSAGEM,
    explicacao:
      'Ao tocar no WhatsApp de um cliente na agenda, você escolhe uma destas mensagens e ela já abre escrita na conversa.',
    exemploTitulo: 'Ex.: Lembrete do horário',
    exemploTexto: 'Ex.: Olá, {nome}! Passando para lembrar do seu horário {data} às {horario}.',
    dicaVariaveis: 'Nome, data, horário e serviço são trocados pelos dados de cada cliente.',
  };
  protected readonly atual = computed(() => this.config() ?? this.configAgenda);
  protected readonly mensagens = computed(() => this.atual().mensagens());
  protected readonly maximo = MAXIMO_MENSAGENS;

  /** null: mostrando a lista. 'nova' ou o id: formulário aberto. */
  protected readonly editando = signal<'nova' | string | null>(null);
  protected readonly salvando = signal(false);
  protected readonly removendo = signal<string | null>(null);

  private readonly campoTexto = viewChild<ElementRef<HTMLTextAreaElement>>('campoTexto');

  protected readonly formulario = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(40)]],
    texto: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  protected nova(modelo?: NovaMensagemPronta): void {
    this.formulario.reset(modelo ?? { titulo: '', texto: '' });
    this.editando.set('nova');
  }

  protected editar(mensagem: MensagemPronta): void {
    this.formulario.reset({ titulo: mensagem.titulo, texto: mensagem.texto });
    this.editando.set(mensagem.id);
  }

  protected voltar(): void {
    this.editando.set(null);
  }

  /** Coloca {nome}, {data}... onde está o cursor do texto. */
  protected inserir(chave: string): void {
    const campo = this.campoTexto()?.nativeElement;
    const controle = this.formulario.controls.texto;
    const atual = controle.value;
    const inicio = campo?.selectionStart ?? atual.length;
    const fim = campo?.selectionEnd ?? atual.length;
    controle.setValue(atual.slice(0, inicio) + chave + atual.slice(fim));
    requestAnimationFrame(() => {
      campo?.focus();
      campo?.setSelectionRange(inicio + chave.length, inicio + chave.length);
    });
  }

  protected temErro(campo: 'titulo' | 'texto'): boolean {
    return campoComErro(this.formulario.controls[campo]);
  }

  protected async salvar(): Promise<void> {
    if (this.salvando()) {
      return;
    }
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valores = this.formulario.getRawValue();
    const mensagem = { titulo: valores.titulo.trim(), texto: valores.texto.trim() };
    const editando = this.editando();
    this.salvando.set(true);
    try {
      if (editando === 'nova') {
        await this.atual().criar(mensagem);
      } else if (editando) {
        await this.atual().atualizar(editando, mensagem);
      }
      this.editando.set(null);
      this.toastService.mostrar('Mensagem salva');
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível salvar a mensagem. Tente de novo.'));
    } finally {
      this.salvando.set(false);
    }
  }

  protected async remover(mensagem: MensagemPronta): Promise<void> {
    if (this.removendo()) {
      return;
    }
    this.removendo.set(mensagem.id);
    try {
      await this.atual().remover(mensagem.id);
      this.toastService.mostrar(`"${mensagem.titulo}" apagada`);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível apagar. Tente de novo.'));
    } finally {
      this.removendo.set(null);
    }
  }
}
