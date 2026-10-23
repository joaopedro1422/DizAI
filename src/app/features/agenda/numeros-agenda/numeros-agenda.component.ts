import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../../core/api/erro-api';
import { NumerosAgenda, PontoSerie } from '../../../core/models/agenda.model';
import { AgendaService } from '../../../core/services/agenda.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { ToastService } from '../../../core/services/toast.service';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { formatarReal } from '../../pedidos/textos-pedido';
import { pluralizar } from '../../../core/utils/colecao.utils';
import { Dica, deIso, diaMes, dicaSobre, mesesRecentes, nomeDoMes, passoDaSerie, porcento, tituloDoPonto, topoDoEixo } from '../../../shared/graficos/graficos';

const PERIODOS = [
  { dias: 7, rotulo: '7 dias' },
  { dias: 30, rotulo: '30 dias' },
  { dias: 90, rotulo: '90 dias' },
];

/**
 * Cores das fatias do "Faturamento por serviço", sempre nesta ordem (a cor segue a posição na lista, que já vem do
 * maior para o menor). Validadas para daltonismo lado a lado; "Outros" é cinza. Ver --serie-* no CSS.
 */
const CORES_FATIAS = ['var(--serie-1)', 'var(--serie-2)', 'var(--serie-3)', 'var(--serie-4)', 'var(--serie-5)'];
const COR_OUTROS = 'var(--serie-outros)';

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
 * Aba "Números" da agenda: o faturamento dos atendimentos em destaque (o cartão azul), os indicadores do período,
 * o gráfico do faturamento dia a dia (ou por semana em 90 dias), quanto cada serviço faturou (barra 100% + tabela),
 * os serviços mais feitos, por profissional (2+) e a parte de produtos vendidos no balcão ("Registrar venda").
 * Gráficos em HTML/CSS, sem biblioteca; cada marca tem dica ao passar o mouse ou tocar.
 */
@Component({
  selector: 'app-numeros-agenda',
  imports: [CarregandoComponent, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './numeros-agenda.component.html',
  styleUrl: './numeros-agenda.component.css',
})
export class NumerosAgendaComponent implements OnInit {
  private readonly agendaService = inject(AgendaService);
  private readonly produtoService = inject(ProdutoService);
  private readonly toastService = inject(ToastService);

  protected readonly periodos = PERIODOS;
  protected readonly dias = signal(30);
  /** Mês escolhido no seletor ("2026-10"); null = vale o período de dias. */
  protected readonly mes = signal<string | null>(null);
  protected readonly meses = mesesRecentes();
  protected readonly nomeDoMes = nomeDoMes;
  protected readonly numeros = signal<NumerosAgenda | null>(null);
  protected readonly carregando = signal(true);
  /** Dica aberta e em qual gráfico ('serie', 'fatias', 'divisao'): uma por vez. */
  protected readonly dica = signal<Dica | null>(null);

  /** Período por extenso, para as notas: "dos últimos 30 dias" / "de outubro de 2026". */
  protected readonly textoPeriodo = computed(() => {
    const n = this.numeros();
    if (!n) return '';
    return n.mes ? `de ${nomeDoMes(n.mes).toLowerCase()}` : `dos últimos ${n.dias} dias`;
  });

  // ------------------------------------------------------------------ gráfico do período (colunas)
  protected readonly porSemana = computed(() => (this.numeros()?.serie.length ?? 0) > 1 && this.passoDaSerie() === 7);
  private readonly passoDaSerie = computed(() => passoDaSerie(this.numeros()?.serie ?? []));
  protected readonly topoSerie = computed(() =>
    topoDoEixo(Math.max(0, ...(this.numeros()?.serie ?? []).map((p) => Number(p.valor)))),
  );
  protected readonly colunas = computed(() => {
    const serie = this.numeros()?.serie ?? [];
    const topo = this.topoSerie();
    const meio = Math.floor((serie.length - 1) / 2);
    return serie.map((ponto, i) => {
      const valor = Number(ponto.valor);
      const data = deIso(ponto.inicio);
      return {
        chave: ponto.inicio,
        altura: topo > 0 && valor > 0 ? Math.max(2, (valor / topo) * 100) : 0,
        rotulo: i === 0 || i === meio || i === serie.length - 1 ? diaMes(data) : '',
        titulo: this.tituloDoPonto(ponto),
        detalhe: `${formatarReal(valor)} · ${ponto.atendimentos} ${ponto.atendimentos === 1 ? 'atendimento' : 'atendimentos'}`,
      };
    });
  });
  protected readonly serieVazia = computed(() => this.topoSerie() === 0);

  // ------------------------------------------------------------------ faturamento por serviço (barra 100%)
  protected readonly fatias = computed(() => {
    const itens = this.numeros()?.faturamentoPorServico ?? [];
    const total = itens.reduce((soma, item) => soma + Number(item.valor), 0);
    let corIndice = 0;
    return itens.map((item) => ({
      ...item,
      valor: Number(item.valor),
      percentual: total > 0 ? (Number(item.valor) / total) * 100 : 0,
      cor: item.nome === 'Outros' ? COR_OUTROS : CORES_FATIAS[corIndice++ % CORES_FATIAS.length],
    }));
  });

  // ------------------------------------------------------------------ barras simples
  protected readonly maisFeitos = computed(() => {
    const itens = this.numeros()?.servicosMaisAgendados ?? [];
    const maior = Math.max(1, ...itens.map((i) => i.quantidade));
    return itens.map((item) => ({ ...item, largura: (item.quantidade / maior) * 100 }));
  });
  protected readonly profissionais = computed(() => {
    const itens = this.numeros()?.porProfissional ?? [];
    const maior = Math.max(0, ...itens.map((i) => Number(i.faturamento)));
    return itens.map((item) => ({
      ...item,
      largura: maior > 0 ? (Number(item.faturamento) / maior) * 100 : 0,
    }));
  });
  protected readonly maisVendidos = computed(() => {
    const itens = this.numeros()?.produtosMaisVendidos ?? [];
    const maior = Math.max(1, ...itens.map((i) => i.quantidade));
    return itens.map((item) => ({ ...item, largura: (item.quantidade / maior) * 100 }));
  });

  // ------------------------------------------------------------------ dias mais movimentados (por atendimentos)
  protected readonly semana = computed(() => {
    const dias = this.numeros()?.porDiaDaSemana ?? [];
    const topo = Math.max(0, ...dias.map((d) => d.atendimentos));
    return dias.map((dia) => {
      const nome = DIAS_DA_SEMANA[dia.dia] ?? { curto: dia.dia, longo: dia.dia };
      return {
        chave: dia.dia,
        rotulo: nome.curto,
        titulo: nome.longo,
        detalhe: `${pluralizar(dia.atendimentos, 'atendimento', 'atendimentos')} · ${formatarReal(Number(dia.valor))}`,
        altura: topo > 0 && dia.atendimentos > 0 ? Math.max(2, (dia.atendimentos / topo) * 100) : 0,
        destaque: dia.atendimentos > 0 && dia.atendimentos === topo,
      };
    });
  });
  protected readonly melhorDia = computed(() => this.semana().find((d) => d.destaque)?.titulo ?? null);

  // ------------------------------------------------------------------ melhores clientes
  protected readonly clientes = computed(() => {
    const itens = this.numeros()?.melhoresClientes ?? [];
    const maior = Math.max(0, ...itens.map((c) => Number(c.valor)));
    return itens.map((cliente) => ({ ...cliente, largura: maior > 0 ? (Number(cliente.valor) / maior) * 100 : 0 }));
  });
  /** Parte dos clientes do período que voltou mais de uma vez. */
  protected readonly recorrencia = computed(() => {
    const n = this.numeros();
    return n && n.clientes > 0 ? (n.clientesRecorrentes / n.clientes) * 100 : 0;
  });

  /** Quanto do faturamento total (atendimentos + produtos) veio de cada lado. */
  protected readonly divisao = computed(() => {
    const n = this.numeros();
    const atendimentos = Number(n?.faturamento ?? 0);
    const produtos = Number(n?.faturamentoProdutos ?? 0);
    const total = atendimentos + produtos;
    return {
      total,
      atendimentos: total > 0 ? (atendimentos / total) * 100 : 0,
      produtos: total > 0 ? (produtos / total) * 100 : 0,
    };
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

  /** O mês ainda tem dias pela frente (o atual): mostra o que falta marcado nele. */
  protected mesAtualOuFuturo(mes: string): boolean {
    return mes >= this.meses[0].valor;
  }

  /** A parte de produtos aparece com produto à venda cadastrado ou com alguma venda no período. */
  protected mostrarProdutos(n: NumerosAgenda): boolean {
    return n.produtosVendidos > 0 || this.produtoService.produtos().some((produto) => produto.produtoAVenda);
  }

  protected real(valor: number): string {
    return formatarReal(Number(valor));
  }

  protected porcento(valor: number): string {
    return porcento(valor);
  }

  /** Abre a dica sobre a marca (mouse, foco ou toque), posicionada em relação ao gráfico. */
  protected mostrarDica(evento: Event, grafico: string, titulo: string, detalhe: string): void {
    this.dica.set(dicaSobre(evento, grafico, titulo, detalhe));
  }

  protected esconderDica(): void {
    this.dica.set(null);
  }

  private tituloDoPonto(ponto: PontoSerie): string {
    return tituloDoPonto(ponto.inicio, this.passoDaSerie());
  }

  private async carregar(): Promise<void> {
    this.carregando.set(true);
    this.dica.set(null);
    try {
      const mes = this.mes();
      this.numeros.set(await this.agendaService.numeros(mes ? { mes } : { dias: this.dias() }));
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR));
    } finally {
      this.carregando.set(false);
    }
  }
}
