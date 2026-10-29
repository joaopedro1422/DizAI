import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { IconeComponent } from '../icone/icone.component';
import { NomeIcone } from '../icone/icones';

/** Selo ao lado do título (ex.: "Agenda" nos serviços presenciais). */
export interface EtiquetaOpcao {
  texto: string;
  icone: NomeIcone;
}

/**
 * Opção de escolha única em formato de card (título + descrição + marcador).
 * Coloque os cards dentro de um elemento com `role="radiogroup"`.
 */
@Component({
  selector: 'app-opcao-card',
  imports: [IconeComponent],
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
        <span class="opcao__titulo">
          {{ titulo() }}
          @if (destaque()) {
            <app-icone class="opcao__destaque" nome="brilho" [tamanho]="16" [espessura]="2" />
          }
          @if (etiqueta(); as selo) {
            <span class="opcao__etiqueta">
              <app-icone [nome]="selo.icone" [tamanho]="12" [espessura]="2.2" />
              {{ selo.texto }}
            </span>
          }
        </span>
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

    /* estrelinha dourada ao lado do título: opção especial */
    .opcao__destaque {
      margin-left: 4px;
      color: #C68A12;
      vertical-align: -2px;
    }

    .opcao__etiqueta {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-left: 8px;
      padding: 2px 8px;
      border-radius: var(--raio-pilula);
      background: var(--cor-primaria-clara);
      color: var(--cor-primaria);
      font-size: 11.5px;
      font-weight: 700;
      vertical-align: 1px;
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
  /** Mostra a estrelinha ao lado do título (opção especial, ex.: agendamento automático). */
  readonly destaque = input(false);
  readonly descricao = input('');
  readonly etiqueta = input<EtiquetaOpcao | null>(null);
  readonly selecionado = input(false);
  readonly selecionar = output<void>();
}
