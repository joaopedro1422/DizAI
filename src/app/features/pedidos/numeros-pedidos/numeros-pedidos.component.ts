import { ChangeDetectionStrategy, Component, ElementRef, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';

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

@Component({
  selector: 'app-numeros-pedidos',
  imports: [CarregandoComponent, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './numeros-pedidos.component.html',
  styleUrls: [
    '../../agenda/numeros-agenda/numeros-agenda.component.css',
    '../../agenda/numeros-agenda/mapa-calor.css',
    './numeros-pedidos.component.css',
  ],
})
export class NumerosPedidosComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly toastService = inject(ToastService);
  private readonly relatorioPdf = inject(RelatorioPdfService);
  /** Gerando o PDF do relatório (o botão fica desligado). */
  protected readonly exportando = signal(false);

  protected readonly meses = mesesRecentes();
  /** Mês escolhido no seletor ("2026-10"); a tela abre no mês atual. null = vale a semana ou o ano. */
  protected readonly mes = signal<string | null>(this.meses[0].valor);
  /** Ano escolhido no seletor ("2026"); null = vale o mês ou a semana. */
  protected readonly ano = signal<string | null>(null);
  /** "Esta semana": de segunda até agora. */
  protected readonly semanaAtual = signal(false);
  protected readonly anos = anosDisponiveis();
  protected readonly numeros = signal<NumerosPedidos | null>(null);
  protected readonly carregando = signal(true);
  protected readonly dica = signal<Dica | null>(null);

  protected readonly textoPeriodo = computed(() => {
    const n = this.numeros();
    if (!n) return '';
    return this.semanaAtual() ? 'desta semana' : textoDoPeriodo(n);
  });

  /** "▲ 18%" contra o mesmo trecho do período anterior; null sem base para comparar. */
  protected readonly comparacao = computed(() => {
    const n = this.numeros();
    if (!n) return null;
    const anterior = Number(n.faturamentoAnterior ?? 0);
    if (anterior <= 0) return null;
    const variacao = ((Number(n.faturamento) - anterior) / anterior) * 100;
    const nome = n.periodoAnterior ?? '';
    const contra = nome.startsWith('a ') ? `à ${nome.slice(2)}` : nome.startsWith('os ') ? `aos ${nome.slice(3)}` : `a ${nome}`;
    return {
      sentido: Math.abs(variacao) < 0.5 ? 'igual' : variacao > 0 ? 'sobe' : 'desce',
      texto: Math.abs(variacao) < 0.5 ? 'igual' : `${variacao > 0 ? '▲' : '▼'} ${Math.abs(variacao).toFixed(0)}%`,
      contra: `em relação ${contra}`,
      anterior,
    };
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
    const agora = new Date();
    const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    return serie.map((ponto) => {
      const valor = Number(ponto.valor);
      const ehHoje = this.passo() === 1 && ponto.inicio === hoje;
      return {
        chave: ponto.inicio,
        altura: topo > 0 && valor > 0 ? Math.max(2, (valor / topo) * 100) : 0,
        // cada barra tem a sua data (a série rola para o lado); a de hoje é "hoje"
        rotulo: ehHoje ? 'hoje' : rotuloDoPonto(ponto.inicio, this.passo()),
        hoje: ehHoje,
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

  /** A série rola para o lado: ao carregar, ela abre nos dias mais recentes (com o "hoje"). */
  private readonly rolagemSerie = viewChild<ElementRef<HTMLElement>>('rolagemSerie');

  constructor() {
    effect(() => {
      const area = this.rolagemSerie()?.nativeElement;
      if (!area || !this.colunas().length) return;
      requestAnimationFrame(() => {
        const hoje = area.querySelector<HTMLElement>('.rotulos-x__item--hoje');
        area.scrollLeft = hoje ? Math.max(0, hoje.offsetLeft - area.clientWidth + hoje.offsetWidth * 4) : area.scrollWidth;
      });
    });
  }

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
        {
          rotulo: 'Faturamento',
          valor: real(n.faturamento),
          nota: this.comparacao()
            ? `${this.comparacao()!.texto} ${this.comparacao()!.contra} (${real(this.comparacao()!.anterior)})`
            : `pedidos entregues ${periodo}`,
        },
        { rotulo: 'Ticket médio', valor: real(n.valorMedio), nota: 'por pedido' },
        {
          rotulo: 'Entregues',
          valor: String(n.entregues),
          nota: n.cancelados > 0 ? pluralizar(n.cancelados, 'cancelado', 'cancelados') : 'nenhum cancelado',
        },
        { rotulo: 'Em andamento agora', valor: String(n.emAndamento), nota: `${real(n.valorEmAndamento)} a receber` },
        {
          rotulo: 'Preparo médio',
          valor: n.tempoMedioPreparoMinutos === null ? '—' : formatarDuracao(n.tempoMedioPreparoMinutos),
          nota: 'da confirmação até pronto',
        },
        { rotulo: 'Clientes', valor: String(n.clientes), nota: `${n.clientesRecorrentes} voltaram a comprar` },
        { rotulo: 'Pedidos do assistente', valor: String(n.peloAssistente), nota: `${n.foraDoHorario} fora do seu horário` },
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
        periodo: this.semanaAtual() ? 'Esta semana' : periodoDoRelatorio(n, nomeDoMes),
        arquivo: `relatorio-pedidos-${this.semanaAtual() ? 'esta-semana' : sufixoDoArquivo(n)}`,
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

  /** "Esta semana" liga e desliga; desligada, volta ao mês atual. */
  protected alternarSemana(): void {
    const ligar = !this.semanaAtual();
    this.semanaAtual.set(ligar);
    this.mes.set(ligar ? null : this.meses[0].valor);
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
    this.semanaAtual.set(false);
    void this.carregar();
  }

  protected escolherAno(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    if (!valor || valor === this.ano()) {
      return;
    }
    this.ano.set(valor);
    this.mes.set(null);
    this.semanaAtual.set(false);
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
      this.numeros.set(await this.pedidoService.numeros(
        this.semanaAtual() ? { semana: true } : ano ? { ano } : { mes: mes ?? this.meses[0].valor },
      ));
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR));
    } finally {
      this.carregando.set(false);
    }
  }
}
