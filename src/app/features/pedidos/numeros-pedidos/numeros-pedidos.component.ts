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
  dicaSobre,
  mesesRecentes,
  anosDisponiveis,
  nomeDaSerie,
  passoDaSerie,
  rotuloDoPonto,
  textoDoPeriodo,
  porcento,
  tituloDoPonto,
  topoDoEixo,
  nomeDoMes,
} from '../../../shared/graficos/graficos';
import {
  DIA_DA_SEMANA_POR_EXTENSO,
  DestaqueRelatorio,
  RelatorioPdfService,
  SecaoRelatorio,
  periodoDoRelatorio,
  sufixoDoArquivo,
} from '../../../shared/relatorio/relatorio-pdf.service';
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
  private readonly relatorioPdf = inject(RelatorioPdfService);
  /** Gerando o PDF do relatório (o botão fica desligado). */
  protected readonly exportando = signal(false);

  protected readonly periodos = PERIODOS;
  protected readonly dias = signal(30);
  /** Mês escolhido no seletor ("2026-10"); null = vale o período de dias. */
  protected readonly mes = signal<string | null>(null);
  protected readonly meses = mesesRecentes();
  /** Ano escolhido no seletor ("2026"); null = vale o mês ou o período de dias. */
  protected readonly ano = signal<string | null>(null);
  protected readonly anos = anosDisponiveis();
  protected readonly numeros = signal<NumerosPedidos | null>(null);
  protected readonly carregando = signal(true);
  protected readonly dica = signal<Dica | null>(null);

  protected readonly textoPeriodo = computed(() => {
    const n = this.numeros();
    return n ? textoDoPeriodo(n) : '';
  });

  // ------------------------------------------------------------------ faturamento por dia/semana
  private readonly passo = computed(() => passoDaSerie(this.numeros()?.serie ?? []));
  /** "por dia", "por semana" (90 dias) ou "por mês" (ano). */
  protected readonly nomeDaSerie = computed(() => nomeDaSerie(this.passo()));
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
        rotulo: i === 0 || i === meio || i === serie.length - 1 ? rotuloDoPonto(ponto.inicio, this.passo()) : '',
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

  // ------------------------------------------------------------------ produtos que mais vendem
  protected readonly maisVendidos = computed(() => {
    const itens = this.numeros()?.produtosMaisVendidos ?? [];
    const maior = Math.max(0, ...itens.map((p) => Number(p.valor)));
    return itens.map((item) => ({ ...item, largura: maior > 0 ? (Number(item.valor) / maior) * 100 : 0 }));
  });

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

  /** "Exportar PDF": tudo o que a tela mostra, do mesmo período, num relatório com a logo e o nome da loja. */
  protected async exportarPdf(): Promise<void> {
    const n = this.numeros();
    if (!n || this.exportando()) {
      return;
    }
    this.exportando.set(true);
    try {
      const real = (valor: number) => formatarReal(Number(valor));
      const periodo = this.textoPeriodo();
      const passo = this.passo();
      const destaques: DestaqueRelatorio[] = [
        { rotulo: 'Faturamento', valor: real(n.faturamento), nota: `pedidos entregues ${periodo}` },
        {
          rotulo: 'Entregues',
          valor: String(n.entregues),
          nota: n.cancelados > 0 ? pluralizar(n.cancelados, 'cancelado', 'cancelados') : 'nenhum cancelado',
        },
        { rotulo: 'Ticket médio', valor: real(n.valorMedio), nota: 'por pedido' },
        { rotulo: 'Em andamento agora', valor: String(n.emAndamento), nota: `${real(n.valorEmAndamento)} a receber` },
        {
          rotulo: 'Preparo médio',
          valor: n.tempoMedioPreparoMinutos === null ? '—' : formatarDuracao(n.tempoMedioPreparoMinutos),
          nota: 'da confirmação até pronto',
        },
        { rotulo: 'Clientes', valor: String(n.clientes), nota: `${n.clientesRecorrentes} voltaram a comprar` },
      ];
      const secoes: SecaoRelatorio[] = [
        // por semana (90 dias) ou por mês (ano): a tabela completa ao lado do gráfico
        ...(passo !== 1
          ? [{
              titulo: passo === 7 ? 'Semana a semana' : 'Mês a mês',
              colunas: [passo === 7 ? 'Semana' : 'Mês', 'Pedidos', 'Faturamento'],
              linhas: n.serie.map((p) => [tituloDoPonto(p.inicio, passo), String(p.pedidos), real(p.valor)]),
              direita: [1, 2],
              vazio: '',
            }]
          : []),
        {
          titulo: 'Dias que mais vendem',
          subtitulo: this.melhorDia() ? `${this.melhorDia()} é o seu melhor dia ${periodo}` : 'Faturamento por dia da semana',
          colunas: ['Dia da semana', 'Pedidos', 'Faturamento'],
          linhas: n.porDiaDaSemana.map((d) => [DIA_DA_SEMANA_POR_EXTENSO[d.dia] ?? d.dia, String(d.pedidos), real(d.valor)]),
          direita: [1, 2],
          vazio: '',
        },
        {
          titulo: 'Produtos que mais vendem',
          subtitulo: `Pelo produto escolhido ao confirmar ou registrar ${periodo}`,
          colunas: ['#', 'Produto', 'Pedidos', 'Faturamento'],
          linhas: this.maisVendidos().map((p, i) => [`${i + 1}º`, p.nome, String(p.pedidos), real(p.valor)]),
          direita: [2, 3],
          vazio: 'Nenhum pedido entregue com produto escolhido no período.',
        },
        {
          titulo: 'Melhores clientes',
          subtitulo: n.clientes > 0
            ? `${n.clientesRecorrentes} de ${n.clientes} clientes voltaram a comprar (${porcento(this.recorrencia())})`
            : undefined,
          colunas: ['#', 'Cliente', 'Pedidos', 'Total'],
          linhas: this.clientes().map((c, i) => [`${i + 1}º`, c.nome, String(c.pedidos), real(c.valor)]),
          direita: [2, 3],
          vazio: 'Nenhum pedido entregue no período.',
        },
        {
          titulo: 'Entregues no período',
          subtitulo: 'Os mais recentes primeiro',
          colunas: ['Data', 'Cliente', 'Itens', 'Valor'],
          linhas: n.entreguesRecentes.map((pedido) => [
            this.data(pedido.entregueEm),
            pedido.nomeCliente || pedido.whatsapp || 'Cliente',
            this.descricao(pedido.resumo),
            real(pedido.valor),
          ]),
          direita: [3],
          vazio: 'Nenhum pedido entregue no período.',
        },
      ];
      await this.relatorioPdf.exportar({
        titulo: 'Relatório de pedidos',
        periodo: periodoDoRelatorio(n, nomeDoMes),
        arquivo: `relatorio-pedidos-${sufixoDoArquivo(n)}`,
        destaques,
        grafico: {
          titulo: `Faturamento ${this.nomeDaSerie()}`,
          subtitulo: `Pedidos entregues ${periodo}`,
          pontos: n.serie.map((p) => ({ rotulo: rotuloDoPonto(p.inicio, passo), valor: Number(p.valor) })),
          formatar: real,
          vazio: 'Nenhum pedido entregue neste período ainda.',
        },
        secoes,
      });
    } catch (erro) {
      console.error('Relatório em PDF', erro);
      this.toastService.mostrar('Não foi possível gerar o PDF. Tente de novo.');
    } finally {
      this.exportando.set(false);
    }
  }

  protected escolherPeriodo(dias: number): void {
    if (dias === this.dias() && !this.mes() && !this.ano()) {
      return;
    }
    this.dias.set(dias);
    this.mes.set(null);
    this.ano.set(null);
    void this.carregar();
  }

  protected escolherMes(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    if (!valor || valor === this.mes()) {
      return;
    }
    this.mes.set(valor);
    this.ano.set(null);
    void this.carregar();
  }

  protected escolherAno(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    if (!valor || valor === this.ano()) {
      return;
    }
    this.ano.set(valor);
    this.mes.set(null);
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
      const ano = this.ano();
      const mes = this.mes();
      this.numeros.set(await this.pedidoService.numeros(ano ? { ano } : mes ? { mes } : { dias: this.dias() }));
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR));
    } finally {
      this.carregando.set(false);
    }
  }
}
