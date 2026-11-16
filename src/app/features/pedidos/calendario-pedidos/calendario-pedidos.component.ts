import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';

import { deIso, hojeIso, paraIso } from '../../../core/utils/datas-agenda';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

interface DiaDoMes {
  iso: string;
  numero: number;
  pedidos: number;
}

/**
 * O calendário da tela Pedidos (abre no modal pelo botão ao lado do dia): o mês em grade, com o número de pedidos
 * em andamento em cada dia. Hoje com o anel; o escolhido preenchido; dia que já passou e tem pedido fica em alerta
 * (pedido atrasado).
 */
@Component({
  selector: 'app-calendario-pedidos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconeComponent],
  template: `
    <div class="topo">
      <button type="button" class="btn-icone btn-icone--sem-borda" aria-label="Mês anterior" (click)="mudarMes(-1)">
        <app-icone nome="voltar" [tamanho]="18" [espessura]="2" />
      </button>
      <span class="topo__mes">{{ nomeDoMes() }}</span>
      <button type="button" class="btn-icone btn-icone--sem-borda" aria-label="Próximo mês" (click)="mudarMes(1)">
        <app-icone nome="avancar" [tamanho]="18" [espessura]="2" />
      </button>
    </div>
    <div class="semana" aria-hidden="true">
      @for (letra of letras; track $index) {
        <span>{{ letra }}</span>
      }
    </div>
    <div class="grade" role="grid" [attr.aria-label]="nomeDoMes()">
      @for (vazio of vazios(); track $index) {
        <span></span>
      }
      @for (dia of dias(); track dia.iso) {
        <button
          type="button"
          class="dia"
          [class.dia--hoje]="dia.iso === hoje"
          [class.dia--escolhido]="dia.iso === selecionado()"
          [class.dia--com]="dia.pedidos > 0"
          [class.dia--atrasado]="dia.pedidos > 0 && dia.iso < hoje"
          [attr.aria-label]="dia.numero + (dia.pedidos ? ', ' + dia.pedidos + (dia.pedidos === 1 ? ' pedido' : ' pedidos') : ', sem pedidos')"
          [attr.aria-pressed]="dia.iso === selecionado()"
          (click)="escolher.emit(dia.iso)"
        >
          <span class="dia__numero">{{ dia.numero }}</span>
          @if (dia.pedidos > 0) {
            <span class="dia__pedidos">{{ dia.pedidos }}</span>
          }
        </button>
      }
    </div>
    <p class="legenda"><span class="legenda__bolinha"></span>Número de pedidos em andamento no dia</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .topo {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .topo__mes {
      font-size: 17px;
      font-weight: 800;
      text-transform: capitalize;
    }

    .semana,
    .grade {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 6px;
    }

    .semana span {
      color: var(--cor-texto-suave);
      font-size: 12px;
      font-weight: 700;
      text-align: center;
    }

    .dia {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      aspect-ratio: 1;
      min-height: 44px;
      border: 1.5px solid transparent;
      border-radius: 14px;
      background: var(--cor-fundo-suave);
      color: var(--cor-texto);
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }

    .dia:hover:not(.dia--escolhido) {
      border-color: var(--cor-borda-forte);
    }

    .dia__numero {
      font-size: 15px;
      font-weight: 700;
      line-height: 1;
    }

    .dia--com {
      background: var(--cor-primaria-clara);
    }

    /* o número de pedidos: a bolinha amarela (o detalhe da marca) */
    .dia__pedidos {
      min-width: 20px;
      padding: 1px 6px;
      border-radius: 999px;
      background: var(--cor-gema);
      color: var(--cor-noite);
      font-family: var(--fonte-numero);
      font-size: 11px;
      font-weight: 800;
      line-height: 1.5;
    }

    .dia--hoje {
      border-color: var(--cor-primaria);
    }

    .dia--atrasado .dia__pedidos {
      background: var(--cor-erro);
      color: #ffffff;
    }

    .dia--escolhido {
      border-color: var(--cor-noite);
      background: var(--cor-noite);
      color: #ffffff;
    }

    .legenda {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--cor-texto-suave);
      font-size: 12.5px;
    }

    .legenda__bolinha {
      width: 12px;
      height: 12px;
      border-radius: 999px;
      background: var(--cor-gema);
    }
  `,
})
export class CalendarioPedidosComponent {
  /** "AAAA-MM-DD" → quantos pedidos em andamento. */
  readonly contagem = input.required<Map<string, number>>();
  readonly selecionado = input.required<string>();
  readonly escolher = output<string>();

  protected readonly hoje = hojeIso();
  protected readonly letras = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

  /** O 1º dia do mês mostrado; abre no mês do dia escolhido. */
  private readonly inicioDoMes = linkedSignal(() => this.selecionado().slice(0, 8) + '01');

  protected readonly nomeDoMes = computed(() =>
    deIso(this.inicioDoMes()).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
  );
  /** Espaços antes do dia 1 (a semana começa na segunda). */
  protected readonly vazios = computed(() => Array.from({ length: (deIso(this.inicioDoMes()).getDay() + 6) % 7 }));
  protected readonly dias = computed<DiaDoMes[]>(() => {
    const inicio = deIso(this.inicioDoMes());
    const total = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0).getDate();
    return Array.from({ length: total }, (_, i) => {
      const iso = paraIso(new Date(inicio.getFullYear(), inicio.getMonth(), i + 1, 12));
      return { iso, numero: i + 1, pedidos: this.contagem().get(iso) ?? 0 };
    });
  });

  protected mudarMes(direcao: 1 | -1): void {
    const atual = deIso(this.inicioDoMes());
    this.inicioDoMes.set(paraIso(new Date(atual.getFullYear(), atual.getMonth() + direcao, 1, 12)));
  }
}
