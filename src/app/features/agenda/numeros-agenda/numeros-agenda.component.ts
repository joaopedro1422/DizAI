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
import {
  Dica,
  anosDisponiveis,
  dicaSobre,
  mesesRecentes,
  nomeDaSerie,
  nomeDoMes,
  passoDaSerie,
  porcento,
  rotuloDoPonto,
  textoDoPeriodo,
  tituloDoPonto,
  topoDoEixo,
} from '../../../shared/graficos/graficos';
import {
  DIA_DA_SEMANA_POR_EXTENSO,
  DestaqueRelatorio,
  RelatorioPdfService,
  SecaoRelatorio,
  periodoDoRelatorio,
  sufixoDoArquivo,
} from '../../../shared/relatorio/relatorio-pdf.service';

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
  /** "Calcular comissão" aberto e a porcentagem digitada (0 a 100). */
  protected readonly comissaoAberta = signal(false);
  protected readonly comissao = signal<number | null>(null);
  protected readonly anos = anosDisponiveis();
  protected readonly nomeDoMes = nomeDoMes;
  protected readonly numeros = signal<NumerosAgenda | null>(null);
  protected readonly carregando = signal(true);
  /** Dica aberta e em qual gráfico ('serie', 'fatias', 'divisao'): uma por vez. */
  protected readonly dica = signal<Dica | null>(null);

  /** Período por extenso, para as notas: "dos últimos 30 dias", "de outubro de 2026" ou "de 2026". */
  protected readonly textoPeriodo = computed(() => {
    const n = this.numeros();
    if (!n) return '';
    return this.semanaAtual() ? 'desta semana' : textoDoPeriodo(n);
  });

  // ------------------------------------------------------------------ gráfico do período (colunas)
  private readonly passoDaSerie = computed(() => passoDaSerie(this.numeros()?.serie ?? []));
  /** "por dia", "por semana" (90 dias) ou "por mês" (ano). */
  protected readonly nomeDaSerie = computed(() => nomeDaSerie(this.passoDaSerie()));
  protected readonly topoSerie = computed(() =>
    topoDoEixo(Math.max(0, ...(this.numeros()?.serie ?? []).map((p) => Number(p.valor)))),
  );
  protected readonly colunas = computed(() => {
    const serie = this.numeros()?.serie ?? [];
    const topo = this.topoSerie();
    const meio = Math.floor((serie.length - 1) / 2);
    return serie.map((ponto, i) => {
      const valor = Number(ponto.valor);
      return {
        chave: ponto.inicio,
        altura: topo > 0 && valor > 0 ? Math.max(2, (valor / topo) * 100) : 0,
        rotulo: i === 0 || i === meio || i === serie.length - 1 ? rotuloDoPonto(ponto.inicio, this.passoDaSerie()) : '',
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
    const porcentagem = this.comissao();
    return itens.map((item) => ({
      ...item,
      largura: maior > 0 ? (Number(item.faturamento) / maior) * 100 : 0,
      // a comissão de cada um sobre o que ele faturou no período
      comissao: porcentagem != null ? (Number(item.faturamento) * porcentagem) / 100 : null,
    }));
  });
  /** A soma das comissões (o que sai do faturamento) e o que fica para o negócio. */
  protected readonly totalComissoes = computed(() => {
    const total = this.profissionais().reduce((soma, p) => soma + (p.comissao ?? 0), 0);
    const faturado = this.profissionais().reduce((soma, p) => soma + Number(p.faturamento), 0);
    return { total, fica: faturado - total };
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
      const passo = this.passoDaSerie();
      const destaques: DestaqueRelatorio[] = [
        { rotulo: 'Faturamento dos atendimentos', valor: real(n.faturamento), nota: `atendimentos ${periodo}` },
        { rotulo: 'Ticket médio', valor: real(n.valorMedio), nota: 'por atendimento' },
        {
          rotulo: 'Atendimentos',
          valor: String(n.realizados),
          nota: n.cancelados > 0 ? pluralizar(n.cancelados, 'cancelado', 'cancelados') : 'nenhum cancelado',
        },
        ...(this.mostrarPrevistos(n)
          ? [{
              rotulo: this.rotuloPrevistos(n),
              valor: String(n.previstos),
              nota: `${real(n.valorPrevisto)} previstos`,
            }]
          : []),
        { rotulo: 'Clientes', valor: String(n.clientes), nota: `${n.clientesRecorrentes} voltaram mais de uma vez` },
        ...(this.mostrarProdutos(n)
          ? [{
              rotulo: 'Faturado com produtos',
              valor: real(n.faturamentoProdutos),
              nota: pluralizar(n.produtosVendidos, 'produto vendido', 'produtos vendidos'),
            }]
          : []),
      ];
      const secoes: SecaoRelatorio[] = [
        {
          titulo: 'Faturamento por serviço',
          subtitulo: 'Quanto cada serviço trouxe no período',
          colunas: ['Serviço', 'Atendimentos', 'Parte', 'Faturamento'],
          linhas: this.fatias().map((f) => [f.nome, `${f.quantidade}×`, porcento(f.percentual), real(f.valor)]),
          direita: [1, 2, 3],
          vazio: 'Nenhum atendimento com valor no período.',
        },
        // por semana (90 dias) ou por mês (ano): a tabela completa ao lado do gráfico
        ...(passo !== 1
          ? [{
              titulo: passo === 7 ? 'Semana a semana' : 'Mês a mês',
              colunas: [passo === 7 ? 'Semana' : 'Mês', 'Atendimentos', 'Faturamento'],
              linhas: n.serie.map((p) => [tituloDoPonto(p.inicio, passo), String(p.atendimentos), real(p.valor)]),
              direita: [1, 2],
              vazio: '',
            }]
          : []),
        {
          titulo: 'Serviços mais feitos',
          subtitulo: 'Quantas vezes cada um foi feito',
          colunas: ['#', 'Serviço', 'Vezes'],
          linhas: this.maisFeitos().map((item, i) => [`${i + 1}º`, item.nome, `${item.quantidade}×`]),
          direita: [2],
          vazio: 'Nenhum atendimento no período.',
        },
        {
          titulo: 'Dias mais movimentados',
          subtitulo: this.melhorDia() ? `${this.melhorDia()} é o dia mais cheio ${periodo}` : 'Atendimentos por dia da semana',
          colunas: ['Dia da semana', 'Atendimentos', 'Faturamento'],
          linhas: n.porDiaDaSemana.map((d) => [DIA_DA_SEMANA_POR_EXTENSO[d.dia] ?? d.dia, String(d.atendimentos), real(d.valor)]),
          direita: [1, 2],
          vazio: '',
        },
        {
          titulo: 'Melhores clientes',
          subtitulo: n.clientes > 0
            ? `${n.clientesRecorrentes} de ${n.clientes} clientes voltaram mais de uma vez (${porcento(this.recorrencia())})`
            : undefined,
          colunas: ['#', 'Cliente', 'Atendimentos', 'Total'],
          linhas: this.clientes().map((c, i) => [`${i + 1}º`, c.nome, String(c.quantidade), real(c.valor)]),
          direita: [2, 3],
          vazio: 'Nenhum cliente atendido no período.',
        },
        ...(this.profissionais().length > 0
          ? [{
              titulo: 'Por profissional',
              subtitulo: 'Faturamento dos atendimentos de cada um',
              colunas: this.comissao() != null
                ? ['Profissional', 'Atendimentos', 'Faturamento', `Comissão (${this.comissao()}%)`]
                : ['Profissional', 'Atendimentos', 'Faturamento'],
              linhas: this.profissionais().map((p) => [
                p.nome, String(p.realizados), real(p.faturamento), ...(p.comissao != null ? [real(p.comissao)] : []),
              ]),
              direita: this.comissao() != null ? [1, 2, 3] : [1, 2],
              vazio: '',
            }]
          : []),
        ...(this.mostrarProdutos(n)
          ? [{
              titulo: 'Produtos mais vendidos',
              subtitulo: `${real(n.faturamentoProdutos)} com produtos · ${pluralizar(n.produtosVendidos, 'produto vendido', 'produtos vendidos')}`,
              colunas: ['Produto', 'Quantidade', 'Faturamento'],
              linhas: this.maisVendidos().map((item) => [item.nome, `${item.quantidade}×`, real(item.valor)]),
              direita: [1, 2],
              vazio: 'Nenhuma venda registrada no período.',
            }]
          : []),
      ];
      await this.relatorioPdf.exportar({
        titulo: 'Relatório da agenda',
        periodo: this.semanaAtual() ? 'Esta semana' : periodoDoRelatorio(n, nomeDoMes),
        arquivo: `relatorio-agenda-${this.semanaAtual() ? 'esta-semana' : sufixoDoArquivo(n)}`,
        destaques,
        grafico: {
          titulo: `Faturamento ${this.nomeDaSerie()}`,
          subtitulo: `Atendimentos que já aconteceram ${periodo}`,
          pontos: n.serie.map((p) => ({ rotulo: rotuloDoPonto(p.inicio, passo), valor: Number(p.valor) })),
          formatar: real,
          vazio: 'Nenhum atendimento com valor neste período ainda.',
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

  protected alternarComissao(): void {
    this.comissaoAberta.update((aberta) => !aberta);
    if (!this.comissaoAberta()) this.comissao.set(null);
  }

  protected definirComissao(evento: Event): void {
    const texto = (evento.target as HTMLInputElement).value.replace(',', '.');
    const valor = Number(texto);
    this.comissao.set(texto.trim() === '' || Number.isNaN(valor) ? null : Math.min(100, Math.max(0, valor)));
  }

  /** "Ainda nesta semana", "Ainda neste mês" ou "Ainda neste ano". */
  protected rotuloPrevistos(n: NumerosAgenda): string {
    if (this.semanaAtual()) return 'Ainda nesta semana';
    return n.ano ? 'Ainda neste ano' : n.mes ? 'Ainda neste mês' : `Próximos ${n.dias} dias`;
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

  /** O mês ainda tem dias pela frente (o atual): mostra o que falta marcado nele. */
  protected mesAtualOuFuturo(mes: string): boolean {
    return mes >= this.meses[0].valor;
  }

  /** Card dos previstos: nos dias, sempre; num mês ou ano, quando ainda falta algo dele (ou há algo marcado). */
  protected mostrarPrevistos(n: NumerosAgenda): boolean {
    if (n.previstos > 0 || this.semanaAtual()) return true;
    if (n.ano) return n.ano >= this.anos[0];
    return !n.mes || this.mesAtualOuFuturo(n.mes);
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
      const ano = this.ano();
      const mes = this.mes();
      this.numeros.set(await this.agendaService.numeros(
        this.semanaAtual() ? { semana: true } : ano ? { ano } : { mes: mes ?? this.meses[0].valor },
      ));
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR));
    } finally {
      this.carregando.set(false);
    }
  }
}
