import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NovoAlbum } from '../../../core/models/galeria.model';
import { ConteudoRamoService } from '../../../core/services/conteudo-ramo.service';
import { campoComErro } from '../../../core/utils/validadores';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';

/** Formulário do modal "Novo tópico". Depois de criar, a tela abre a seleção de fotos. */
@Component({
  selector: 'app-topico-formulario',
  imports: [ReactiveFormsModule, CarregandoComponent],
  template: `
    <form class="formulario" [formGroup]="formulario" (ngSubmit)="salvar()" novalidate>
      <div class="campo">
        <label for="topico-nome" class="campo__rotulo">Nome do tópico</label>
        <input id="topico-nome" class="campo__entrada" type="text" formControlName="nome" [placeholder]="conteudo().topico.nome">
        @if (nomeComErro()) {
          <span class="campo__erro" role="alert">Dê um nome para o tópico.</span>
        }
        <div class="grupo-chips sugestoes" aria-label="Sugestões de tópico">
          @for (sugestao of conteudo().topicosSugeridos; track sugestao) {
            <button type="button" class="chip chip--pequeno" [class.chip--ativo]="formulario.controls.nome.value === sugestao" (click)="usarSugestao(sugestao)">
              {{ sugestao }}
            </button>
          }
        </div>
      </div>

      <div class="campo">
        <label for="topico-descricao" class="campo__rotulo">
          Descrição <span class="campo__rotulo-opcional">(opcional)</span>
        </label>
        <textarea id="topico-descricao" class="campo__entrada" rows="2" formControlName="descricao" [placeholder]="conteudo().topico.descricao"></textarea>
      </div>

      <p class="campo__dica">Em seguida você escolhe as fotos deste tópico.</p>

      <button type="submit" class="btn btn--primario btn--grande btn--bloco" [disabled]="salvando()" [attr.aria-busy]="salvando()">
        @if (salvando()) {
          <app-carregando modo="inline" variante="claro" [tamanho]="22" />
          Criando tópico…
        } @else {
          Criar e adicionar fotos
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

    .sugestoes {
      margin-top: 4px;
    }
  `,
})
export class TopicoFormularioComponent {
  readonly salvando = input(false);
  readonly salvo = output<NovoAlbum>();

  protected readonly conteudo = inject(ConteudoRamoService).conteudo;

  protected readonly formulario = inject(FormBuilder).nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(60)]],
    descricao: ['', Validators.maxLength(300)],
  });

  protected usarSugestao(nome: string): void {
    this.formulario.controls.nome.setValue(nome);
  }

  protected nomeComErro(): boolean {
    return campoComErro(this.formulario.controls.nome);
  }

  protected salvar(): void {
    if (this.salvando()) {
      return;
    }
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.salvo.emit(this.formulario.getRawValue());
  }
}
