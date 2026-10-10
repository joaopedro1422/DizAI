import { ChangeDetectionStrategy, Component, input } from '@angular/core';

let proximoIdSecao = 0;

/** Bloco de configuração com título, descrição opcional, selo opcional e conteúdo livre. */
@Component({
  selector: 'app-secao-configuracao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="secao" [attr.aria-labelledby]="idTitulo">
      <div class="secao__cabecalho">
        <div class="secao__linha-titulo">
          <h2 class="titulo-secao" [id]="idTitulo">{{ titulo() }}</h2>
          @if (selo()) {
            <span class="selo selo--primario">{{ selo() }}</span>
          }
        </div>
        @if (descricao()) {
          <p class="secao__descricao">{{ descricao() }}</p>
        }
      </div>
      <ng-content />
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .secao {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .secao__cabecalho {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .secao__linha-titulo {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .secao__descricao {
      font-size: 14px;
      line-height: 1.5;
      color: var(--cor-texto-suave);
    }
  `,
})
export class SecaoConfiguracaoComponent {
  readonly titulo = input.required<string>();
  readonly descricao = input('');
  readonly selo = input('');

  /** Id do título, útil para ligar um `radiogroup` interno via `aria-labelledby`. */
  readonly idTitulo = `secao-titulo-${++proximoIdSecao}`;
}
