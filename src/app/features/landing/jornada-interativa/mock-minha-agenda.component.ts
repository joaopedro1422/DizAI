import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { HorarioLinhaDemo, LinhaAgendaDemoComponent } from '../../demonstracao/telas-demo/linha-agenda-demo.component';
import { RoteiroDemo } from './roteiro-demo';
import { TelefoneDemoComponent } from './telefone-demo.component';

/** A semana na faixa da agenda (variante limpa do painel): quantos clientes em cada dia. */
const DIAS = [
  { semana: 'Hoje', numero: '22', detalhe: '3', marcado: true, hoje: true },
  { semana: 'Sex', numero: '23', detalhe: '1', marcado: true, hoje: false },   // na variante limpa "Amanhã" vira o dia da semana
  { semana: 'Sáb', numero: '24', detalhe: '2', marcado: true, hoje: false },
  { semana: 'Dom', numero: '25', detalhe: 'Fechado', marcado: false, hoje: false },
  { semana: 'Seg', numero: '26', detalhe: '', marcado: false, hoje: false },
  { semana: 'Ter', numero: '27', detalhe: '1', marcado: true, hoje: false },
];

/** O dia aberto na visualização completa: a Júlia de manhã e a Mariana, que o assistente acabou de marcar. */
const JULIA: HorarioLinhaDemo = {
  inicio: '11:00', fim: '12:30', nome: 'Júlia Martins', servicos: 'Pé e mão', whatsapp: '(83) 99812-3344', valor: 70,
  assistente: true,
};
const MARIANA: HorarioLinhaDemo = {
  inicio: '14:00', fim: '15:00', nome: 'Mariana', servicos: 'Esmaltação em gel', whatsapp: '(83) 98765-4321', valor: 60,
  assistente: true, novo: true,
};

/**
 * "Minha Agenda" do painel no tamanho real, na visualização completa (a linha do tempo, `LinhaAgendaDemoComponent`):
 * o dia de amanhã aberto e o horário que o assistente acabou de marcar (Mariana, esmaltação em gel às 14:00)
 * entrando no lugar do horário livre, com a estrelinha de "marcado pelo assistente".
 */
@Component({
  selector: 'app-mock-minha-agenda-jornada',
  imports: [IconeComponent, TelefoneDemoComponent, LinhaAgendaDemoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mock-minha-agenda.component.html',
  styleUrls: ['./tela-real.css', './mock-minha-agenda.component.css'],
})
export class MockMinhaAgendaJornadaComponent implements OnInit {
  private readonly roteiro = new RoteiroDemo(inject(DestroyRef));

  protected readonly novoHorario = signal(false);
  /** O expediente do dia na demonstração (das 11:00 às 15:00: a linha inteira, com a Mariana, cabe na tela). */
  protected readonly expediente = { inicio: '11:00', fim: '15:00' };
  protected readonly horarios = computed(() => (this.novoHorario() ? [JULIA, MARIANA] : [JULIA]));
  protected readonly dias = computed(() =>
    DIAS.map((dia) => (dia.numero === '23' && this.novoHorario() ? { ...dia, detalhe: '2' } : dia)),
  );

  ngOnInit(): void {
    if (this.roteiro.movimentoReduzido) {
      this.novoHorario.set(true);
      return;
    }
    this.roteiro.em(1600, () => this.novoHorario.set(true));
  }
}
