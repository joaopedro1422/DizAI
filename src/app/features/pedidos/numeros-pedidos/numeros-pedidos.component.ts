import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../../core/api/erro-api';
import { NumerosPedidos } from '../../../core/models/pedido.model';
import { PedidoService } from '../../../core/services/pedido.service';
import { ToastService } from '../../../core/services/toast.service';
import { pluralizar } from '../../../core/utils/colecao.utils';
import { formatarDuracao } from '../../../core/utils/datas-agenda';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import {
  Dica,
  deIso,
  diaMes,
  dicaSobre,
  mesesRecentes,
  nomeDoMes,
  passoDaSerie,
  porcento,
  tituloDoPonto,
  topoDoEixo,
} from '../../../shared/graficos/graficos';
import { formatarReal } from '../textos-pedido';

const PERIODOS = [
  { dias: 7, rotulo: '7 dias' },
  { dias: 30, rotulo: '30 dias' },
  { dias: 90, rotulo: '90 dias' },
];

const DATA_CURTA = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

/** SEG -> "Segunda" (dica) e "Seg" (rótulo do eixo). */
const DIAS_DA_SEMANA: Record<string, { curto: string; longo: string }> = {
  SEG: { curto: 'Seg', longo: 'Segunda' },
  TER: { curto: 'Ter', longo: 'Terça' },
  QUA: { curto: 'Qua', longo: 'Quarta' },
  QUI: { curto: 'Qui', longo: 'Quinta' },
  SEX: { curto: 'Sex', longo: 'Sexta' },
  SAB: { curto: 'Sáb', longo: 'Sábado' },
  DOM: { curto: 'Dom', longo: 'Domingo' },
};

/**
 * Aba "Números" da tela de pedidos, no mesmo desenho dos Números da agenda (CSS compartilhado): o faturamento dos
 * entregues em destaque, os indicadores (entregues, ticket médio, em andamento, preparo médio), o faturamento dia a
 * dia, em que dia da semana mais se vende, os melhores clientes (e quantos voltaram a comprar) e os últimos
 * entregues. Pedidos de teste não contam.
 */
@Component({
  selector: 'app-numeros-pedidos',
  imports: [CarregandoComponent, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './numeros-pedidos.component.html',
  styleUrls: ['../../agenda/numeros-agenda/numeros-agenda.component.css', './numeros-pedidos.component.css'],
})
export class NumerosPedidosComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly toastService = inject(ToastService);

  protected readonly periodos = PERIODOS;
  protected readonly dias = signal(30);
  /** Mês escolhido no seletor ("2026-10"); null = vale o período de dias. */
  protected readonly mes = signal<string | null>(null);
  protected readonly meses = mesesRecentes();
  protected readonly numeros = signal<NumerosPedidos | null>(null);
  protected readonly carregando = signal(true);
  protected readonly dica = signal<Dica | null>(null);

  protected readonly textoPeriodo = computed(() => {
    const n = this.numeros();
    if (!n) return '';
    return n.mes ? `de ${nomeDoMes(n.mes).toLowerCase()}` : `dos últimos ${n.dias} dias`;
  });

  // ------------------------------------------------------------------ faturamento por dia/semana
  private readonly passo = computed(() => passoDaSerie(this.numeros()?.serie ?? []));
  protected readonly porSemana = computed(() => this.passo() === 7);
  protected readonly topoSerie = computed(() =>
    topoDoEixo(Math.max(0, ...(this.numeros()?.serie ?? []).map((p) => Number(p.valor)))),
  );
  protected readonly serieVazia = computed(() => this.topoSerie() === 0);
  protected readonly colunas = computed(() => {
    const serie = this.numeros()?.serie ?? [];
    const topo = this.topoSerie();
    const meio = Math.floor((serie.length - 1) / 2);
    return serie.map((ponto, i) => {
      const valor = Number(ponto.valor);
      return {
        chave: ponto.inicio,
        altura: topo > 0 && valor > 0 ? Math.max(2, (valor / topo) * 100) : 0,
        rotulo: i === 0 || i === meio || i === serie.length - 1 ? diaMes(deIso(ponto.inicio)) : '',
        titulo: tituloDoPonto(ponto.inicio, this.passo()),
        detalhe: `${formatarReal(valor)} · ${pluralizar(ponto.pedidos, 'pedido', 'pedidos')}`,
      };
    });
  });

  // ------------------------------------------------------------------ dias da semana (o melhor fica em destaque)
  protected readonly semana = computed(() => {
    const dias = this.numeros()?.porDiaDaSemana ?? [];
    const topo = topoDoEixo(Math.max(0, ...dias.map((d) => Number(d.valor))));
    const melhor = Math.max(0, ...dias.map((d) => Number(d.valor)));
    return dias.map((dia) => {
      const valor = Number(dia.valor);
      const nome = DIAS_DA_SEMANA[dia.dia] ?? { curto: dia.dia, longo: dia.dia };
      return {
        chave: dia.dia,
        rotulo: nome.curto,
        titulo: nome.longo,
        detalhe: `${formatarReal(valor)} · ${pluralizar(dia.pedidos, 'pedido', 'pedidos')}`,
        altura: topo > 0 && valor > 0 ? Math.max(2, (valor / topo) * 100) : 0,
        destaque: valor > 0 && valor === melhor,
      };
    });
  });
  protected readonly melhorDia = computed(() => this.semana().find((d) => d.destaque)?.titulo ?? null);

  // ------------------------------------------------------------------ clientes
  protected readonly clientes = computed(() => {
    const itens = this.numeros()?.melhoresClientes ?? [];
    const maior = Math.max(0, ...itens.map((c) => Number(c.valor)));
    return itens.map((cliente) => ({ ...cliente, largura: maior > 0 ? (Number(cliente.valor) / maior) * 100 : 0 }));
  });
  /** Parte dos clientes do período que comprou mais de uma vez. */
  protected readonly recorrencia = computed(() => {
    const n = this.numeros();
    return n && n.clientes > 0 ? (n.clientesRecorrentes / n.clientes) * 100 : 0;
  });

  ngOnInit(): void {
    void this.carregar();
  }

  protected escolherPeriodo(dias: number): void {
    if (dias === this.dias() && !this.mes()) {
      return;
    }
    this.dias.set(dias);
    this.mes.set(null);
    void this.carregar();
  }

  protected escolherMes(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    if (!valor || valor === this.mes()) {
      return;
    }
    this.mes.set(valor);
    void this.carregar();
  }

  protected real(valor: number): string {
    return formatarReal(Number(valor));
  }

  protected porcento(valor: number): string {
    return porcento(valor);
  }

  protected duracao(minutos: number): string {
    return formatarDuracao(minutos);
  }

  protected data(data: Date | null): string {
    return data ? DATA_CURTA.format(data) : '';
  }

  /** "150 mini salgados: 50 coxinha…" (o primeiro item do resumo, para reconhecer o pedido na lista). */
  protected descricao(resumo: { campo: string; valor: string }[]): string {
    return resumo.find((item) => item.campo.trim().toLowerCase().startsWith('item'))?.valor ?? '';
  }

  protected mostrarDica(evento: Event, grafico: string, titulo: string, detalhe: string): void {
    this.dica.set(dicaSobre(evento, grafico, titulo, detalhe));
  }

  protected esconderDica(): void {
    this.dica.set(null);
  }

  private async carregar(): Promise<void> {
    this.carregando.set(true);
    this.dica.set(null);
    try {
      const mes = this.mes();
      this.numeros.set(await this.pedidoService.numeros(mes ? { mes } : { dias: this.dias() }));
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR));
    } finally {
      this.carregando.set(false);
    }
  }
}
