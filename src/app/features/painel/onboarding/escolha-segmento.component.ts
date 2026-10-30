import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { DadosSegmento, SegmentoNegocio } from '../../../core/constants/segmentos';

/**
 * Primeiro passo do onboarding (e Dados da loja): o tipo do negócio dentro do ramo, em cartões. Só muda os exemplos,
 * sugestões e tutoriais do painel; "Outro tipo" deixa os exemplos gerais do ramo.
 */
@Component({
  selector: 'app-escolha-segmento',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
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
          <span class="segmento__emoji" aria-hidden="true">{{ segmento.emoji }}</span>
          <span class="segmento__rotulo">{{ segmento.rotulo }}</span>
          <span class="segmento__descricao">{{ segmento.descricao }}</span>
        </button>
      }
    </div>
    <button
      type="button"
      role="radio"
      class="segmento-outro"
      [class.segmento-outro--escolhido]="escolhido() === null"
      [attr.aria-checked]="escolhido() === null"
      (click)="escolher.emit(null)"
    >
      Meu negócio é de outro tipo
    </button>
    <p class="aviso">Serve só para os exemplos e as sugestões da plataforma: você pode cadastrar qualquer produto ou serviço.</p>
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
      gap: 8px;
    }

    .segmento {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 3px;
      padding: 12px;
      border: 1.5px solid var(--cor-borda);
      border-radius: 14px;
      background: var(--cor-fundo);
      color: var(--cor-texto);
      font: inherit;
      text-align: left;
      cursor: pointer;
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }

    .segmento:hover {
      border-color: var(--cor-borda-forte);
    }

    .segmento--escolhido,
    .segmento--escolhido:hover {
      border-color: var(--cor-primaria);
      background: var(--cor-primaria-clara);
    }

    .segmento__emoji {
      font-size: 22px;
      line-height: 1.2;
    }

    .segmento__rotulo {
      font-size: 14px;
      font-weight: 700;
    }

    .segmento__descricao {
      color: var(--cor-texto-secundario);
      font-size: 12px;
      line-height: 1.35;
    }

    .segmento-outro {
      align-self: center;
      padding: 6px 12px;
      border: 1.5px solid transparent;
      border-radius: var(--raio-pilula);
      background: none;
      color: var(--cor-texto-secundario);
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    .segmento-outro--escolhido {
      border-color: var(--cor-primaria);
      color: var(--cor-primaria);
    }

    .aviso {
      margin: 0;
      color: var(--cor-texto-suave);
      font-size: 12px;
      line-height: 1.45;
      text-align: center;
    }
  `,
})
export class EscolhaSegmentoComponent {
  readonly segmentos = input.required<DadosSegmento[]>();
  /** O escolhido; null = "outro tipo"; undefined = nenhum ainda. */
  readonly escolhido = input<SegmentoNegocio | null | undefined>(undefined);
  readonly escolher = output<SegmentoNegocio | null>();
}
