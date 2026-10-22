import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
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

/**
 * "Minha Agenda" do painel no tamanho real: o dia de amanhã aberto e o horário que o assistente acabou de marcar
 * (Mariana, esmaltação em gel às 14:00) entrando na lista, com a estrelinha de "marcado pelo assistente".
 */
@Component({
  selector: 'app-mock-minha-agenda-jornada',
  imports: [IconeComponent, TelefoneDemoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mock-minha-agenda.component.html',
  styleUrls: ['./tela-real.css', './mock-minha-agenda.component.css'],
})
export class MockMinhaAgendaJornadaComponent implements OnInit {
  private readonly roteiro = new RoteiroDemo(inject(DestroyRef));

  protected readonly novoHorario = signal(false);
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
