import { Component, OnInit, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NovaPerguntaFrequente } from '../../../core/models/pergunta-frequente.model';
import { ConteudoRamoService } from '../../../core/services/conteudo-ramo.service';
import { campoComErro } from '../../../core/utils/validadores';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';

/** Formulário do modal "Nova pergunta". */
@Component({
  selector: 'app-pergunta-formulario',
  imports: [ReactiveFormsModule, CarregandoComponent],
  template: `
    <form class="formulario" [formGroup]="formulario" (ngSubmit)="salvar()" novalidate>
      <div class="campo">
        <label for="pergunta" class="campo__rotulo">O que o cliente pergunta?</label>
        <input id="pergunta" class="campo__entrada" type="text" formControlName="pergunta" [placeholder]="conteudo().pergunta.pergunta">
        @if (temErro('pergunta')) {
          <span class="campo__erro" role="alert">Escreva a pergunta.</span>
        }
      </div>

      <div class="campo">
        <label for="resposta" class="campo__rotulo">Qual é a resposta?</label>
        <textarea id="resposta" class="campo__entrada" rows="4" formControlName="resposta" [placeholder]="conteudo().pergunta.resposta"></textarea>
        @if (temErro('resposta')) {
          <span class="campo__erro" role="alert">Escreva a resposta.</span>
        } @else {
          <span class="campo__dica">Escreva como você responderia o cliente. O assistente adapta para cada conversa.</span>
        }
      </div>

      @if (modelo()) {
        <p class="aviso-informativo">Troque o que estiver entre [colchetes] pelas informações do seu negócio.</p>
      }

      <button type="submit" class="btn btn--primario btn--grande btn--bloco" [disabled]="salvando()" [attr.aria-busy]="salvando()">
        @if (salvando()) {
      <app-carregando modo="inline" variante="claro" [tamanho]="22" />
      Salvando…
    } @else {
      Salvar pergunta
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
  `,
})
export class PerguntaFormularioComponent implements OnInit {
  /** Pergunta sugerida para o ramo: o formulário abre já preenchido com ela. */
  readonly modelo = input<NovaPerguntaFrequente | null>(null);
  readonly salvando = input(false);
  readonly salvo = output<NovaPerguntaFrequente>();

  protected readonly conteudo = inject(ConteudoRamoService).conteudo;

  protected readonly formulario = inject(FormBuilder).nonNullable.group({
    pergunta: ['', [Validators.required, Validators.maxLength(200)]],
    resposta: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  ngOnInit(): void {
    const modelo = this.modelo();
    if (modelo) {
      this.formulario.setValue(modelo);
    }
  }

  protected temErro(campo: 'pergunta' | 'resposta'): boolean {
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
    const { pergunta, resposta } = this.formulario.getRawValue();
    this.salvo.emit({ pergunta: pergunta.trim(), resposta: resposta.trim() });
  }
}
