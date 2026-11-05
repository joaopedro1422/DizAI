import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { DadosSegmento, SegmentoNegocio } from '../../../core/constants/segmentos';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { ICONE_OUTRO_TIPO, ICONES_SEGMENTO } from './icones-segmento';

@Component({
  selector: 'app-escolha-segmento',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconeComponent, NgTemplateOutlet],
  template: `
    <ng-template #desenho let-caminhos>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
        @for (caminho of caminhos; track $index) {
          <path [attr.d]="caminho" />
        }
      </svg>
    </ng-template>

    <div class="segmentos" role="radiogroup" aria-label="Tipo do seu negócio">
      @for (segmento of segmentos(); track segmento.valor) {
        <button
          type="button"
          role="radio"
          class="segmento"
          [class.segmento--escolhido]="escolhido() === segmento.valor"
          [attr.aria-checked]="escolhido() === segmento.valor"
          (click)="escolher.emit(segmento.valor)"
        >
          <span class="segmento__topo">
            <span class="segmento__icone">
              <ng-container *ngTemplateOutlet="desenho; context: { $implicit: icones[segmento.valor] }" />
            </span>
            <span class="segmento__marca" aria-hidden="true">
              <app-icone nome="check" [tamanho]="11" [espessura]="3" />
            </span>
          </span>
          <span class="segmento__rotulo">{{ segmento.rotulo }}</span>
          <span class="segmento__descricao">{{ segmento.descricao }}</span>
        </button>
      }
    </div>

    <button
      type="button"
      role="radio"
      class="segmento segmento--outro"
      [class.segmento--escolhido]="escolhido() === null"
      [attr.aria-checked]="escolhido() === null"
      (click)="escolher.emit(null)"
    >
      <span class="segmento__icone">
        <ng-container *ngTemplateOutlet="desenho; context: { $implicit: iconeOutro }" />
      </span>
      <span class="segmento__textos">
        <span class="segmento__rotulo">Meu negócio é de outro tipo</span>
        <span class="segmento__descricao">Usamos exemplos gerais</span>
      </span>
      <span class="segmento__marca" aria-hidden="true">
        <app-icone nome="check" [tamanho]="11" [espessura]="3" />
      </span>
    </button>

    <p class="aviso">
      <app-icone nome="informacao" [tamanho]="15" />
      Define os exemplos e as sugestões do painel. Você pode cadastrar qualquer produto ou serviço.
    </p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .segmentos {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .segmento {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      padding: 14px;
      border: 1.5px solid var(--cor-borda);
      border-radius: 16px;
      background: var(--cor-fundo);
      color: var(--cor-texto);
      font: inherit;
      text-align: left;
      cursor: pointer;
      transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
    }

    .segmento:hover {
      border-color: var(--cor-borda-forte);
      box-shadow: 0 6px 16px -10px rgba(15, 23, 42, 0.35);
    }

    .segmento:focus-visible {
      outline: 2px solid var(--cor-primaria);
      outline-offset: 2px;
    }

    .segmento--escolhido,
    .segmento--escolhido:hover {
      border-color: var(--cor-primaria);
      box-shadow: 0 0 0 3px rgba(30, 58, 114, 0.12);
    }

    .segmento__topo {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 10px;
    }

    .segmento__icone {
      display: grid;
      flex: none;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--cor-fundo-suave);
      color: var(--cor-primaria);
      transition: background-color 0.18s ease, color 0.18s ease;
    }

    .segmento--escolhido .segmento__icone {
      background: var(--cor-primaria);
      color: #ffffff;
    }

    /* o "rádio" no canto: anel vazio; escolhido, cheio com o check */
    .segmento__marca {
      display: grid;
      flex: none;
      place-items: center;
      width: 20px;
      height: 20px;
      border: 1.5px solid var(--cor-borda);
      border-radius: 50%;
      color: transparent;
      transition: all 0.18s ease;
    }

    .segmento--escolhido .segmento__marca {
      border-color: var(--cor-primaria);
      background: var(--cor-primaria);
      color: #ffffff;
    }

    .segmento__rotulo {
      font-size: 14.5px;
      font-weight: 700;
      letter-spacing: -0.01em;
      line-height: 1.25;
    }

    .segmento__descricao {
      color: var(--cor-texto-secundario);
      font-size: 12.5px;
      line-height: 1.4;
    }

    /* "outro tipo": uma linha só, na largura toda */
    .segmento--outro {
      flex-direction: row;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
    }

    .segmento--outro .segmento__icone {
      width: 36px;
      height: 36px;
      border-radius: 10px;
    }

    .segmento__textos {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }

    .aviso {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin: 2px 0 0;
      color: var(--cor-texto-suave);
      font-size: 12.5px;
      line-height: 1.45;
    }

    .aviso app-icone {
      margin-top: 1px;
    }

    @media (prefers-reduced-motion: reduce) {
      .segmento,
      .segmento__icone,
      .segmento__marca {
        transition: none;
      }
    }
  `,
})
export class EscolhaSegmentoComponent {
  readonly segmentos = input.required<DadosSegmento[]>();
  /** O escolhido; null = "outro tipo"; undefined = nenhum ainda. */
  readonly escolhido = input<SegmentoNegocio | null | undefined>(undefined);
  readonly escolher = output<SegmentoNegocio | null>();

  protected readonly icones = ICONES_SEGMENTO;
  protected readonly iconeOutro = ICONE_OUTRO_TIPO;
}
