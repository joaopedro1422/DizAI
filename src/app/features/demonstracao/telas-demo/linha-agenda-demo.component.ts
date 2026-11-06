import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Agendamento } from '../../../core/models/agenda.model';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { montarLinhaDoTempo } from '../../agenda/linha-do-tempo';
import { formatarReal } from '../../pedidos/textos-pedido';

/** Um horário de exemplo na linha do tempo (o mínimo da tela real). */
export interface HorarioLinhaDemo {
  inicio: string;
  fim: string;
  nome: string;
  servicos: string;
  whatsapp: string;
  valor: number;
  assistente?: boolean;
  /** O horário que acabou de entrar: aparece com animação (`.bloco--novo`). */
  novo?: boolean;
}

@Component({
  selector: 'app-linha-agenda-demo',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './linha-agenda-demo.component.html',
  styleUrl: './linha-agenda-demo.css',
})
export class LinhaAgendaDemoComponent {
  readonly horarios = input.required<HorarioLinhaDemo[]>();
  readonly expediente = input<{ inicio: string; fim: string } | null>(null);

  protected readonly linha = computed(() => {
    const horarios = this.horarios();
    const agendamentos = horarios.map(
      (h, i) =>
        ({
          id: String(i),
          inicio: h.inicio,
          fim: h.fim,
          nomeCliente: h.nome,
          servicos: h.servicos,
          whatsapp: h.whatsapp,
          valor: h.valor,
          origem: h.assistente ? 'WHATSAPP' : 'PAINEL',
          presencaConfirmada: false,
          produtos: [],
          duracaoMinutos: 0,
          novo: h.novo,
        }) as unknown as Agendamento,
    );
    return montarLinhaDoTempo([this.expediente() ?? this.expedientePelosHorarios()], agendamentos, null);
  });

  /** Da hora cheia antes do primeiro horário à hora cheia depois do último. */
  private expedientePelosHorarios(): { inicio: string; fim: string } {
    const horas = this.horarios().flatMap((h) => [h.inicio, h.fim]).sort();
    const inicio = horas[0] ?? '09:00';
    const fim = horas[horas.length - 1] ?? '18:00';
    const fimHora = Number(fim.slice(0, 2)) + (fim.slice(3) === '00' ? 0 : 1);
    return { inicio: `${inicio.slice(0, 2)}:00`, fim: `${String(fimHora).padStart(2, '0')}:00` };
  }

  protected novo(agendamento: Agendamento | undefined): boolean {
    return !!(agendamento as unknown as { novo?: boolean } | undefined)?.novo;
  }

  protected real(valor: number): string {
    return formatarReal(valor);
  }
}
