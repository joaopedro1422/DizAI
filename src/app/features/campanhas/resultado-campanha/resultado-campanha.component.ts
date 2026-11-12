import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ResultadoCampanha, StatusEnvioCampanha } from '../../../core/models/campanha.model';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

const STATUS: Record<StatusEnvioCampanha, string> = {
  PENDENTE: 'Na fila',
  ENVIADO: 'Enviada',
  ENTREGUE: 'Entregue',
  LIDO: 'Lida',
  FALHOU: 'Não enviada',
  CONTROLE: 'Grupo de comparação',
};

/**
 * O relatório de uma campanha: quanto trouxe, o caminho das mensagens (enviadas → lidas → responderam → agendaram ou
 * compraram), a comparação com quem não recebeu e, no completo, cliente por cliente. Usado no modal do painel e no
 * histórico das Campanhas.
 */
@Component({
  selector: 'app-resultado-campanha',
  imports: [CurrencyPipe, DatePipe, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resultado-campanha.component.html',
  styleUrl: './resultado-campanha.component.css',
})
export class ResultadoCampanhaComponent {
  readonly resultado = input.required<ResultadoCampanha>();
  /** Sem a lista de clientes (o modal do painel). */
  readonly compacto = input(false);

  protected readonly verbo = computed(() => (this.resultado().servico ? 'agendaram' : 'compraram'));
  protected readonly verboUm = computed(() => (this.resultado().servico ? 'agendou' : 'comprou'));

  protected readonly etapas = computed(() => {
    const r = this.resultado();
    const base = Math.max(1, r.enviadas);
    return [
      { nome: 'Enviadas', valor: r.enviadas },
      { nome: 'Entregues', valor: r.entregues },
      { nome: 'Lidas', valor: r.lidas },
      { nome: 'Responderam', valor: r.responderam },
      { nome: r.servico ? 'Agendaram' : 'Compraram', valor: r.converteram },
    ].map((etapa) => ({ ...etapa, largura: Math.round((etapa.valor / base) * 100) }));
  });

  /** "17 de cada 100": a diferença entre quem recebeu e quem não recebeu (nunca negativa na frase). */
  protected readonly diferenca = computed(() => {
    const c = this.resultado().comparacao;
    return c ? Math.max(0, Math.round(c.taxaRecebeu - c.taxaNaoRecebeu)) : 0;
  });

  protected rotuloStatus(status: StatusEnvioCampanha): string {
    return STATUS[status];
  }
}
