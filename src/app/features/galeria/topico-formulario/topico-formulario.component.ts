import { Component, inject, input, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NovoAlbum, TipoTopico } from '../../../core/models/galeria.model';
import { ConteudoRamoService } from '../../../core/services/conteudo-ramo.service';
import { campoComErro } from '../../../core/utils/validadores';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { EnderecoFormularioComponent } from '../endereco-formulario/endereco-formulario.component';

/** Formulário do modal "Novo tópico". Depois de criar, a tela abre a seleção de fotos. */
@Component({
  selector: 'app-topico-formulario',
  imports: [ReactiveFormsModule, CarregandoComponent, IconeComponent, EnderecoFormularioComponent],
  template: `
    <form class="formulario" [formGroup]="formulario" (ngSubmit)="salvar()" novalidate>
      <div class="tipos" role="radiogroup" aria-label="Tipo do tópico">
        <button type="button" role="radio" class="tipo" [class.tipo--ativo]="!ehFeedbacks()" [attr.aria-checked]="!ehFeedbacks()" (click)="escolherTipo('FOTOS')">
          <app-icone nome="imagem" [tamanho]="20" />
          <span class="tipo__textos"><strong>Fotos</strong><span>Seus trabalhos</span></span>
        </button>
        <button type="button" role="radio" class="tipo" [class.tipo--ativo]="ehFeedbacks()" [attr.aria-checked]="ehFeedbacks()" (click)="escolherTipo('FEEDBACKS')">
          <span class="tipo__estrela" aria-hidden="true">★</span>
          <span class="tipo__textos"><strong>Feedbacks</strong><span>O que os clientes dizem</span></span>
        </button>
        <button type="button" role="radio" class="tipo" [class.tipo--ativo]="ehLocalizacao()" [attr.aria-checked]="ehLocalizacao()" (click)="escolherTipo('LOCALIZACAO')">
          <span class="tipo__estrela" aria-hidden="true">📍</span>
          <span class="tipo__textos"><strong>Como chegar</strong><span>Mapa da loja</span></span>
        </button>
      </div>

      <div class="campo">
        <label for="topico-nome" class="campo__rotulo">Nome do tópico</label>
        <input id="topico-nome" class="campo__entrada" type="text" formControlName="nome" [placeholder]="conteudo().topico.nome">
        @if (nomeComErro()) {
          <span class="campo__erro" role="alert">Dê um nome para o tópico.</span>
        }
        @if (tipoAtual() === 'FOTOS') {
          <div class="grupo-chips sugestoes" aria-label="Sugestões de tópico">
            @for (sugestao of conteudo().topicosSugeridos; track sugestao) {
              <button type="button" class="chip chip--pequeno" [class.chip--ativo]="formulario.controls.nome.value === sugestao" (click)="usarSugestao(sugestao)">
                {{ sugestao }}
              </button>
            }
          </div>
        }
      </div>

      <div class="campo">
        <label for="topico-descricao" class="campo__rotulo">
          Descrição <span class="campo__rotulo-opcional">(opcional)</span>
        </label>
        <textarea id="topico-descricao" class="campo__entrada" rows="2" formControlName="descricao" [placeholder]="conteudo().topico.descricao"></textarea>
      </div>

      @if (ehLocalizacao()) {
        <app-endereco-formulario />
        @if (faltaEndereco()) {
          <span class="campo__erro" role="alert">Preencha rua, número e cidade: é o que vai no mapa.</span>
        }
      } @else {
        <p class="campo__dica">
          {{ ehFeedbacks() ? 'Em seguida você adiciona o primeiro feedback. Na vitrine eles passam um por vez.' : 'Em seguida você escolhe as fotos deste tópico.' }}
        </p>
      }

      <button type="submit" class="btn btn--primario btn--grande btn--bloco" [disabled]="salvando()" [attr.aria-busy]="salvando()">
        @if (salvando()) {
          <app-carregando modo="inline" variante="claro" [tamanho]="22" />
          Criando tópico…
        } @else {
          {{ ehLocalizacao() ? 'Criar e mostrar o mapa' : ehFeedbacks() ? 'Criar e adicionar feedback' : 'Criar e adicionar fotos' }}
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

    .tipos {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }

    @media (max-width: 420px) {
      .tipos {
        grid-template-columns: 1fr;
      }
    }

    .tipo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      border: 1px solid var(--cor-borda);
      border-radius: var(--raio-medio);
      background: var(--cor-fundo);
      color: var(--cor-texto-suave);
      text-align: left;
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }

    .tipo--ativo {
      border-color: var(--cor-primaria);
      background: var(--cor-selecionado);
      box-shadow: inset 0 0 0 1px var(--cor-primaria);
      color: var(--cor-primaria);
    }

    .tipo__estrela {
      font-size: 20px;
      line-height: 1;
      color: #F2B01E;
    }

    .tipo__textos {
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
      font-size: 12px;
    }

    .tipo__textos strong {
      font-size: 14px;
      color: var(--cor-texto);
    }
  `,
})
export class TopicoFormularioComponent {
  readonly salvando = input(false);
  readonly salvo = output<NovoAlbum>();

  protected readonly conteudo = inject(ConteudoRamoService).conteudo;

  protected readonly formulario = inject(FormBuilder).nonNullable.group({
    tipo: ['FOTOS' as TipoTopico],
    nome: ['', [Validators.required, Validators.maxLength(60)]],
    descricao: ['', Validators.maxLength(300)],
  });

  private readonly endereco = viewChild(EnderecoFormularioComponent);
  protected readonly faltaEndereco = signal(false);

  protected tipoAtual(): TipoTopico {
    return this.formulario.controls.tipo.value;
  }

  protected ehFeedbacks(): boolean {
    return this.tipoAtual() === 'FEEDBACKS';
  }

  protected ehLocalizacao(): boolean {
    return this.tipoAtual() === 'LOCALIZACAO';
  }

  /** Feedbacks e "Como chegar" já vêm com o nome pronto (se o lojista ainda não escreveu outro). */
  protected escolherTipo(tipo: TipoTopico): void {
    this.formulario.controls.tipo.setValue(tipo);
    const nome = this.formulario.controls.nome;
    const nomesProntos: Partial<Record<TipoTopico, string>> = { FEEDBACKS: 'Feedbacks', LOCALIZACAO: 'Como chegar' };
    const nomeAtualEhPronto = Object.values(nomesProntos).includes(nome.value);
    if (!nome.value.trim() || nomeAtualEhPronto || this.conteudo().topicosSugeridos.includes(nome.value)) {
      nome.setValue(nomesProntos[tipo] ?? '');
    }
  }

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
    const endereco = this.ehLocalizacao() ? (this.endereco()?.enderecoCompleto() ?? null) : null;
    this.faltaEndereco.set(this.ehLocalizacao() && !endereco);
    if (this.formulario.invalid || this.faltaEndereco()) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.salvo.emit({ ...this.formulario.getRawValue(), endereco });
  }
}
