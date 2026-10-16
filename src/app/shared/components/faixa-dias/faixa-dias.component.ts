import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

import { hojeIso, partesDoDia, somarDias } from '../../../core/utils/datas-agenda';

/** Um dia na faixa. detalhe: texto pequeno embaixo ("3", "Folga", "Lotado"). */
export interface ItemFaixaDia {
  data: string;
  detalhe?: string;
  /** Dia sem horário (fechado, lotado): aparece apagado e não pode ser escolhido. */
  desativado?: boolean;
  /** Pontinho de destaque (ex.: tem agendamentos). */
  marcado?: boolean;
}

/**
 * Faixa horizontal de dias (Seg 22 → Ter 23 → …) que rola para o lado; o dia escolhido fica em destaque.
 * A cor do destaque vem de --faixa-destaque (a página pública usa a cor da loja; o painel, o azul da marca).
 */
@Component({
  selector: 'app-faixa-dias',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="faixa" role="listbox" [attr.aria-label]="rotulo()">
      @for (item of itensComRotulo(); track item.data) {
        <button
          type="button"
          role="option"
          class="dia"
          [class.dia--escolhido]="item.data === selecionado()"
          [class.dia--desativado]="item.desativado"
          [attr.aria-selected]="item.data === selecionado()"
          [attr.aria-disabled]="item.desativado || null"
          [attr.data-data]="item.data"
          [attr.aria-label]="item.rotuloLeitor"
          (click)="!item.desativado && escolher.emit(item.data)"
        >
          <span class="dia__semana">{{ item.semana }}</span>
          <span class="dia__numero">{{ item.numero }}</span>
          <span class="dia__detalhe">
            @if (item.marcado) {
              <span class="dia__ponto" aria-hidden="true"></span>
            }
            {{ item.detalhe ?? '' }}
          </span>
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }

    .faixa {
      position: relative;
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 4px 2px 8px;
      scroll-snap-type: x proximity;
      scrollbar-width: none;
    }

    .faixa::-webkit-scrollbar {
      display: none;
    }

    .dia {
      flex: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      width: 58px;
      padding: 10px 0 8px;
      border: 1px solid var(--faixa-borda, var(--cor-borda));
      border-radius: 16px;
      background: var(--faixa-fundo, #ffffff);
      color: var(--faixa-texto, var(--cor-texto));
      scroll-snap-align: center;
      transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
    }

    .dia:hover:not(.dia--desativado):not(.dia--escolhido) {
      border-color: var(--faixa-destaque, var(--cor-primaria));
    }

    .dia__semana {
      font-size: 12px;
      font-weight: 600;
      color: var(--faixa-suave, var(--cor-texto-suave));
      text-transform: capitalize;
    }

    .dia__numero {
      font-size: 20px;
      font-weight: 800;
      line-height: 1.1;
    }

    .dia__detalhe {
      display: flex;
      align-items: center;
      gap: 3px;
      min-height: 14px;
      font-size: 10px;
      font-weight: 700;
      color: var(--faixa-suave, var(--cor-texto-suave));
      white-space: nowrap;
    }

    .dia__ponto {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--faixa-destaque, var(--cor-primaria));
    }

    .dia--escolhido {
      border-color: var(--faixa-destaque, var(--cor-primaria));
      background: var(--faixa-destaque, var(--cor-primaria));
      color: #ffffff;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.18);
    }

    .dia--escolhido .dia__semana,
    .dia--escolhido .dia__detalhe {
      color: rgba(255, 255, 255, 0.85);
    }

    .dia--escolhido .dia__ponto {
      background: #ffffff;
    }

    .dia--desativado {
      opacity: 0.45;
      cursor: default;
    }
  `,
})
export class FaixaDiasComponent {
  readonly itens = input.required<ItemFaixaDia[]>();
  readonly selecionado = input<string | null>(null);
  readonly rotulo = input('Escolha o dia');
  readonly escolher = output<string>();

  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly itensComRotulo = computed(() => {
    const hoje = hojeIso();
    const amanha = somarDias(hoje, 1);
    return this.itens().map((item) => {
      const partes = partesDoDia(item.data);
      const semana = item.data === hoje ? 'Hoje' : item.data === amanha ? 'Amanhã' : partes.semana;
      return {
        ...item,
        semana,
        numero: partes.numero,
        rotuloLeitor: `${semana} ${partes.numero} de ${partes.mes}${item.detalhe ? ', ' + item.detalhe : ''}`,
      };
    });
  });

  constructor() {
    // mantém o dia escolhido visível quando ele muda (ex.: escolhido de fora da faixa)
    afterRenderEffect(() => {
      const data = this.selecionado();
      if (!data) {
        return;
      }
      const faixa = this.elemento.nativeElement.querySelector<HTMLElement>('.faixa');
      const botao = faixa?.querySelector<HTMLElement>(`[data-data="${data}"]`);
      if (faixa && botao) {
        // só rola a faixa para o lado (scrollIntoView rolaria a página inteira)
        faixa.scrollTo({ left: botao.offsetLeft - (faixa.clientWidth - botao.clientWidth) / 2, behavior: 'smooth' });
      }
    });
  }
}
