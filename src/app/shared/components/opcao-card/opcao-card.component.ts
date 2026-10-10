import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Opção de escolha única em formato de card (título + descrição + marcador).
 * Coloque os cards dentro de um elemento com `role="radiogroup"`.
 */
@Component({
  selector: 'app-opcao-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      role="radio"
      class="opcao"
      [class.opcao--selecionada]="selecionado()"
      [attr.aria-checked]="selecionado()"
      (click)="selecionar.emit()"
    >
      <span class="opcao__marcador" aria-hidden="true"></span>
      <span class="opcao__textos">
        <span class="opcao__titulo">{{ titulo() }}</span>
        @if (descricao()) {
          <span class="opcao__descricao">{{ descricao() }}</span>
        }
      </span>
    </button>
  `,
  styles: `
    :host {
      display: block;
    }

    .opcao {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      width: 100%;
      padding: 16px;
      border: 1px solid var(--cor-borda);
      border-radius: var(--raio-medio);
      background: var(--cor-fundo);
      color: var(--cor-texto);
      text-align: left;
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }

    .opcao:hover {
      border-color: var(--cor-borda-forte);
    }

    .opcao--selecionada,
    .opcao--selecionada:hover {
      border-color: var(--cor-primaria);
      background: var(--cor-selecionado);
      box-shadow: inset 0 0 0 1px var(--cor-primaria);
    }

    .opcao__marcador {
      flex: none;
      width: 20px;
      height: 20px;
      margin-top: 2px;
      border: 1.5px solid var(--cor-borda-forte);
      border-radius: 50%;
      transition: border 0.15s ease;
    }

    .opcao--selecionada .opcao__marcador {
      border: 6px solid var(--cor-primaria);
    }

    .opcao__textos {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .opcao__titulo {
      font-size: 15px;
      font-weight: 700;
    }

    .opcao__descricao {
      font-size: 13px;
      line-height: 1.5;
      color: var(--cor-texto-suave);
    }
  `,
})
export class OpcaoCardComponent {
  readonly titulo = input.required<string>();
  readonly descricao = input('');
  readonly selecionado = input(false);
  readonly selecionar = output<void>();
}
