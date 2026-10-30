import { ChangeDetectionStrategy, Component, OnInit, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Feedback, NovoFeedback } from '../../../core/models/galeria.model';
import { campoComErro } from '../../../core/utils/validadores';
import { ConteudoRamoService } from '../../../core/services/conteudo-ramo.service';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';

/** Cadastro rápido de um feedback de cliente: estrelas (5 por padrão), texto, nome e data (opcional). */
@Component({
  selector: 'app-feedback-formulario',
  imports: [ReactiveFormsModule, CarregandoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="formulario" [formGroup]="formulario" (ngSubmit)="salvar()" novalidate>
      <div class="campo">
        <span class="campo__rotulo" id="rotulo-estrelas">Avaliação</span>
        <div class="estrelas" role="radiogroup" aria-labelledby="rotulo-estrelas">
          @for (n of [1, 2, 3, 4, 5]; track n) {
            <button
              type="button"
              role="radio"
              class="estrela"
              [class.estrela--acesa]="n <= formulario.controls.estrelas.value"
              [attr.aria-checked]="n === formulario.controls.estrelas.value"
              [attr.aria-label]="n + (n === 1 ? ' estrela' : ' estrelas')"
              (click)="formulario.controls.estrelas.setValue(n)"
            >★</button>
          }
        </div>
      </div>

      <div class="campo">
        <label for="feedback-texto" class="campo__rotulo">O que o cliente disse</label>
        <textarea
          id="feedback-texto"
          class="campo__entrada"
          rows="4"
          maxlength="500"
          formControlName="texto"
          [placeholder]="'Ex.: ' + conteudo().feedback"
        ></textarea>
        @if (temErro('texto')) {
          <span class="campo__erro" role="alert">Escreva o feedback do cliente.</span>
        }
      </div>

      <div class="linha">
        <div class="campo">
          <label for="feedback-nome" class="campo__rotulo">Nome do cliente</label>
          <input id="feedback-nome" class="campo__entrada" type="text" maxlength="60" formControlName="nome" placeholder="Ex.: Ana Souza">
          @if (temErro('nome')) {
            <span class="campo__erro" role="alert">Informe o nome.</span>
          }
        </div>
        <div class="campo">
          <label for="feedback-data" class="campo__rotulo">Data <span class="campo__rotulo-opcional">(opcional)</span></label>
          <input id="feedback-data" class="campo__entrada" type="date" formControlName="data">
        </div>
      </div>

      <button type="submit" class="btn btn--primario btn--grande btn--bloco" [disabled]="salvando()" [attr.aria-busy]="salvando()">
        @if (salvando()) {
          <app-carregando modo="inline" variante="claro" [tamanho]="22" />
          Salvando…
        } @else {
          {{ feedback() ? 'Salvar alterações' : 'Adicionar feedback' }}
        }
      </button>
    </form>
  `,
  styles: `
    .formulario {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .estrelas {
      display: flex;
      gap: 4px;
    }

    .estrela {
      padding: 0 2px;
      border: none;
      background: none;
      color: var(--cor-desabilitado);
      font-size: 32px;
      line-height: 1;
      cursor: pointer;
      transition: color 0.12s ease, transform 0.12s ease;
    }

    .estrela--acesa {
      color: #F2B01E;
    }

    .estrela:hover {
      transform: scale(1.1);
    }

    .linha {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
      gap: 12px;
    }
  `,
})
export class FeedbackFormularioComponent implements OnInit {
  /** Edição: o feedback que abre preenchido; null = novo. */
  readonly feedback = input<Feedback | null>(null);
  readonly salvando = input(false);
  readonly salvo = output<NovoFeedback>();

  /** Exemplo do feedback com a cara do negócio. */
  protected readonly conteudo = inject(ConteudoRamoService).conteudo;
  protected readonly formulario = inject(FormBuilder).nonNullable.group({
    estrelas: [5],
    texto: ['', [Validators.required, Validators.maxLength(500)]],
    nome: ['', [Validators.required, Validators.maxLength(60)]],
    data: [''],
  });

  ngOnInit(): void {
    const feedback = this.feedback();
    if (feedback) {
      this.formulario.setValue({
        estrelas: feedback.estrelas,
        texto: feedback.texto,
        nome: feedback.nome,
        data: feedback.data ?? '',
      });
    }
  }

  protected temErro(campo: 'texto' | 'nome'): boolean {
    return campoComErro(this.formulario.controls[campo]);
  }

  protected salvar(): void {
    if (this.salvando()) {
      return;
    }
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const { estrelas, texto, nome, data } = this.formulario.getRawValue();
    this.salvo.emit({ estrelas, texto: texto.trim(), nome: nome.trim(), data: data || null });
  }
}
