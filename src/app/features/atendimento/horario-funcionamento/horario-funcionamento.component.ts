import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { DiaSemana, PeriodoAtendimento } from '../../../core/models/agenda.model';
import { DIAS_SEMANA } from '../../../core/utils/datas-agenda';

/** Abertura padrão de um dia que acabou de ser ligado. */
const DIA_PADRAO = { inicio: '09:00', fim: '18:00' };

/**
 * Horário de funcionamento para "Só no meu horário": os 7 dias, cada um aberto ou fechado,
 * com um horário de abrir e de fechar. Recebe e devolve a lista de períodos (um por dia aberto).
 */
@Component({
  selector: 'app-horario-funcionamento',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="dias">
      @for (dia of dias(); track dia.valor) {
        <li class="dia" [class.dia--fechado]="!dia.periodo">
          <label class="dia__nome">
            <input type="checkbox" [checked]="!!dia.periodo" (change)="alternarDia(dia.valor, $event)">
            {{ dia.nome }}
          </label>
          @if (dia.periodo; as periodo) {
            <span class="dia__horas">
              <input
                class="dia__hora"
                type="time"
                step="900"
                [value]="periodo.inicio"
                [attr.aria-label]="'Abre ' + dia.nome"
                (click)="abrirSeletor($event)"
                (change)="mudarHora(dia.valor, 'inicio', $event)"
              >
              <span class="dia__ate">às</span>
              <input
                class="dia__hora"
                type="time"
                step="900"
                [value]="periodo.fim"
                [attr.aria-label]="'Fecha ' + dia.nome"
                (click)="abrirSeletor($event)"
                (change)="mudarHora(dia.valor, 'fim', $event)"
              >
            </span>
          } @else {
            <span class="dia__fechado">Fechado</span>
          }
        </li>
      }
    </ul>
  `,
  styles: `
    .dias {
      display: flex;
      flex-direction: column;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .dia {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-height: 52px;
      border-bottom: 1px solid var(--cor-borda-suave);
    }

    .dia:last-child {
      border-bottom: none;
    }

    .dia__nome {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      font-weight: 700;
      text-transform: capitalize;
      cursor: pointer;
    }

    .dia__nome input {
      width: 18px;
      height: 18px;
      accent-color: var(--cor-primaria);
    }

    .dia--fechado .dia__nome {
      color: var(--cor-texto-suave);
    }

    .dia__horas {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .dia__hora {
      width: 82px;
      min-height: 38px;
      padding: 0 4px;
      border: 1px solid #C3CBDA;
      border-radius: var(--raio-pequeno);
      background: var(--cor-fundo);
      font-size: 14px;
      font-weight: 700;
      text-align: center;
    }

    /* sem o relógio: o clique abre o seletor e o horário cabe inteiro no celular */
    .dia__hora::-webkit-calendar-picker-indicator {
      display: none;
    }

    .dia__hora:focus {
      border-color: var(--cor-primaria);
      outline: none;
      box-shadow: 0 0 0 3px rgba(30, 58, 114, 0.15);
    }

    .dia__ate,
    .dia__fechado {
      font-size: 13px;
      color: var(--cor-texto-suave);
    }
  `,
})
export class HorarioFuncionamentoComponent {
  readonly periodos = input.required<PeriodoAtendimento[]>();
  readonly mudou = output<PeriodoAtendimento[]>();

  /** Segunda a domingo, cada um com o seu período (null = fechado). */
  protected readonly dias = computed(() =>
    DIAS_SEMANA.map((dia) => ({
      valor: dia.valor,
      nome: dia.nome,
      periodo: this.periodos().find((p) => p.diaSemana === dia.valor) ?? null,
    })),
  );

  protected alternarDia(dia: DiaSemana, evento: Event): void {
    const aberto = (evento.target as HTMLInputElement).checked;
    const outros = this.periodos().filter((p) => p.diaSemana !== dia);
    this.emitir(aberto ? [...outros, { diaSemana: dia, ...DIA_PADRAO }] : outros);
  }

  protected mudarHora(dia: DiaSemana, campo: 'inicio' | 'fim', evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    if (!valor) {
      return;
    }
    this.emitir(this.periodos().map((p) => (p.diaSemana === dia ? { ...p, [campo]: valor.slice(0, 5) } : p)));
  }

  /** O clique no campo abre o seletor de horas (sem o ícone do relógio, no computador não abria nada). */
  protected abrirSeletor(evento: Event): void {
    try {
      (evento.target as HTMLInputElement).showPicker();
    } catch {
      // sem showPicker: segue digitando no campo
    }
  }

  /** Sempre na ordem da semana (segunda primeiro), como o backend devolve. */
  private emitir(periodos: PeriodoAtendimento[]): void {
    const ordem = DIAS_SEMANA.map((d) => d.valor);
    this.mudou.emit([...periodos].sort((a, b) => ordem.indexOf(a.diaSemana) - ordem.indexOf(b.diaSemana)));
  }
}
