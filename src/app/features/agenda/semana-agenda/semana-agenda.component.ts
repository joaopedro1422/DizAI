import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';

import { DiaSemana } from '../../../core/models/agenda.model';
import { ToastService } from '../../../core/services/toast.service';
import { alternarItem, pluralizar } from '../../../core/utils/colecao.utils';
import { DIAS_SEMANA, minutosDoDia } from '../../../core/utils/datas-agenda';
import { BottomSheetComponent } from '../../../shared/components/bottom-sheet/bottom-sheet.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { InterruptorComponent } from '../../../shared/components/interruptor/interruptor.component';
import { DIA_PADRAO, MAXIMO_PERIODOS_POR_DIA, Trecho, paraHora, validarDia } from './semana-agenda';

/** Os dias da semana com os períodos de atendimento de cada um (Agenda → Horários e o onboarding). */
@Component({
  selector: 'app-semana-agenda',
  imports: [IconeComponent, InterruptorComponent, BottomSheetComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './semana-agenda.component.html',
  styleUrl: './semana-agenda.component.css',
})
export class SemanaAgendaComponent {
  readonly periodos = input.required<Record<DiaSemana, Trecho[]>>();
  readonly mudou = output<Record<DiaSemana, Trecho[]>>();

  private readonly toastService = inject(ToastService);

  protected readonly diasSemana = DIAS_SEMANA;
  protected readonly maximoPeriodos = MAXIMO_PERIODOS_POR_DIA;
  protected readonly diaAberto = signal<DiaSemana>(diaDeHoje());
  protected readonly copiando = signal(false);
  protected readonly diasParaCopiar = signal<DiaSemana[]>([]);

  protected readonly infoDiaAberto = computed(() => DIAS_SEMANA.find((d) => d.valor === this.diaAberto())!);
  protected readonly trechosDiaAberto = computed(() => this.periodos()[this.diaAberto()]);

  protected readonly erros = computed(() => {
    const erros: Partial<Record<DiaSemana, string>> = {};
    for (const dia of DIAS_SEMANA) {
      const erro = validarDia(this.periodos()[dia.valor]);
      if (erro) erros[dia.valor] = erro;
    }
    return erros;
  });

  protected readonly resumoSemana = computed(() =>
    DIAS_SEMANA.map((dia) => {
      const trechos = this.periodos()[dia.valor];
      return {
        ...dia,
        texto: trechos.length === 0 ? 'Fechado' : trechos.map((t) => `${t.inicio}–${t.fim}`).join('  ·  '),
        aberto: trechos.length > 0,
      };
    }),
  );

  protected escolherDia(dia: DiaSemana): void {
    this.diaAberto.set(dia);
  }

  protected alternarDiaAberto(aberto: boolean): void {
    this.definirTrechos(this.diaAberto(), aberto ? DIA_PADRAO.map((t) => ({ ...t })) : []);
  }

  protected alterarTrecho(indice: number, campo: keyof Trecho, evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    if (!valor) return;
    const trechos = this.trechosDiaAberto().map((t, i) => (i === indice ? { ...t, [campo]: valor.slice(0, 5) } : t));
    this.definirTrechos(this.diaAberto(), trechos);
  }

  protected abrirSeletor(evento: Event): void {
    try {
      (evento.target as HTMLInputElement).showPicker();
    } catch {
      // navegador sem showPicker ou sem gesto do usuário: segue digitando no campo
    }
  }

  /** Novo período depois do último, com 1 hora de pausa (ex.: almoço). */
  protected adicionarTrecho(): void {
    const trechos = this.trechosDiaAberto();
    const ultimo = trechos.at(-1);
    const inicio = ultimo ? Math.min(minutosDoDia(ultimo.fim) + 60, 22 * 60) : 8 * 60;
    const fim = Math.min(inicio + 4 * 60, 23 * 60 + 45);
    this.definirTrechos(this.diaAberto(), [...trechos, { inicio: paraHora(inicio), fim: paraHora(fim) }]);
  }

  protected removerTrecho(indice: number): void {
    this.definirTrechos(this.diaAberto(), this.trechosDiaAberto().filter((_, i) => i !== indice));
  }

  protected abrirCopia(): void {
    this.diasParaCopiar.set([]);
    this.copiando.set(true);
  }

  protected alternarDiaParaCopiar(dia: DiaSemana): void {
    this.diasParaCopiar.update((dias) => alternarItem(dias, dia));
  }

  protected marcarDiasUteis(): void {
    this.diasParaCopiar.set(
      (['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as DiaSemana[]).filter((d) => d !== this.diaAberto()),
    );
  }

  protected copiar(): void {
    const origem = this.trechosDiaAberto();
    const destinos = this.diasParaCopiar();
    const periodos = { ...this.periodos() };
    destinos.forEach((dia) => (periodos[dia] = origem.map((t) => ({ ...t }))));
    this.mudou.emit(periodos);
    this.copiando.set(false);
    this.toastService.mostrar(`Horários copiados para ${pluralizar(destinos.length, 'dia', 'dias')}`);
  }

  private definirTrechos(dia: DiaSemana, trechos: Trecho[]): void {
    this.mudou.emit({ ...this.periodos(), [dia]: trechos });
  }
}

function diaDeHoje(): DiaSemana {
  return DIAS_SEMANA[(new Date().getDay() + 6) % 7].valor;
}
