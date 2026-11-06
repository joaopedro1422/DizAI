import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';

import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { AtributoProduto, ModoEscolha, Produto, VariacaoProduto, escolhaParaFormulario } from '../../../core/models/produto.model';
import { LojaPublicaService } from '../../../core/services/loja-publica.service';
import { formatarDuracao } from '../../../core/utils/datas-agenda';
import { gerarLinkWhatsapp } from '../../../core/utils/texto.utils';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { PrecoProdutoPipe } from '../../../shared/pipes/preco-produto.pipe';

const REAL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const QUANTIDADE_MAXIMA = 9999;

/** Uma opção que o cliente escolhe (ex.: Sabores), já com a regra de quantas. */
interface EscolhaProduto {
  nome: string;
  opcoes: string[];
  quantidade: number;
  modo: ModoEscolha;
}

/** O produto que está sendo montado agora (o painel aberto embaixo do card). */
interface Rascunho {
  produtoId: number;
  quantidade: number;
  variacao: VariacaoProduto | null;
  /** Opções marcadas em cada escolha, pelo nome da escolha. */
  marcadas: Record<string, string[]>;
  /** Quantas de cada opção (opcional), pelo nome da escolha e da opção. */
  divisao: Record<string, Record<string, number>>;
}

interface ItemPedido {
  chave: number;
  nome: string;
  quantidade: number;
  /** "Tamanho M; Sabores: 50 coxinha, 50 kibe" */
  detalhes: string;
  /** null = valor a confirmar (sob consulta). */
  total: number | null;
  aPartirDe: boolean;
}

@Component({
  selector: 'app-orcamento-publico',
  imports: [IconeComponent, CarregandoComponent, UrlImagemPipe, PrecoProdutoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './orcamento-publico.component.html',
  styleUrl: './orcamento-publico.component.css',
})
export class OrcamentoPublicoComponent implements OnInit {
  readonly slug = input.required<string>();
  readonly numeroWhatsapp = input.required<string>();

  private readonly lojaPublicaService = inject(LojaPublicaService);

  protected readonly situacao = signal<'carregando' | 'pronta' | 'erro'>('carregando');
  private readonly produtos = signal<Produto[]>([]);
  protected readonly rascunho = signal<Rascunho | null>(null);
  protected readonly itens = signal<ItemPedido[]>([]);
  protected readonly erroRascunho = signal('');
  private proximaChave = 1;

  protected readonly categorias = computed(() => {
    const porCategoria = new Map<string, Produto[]>();
    for (const produto of this.produtos()) {
      porCategoria.set(produto.categoria, [...(porCategoria.get(produto.categoria) ?? []), produto]);
    }
    return [...porCategoria].map(([nome, produtos]) => ({ nome, produtos }));
  });

  protected readonly produtoAberto = computed(() => {
    const rascunho = this.rascunho();
    return rascunho ? (this.produtos().find((p) => p.id === rascunho.produtoId) ?? null) : null;
  });

  /** Valor do produto aberto com a variação e a quantidade escolhidas (null = a confirmar). */
  protected readonly subtotal = computed(() => {
    const produto = this.produtoAberto();
    const rascunho = this.rascunho();
    if (!produto || !rascunho) {
      return null;
    }
    const unitario = this.precoUnitario(produto, rascunho);
    return unitario === null ? null : unitario * rascunho.quantidade;
  });

  protected readonly total = computed(() => this.itens().reduce((soma, item) => soma + (item.total ?? 0), 0));
  protected readonly temValorAConfirmar = computed(() => this.itens().some((item) => item.total === null || item.aPartirDe));
  protected readonly quantidadeItens = computed(() => this.itens().length);

  protected readonly linkEnviar = computed(() => {
    const itens = this.itens();
    if (itens.length === 0) {
      return null;
    }
    const linhas = [
      'Olá! Gostaria de fazer este pedido:',
      ...itens.map(
        (item) =>
          `- ${item.quantidade} ${item.nome}${item.detalhes ? ` (${item.detalhes})` : ''}` +
          (item.total === null ? ' (valor a confirmar)' : `: ${REAL.format(item.total)}`),
      ),
      `Total: ${this.textoTotal()}`,
    ];
    return `${gerarLinkWhatsapp(this.numeroWhatsapp())}?text=${encodeURIComponent(linhas.join('\n'))}`;
  });

  ngOnInit(): void {
    void this.carregar();
  }

  protected recarregar(): void {
    this.situacao.set('carregando');
    void this.carregar();
  }

  private async carregar(): Promise<void> {
    try {
      this.produtos.set(await this.lojaPublicaService.buscarOrcamento(this.slug()));
      this.situacao.set('pronta');
    } catch {
      this.situacao.set('erro');
    }
  }

  // ------------------------------------------------------------------ montar um item

  protected escolhasDe(produto: Produto): EscolhaProduto[] {
    return produto.atributos
      .map((atributo: AtributoProduto) => ({ nome: atributo.nome, opcoes: atributo.opcoes, ...escolhaParaFormulario(atributo) }))
      .filter((escolha) => escolha.opcoes.length > 0 && escolha.quantidade !== 0);
  }

  protected abrir(produto: Produto): void {
    this.erroRascunho.set('');
    const variacoes = produto.variacoes ?? [];
    this.rascunho.set({
      produtoId: produto.id,
      quantidade: 1,
      variacao: variacoes.length === 1 ? variacoes[0] : null,
      marcadas: {},
      divisao: {},
    });
  }

  protected cancelar(): void {
    this.rascunho.set(null);
  }

  protected escolherVariacao(variacao: VariacaoProduto): void {
    this.atualizar((r) => ({ ...r, variacao }));
  }

  protected mudarQuantidade(delta: number): void {
    this.atualizar((r) => ({ ...r, quantidade: limitar(r.quantidade + delta) }));
  }

  protected digitarQuantidade(evento: Event): void {
    const valor = Number((evento.target as HTMLInputElement).value);
    this.atualizar((r) => ({ ...r, quantidade: limitar(Number.isFinite(valor) ? Math.round(valor) : 1) }));
  }

  /** Marca ou desmarca respeitando a regra: "escolher 1" troca a marcada; com limite, não passa dele. */
  protected alternarOpcao(escolha: EscolhaProduto, opcao: string): void {
    this.atualizar((r) => {
      const atuais = r.marcadas[escolha.nome] ?? [];
      let novas: string[];
      if (atuais.includes(opcao)) {
        novas = atuais.filter((o) => o !== opcao);
      } else if (escolha.quantidade === 1 && (escolha.modo === 'EXATAMENTE' || escolha.modo === 'ATE')) {
        novas = [opcao];
      } else if ((escolha.modo === 'EXATAMENTE' || escolha.modo === 'ATE') && atuais.length >= escolha.quantidade) {
        return r;
      } else {
        novas = [...atuais, opcao];
      }
      const divisao = { ...(r.divisao[escolha.nome] ?? {}) };
      Object.keys(divisao).filter((o) => !novas.includes(o)).forEach((o) => delete divisao[o]);
      return { ...r, marcadas: { ...r.marcadas, [escolha.nome]: novas }, divisao: { ...r.divisao, [escolha.nome]: divisao } };
    });
    this.erroRascunho.set('');
  }

  protected marcadas(escolha: EscolhaProduto): string[] {
    return this.rascunho()?.marcadas[escolha.nome] ?? [];
  }

  /** Dividir só faz sentido com mais de uma opção marcada. */
  protected podeDividir(escolha: EscolhaProduto): boolean {
    const rascunho = this.rascunho();
    return !!rascunho && this.marcadas(escolha).length > 1 && this.quantidadeTotalDaEscolha(escolha, rascunho) > 1;
  }

  protected quantidadeDaOpcao(escolha: EscolhaProduto, opcao: string): number | '' {
    return this.rascunho()?.divisao[escolha.nome]?.[opcao] ?? '';
  }

  protected dividir(escolha: EscolhaProduto, opcao: string, evento: Event): void {
    const valor = Math.max(0, Math.round(Number((evento.target as HTMLInputElement).value) || 0));
    this.atualizar((r) => ({
      ...r,
      divisao: { ...r.divisao, [escolha.nome]: { ...(r.divisao[escolha.nome] ?? {}), [opcao]: valor } },
    }));
  }

  /** "Faltam 20: vão sortidos" / "Passou 10 da quantidade" / "" (dividido certinho ou nada dividido). */
  protected situacaoDivisao(escolha: EscolhaProduto): { texto: string; erro: boolean } {
    const rascunho = this.rascunho();
    const divididos = Object.values(rascunho?.divisao[escolha.nome] ?? {}).reduce((soma, n) => soma + n, 0);
    const resto = rascunho ? this.quantidadeTotalDaEscolha(escolha, rascunho) - divididos : 0;
    if (divididos === 0) {
      return { texto: 'Opcional: deixe em branco para vir sortido.', erro: false };
    }
    if (resto < 0) {
      return { texto: `Passou ${-resto} da quantidade.`, erro: true };
    }
    return resto === 0 ? { texto: 'Tudo dividido.', erro: false } : { texto: `Faltam ${resto}: vão sortidos.`, erro: false };
  }

  protected regra(escolha: EscolhaProduto): string {
    const n = escolha.quantidade;
    switch (escolha.modo) {
      case 'QUANTAS_QUISER':
        return 'escolha quantas quiser';
      case 'ATE':
        return n === 1 ? 'escolha 1' : `escolha até ${n}`;
      case 'MINIMO':
        return n === 1 ? 'escolha pelo menos 1' : `escolha no mínimo ${n}`;
      default:
        return n === 1 ? 'escolha 1' : `escolha ${n}`;
    }
  }

  protected adicionar(): void {
    const produto = this.produtoAberto();
    const rascunho = this.rascunho();
    if (!produto || !rascunho) {
      return;
    }
    const erro = this.validar(produto, rascunho);
    if (erro) {
      this.erroRascunho.set(erro);
      return;
    }
    const unitario = this.precoUnitario(produto, rascunho);
    this.itens.update((itens) => [
      ...itens,
      {
        chave: this.proximaChave++,
        nome: produto.nome,
        quantidade: rascunho.quantidade,
        detalhes: this.detalhes(produto, rascunho),
        total: unitario === null ? null : unitario * rascunho.quantidade,
        aPartirDe: !rascunho.variacao && produto.precoAPartirDe,
      },
    ]);
    this.rascunho.set(null);
  }

  protected remover(item: ItemPedido): void {
    this.itens.update((itens) => itens.filter((i) => i.chave !== item.chave));
  }

  // ------------------------------------------------------------------ textos

  protected real(valor: number): string {
    return REAL.format(valor);
  }

  protected textoTotal(): string {
    const total = REAL.format(this.total());
    return this.temValorAConfirmar() ? `${total} + itens a confirmar` : total;
  }

  protected antecedencia(produto: Produto): string | null {
    const minutos = produto.antecedenciaMinutos;
    return minutos ? `Pedido com ${formatarDuracao(minutos)} de antecedência` : null;
  }

  private validar(produto: Produto, rascunho: Rascunho): string {
    if ((produto.variacoes ?? []).length > 0 && !rascunho.variacao) {
      return 'Escolha uma das opções de preço.';
    }
    for (const escolha of this.escolhasDe(produto)) {
      const marcadas = rascunho.marcadas[escolha.nome] ?? [];
      const n = escolha.quantidade;
      const falta =
        (escolha.modo === 'EXATAMENTE' && marcadas.length !== n) ||
        (escolha.modo === 'MINIMO' && marcadas.length < n) ||
        marcadas.length === 0;
      if (falta) {
        return `${escolha.nome}: ${this.regra(escolha)}.`;
      }
      const divididos = Object.values(rascunho.divisao[escolha.nome] ?? {}).reduce((soma, q) => soma + q, 0);
      if (divididos > this.quantidadeTotalDaEscolha(escolha, rascunho)) {
        return `${escolha.nome}: a divisão passou da quantidade de opções selecionadas.`;
      }
    }
    return '';
  }

  /** "Tamanho M; Sabores: 50 coxinha, 50 kibe (o resto sortido)" */
  private detalhes(produto: Produto, rascunho: Rascunho): string {
    const partes = rascunho.variacao ? [rascunho.variacao.nome] : [];
    for (const escolha of this.escolhasDe(produto)) {
      const marcadas = rascunho.marcadas[escolha.nome] ?? [];
      const divisao = rascunho.divisao[escolha.nome] ?? {};
      const divididos = Object.values(divisao).reduce((soma, q) => soma + q, 0);
      const quantidadeEscolhida = this.quantidadeTotalDaEscolha(escolha, rascunho);
      const opcoes = marcadas.map((opcao) => (divisao[opcao] ? `${divisao[opcao]} ${opcao}` : opcao)).join(', ');
      const sobra = divididos > 0 && divididos < quantidadeEscolhida && marcadas.length > 1 ? ', o resto sortido' : '';
      partes.push(`${escolha.nome}: ${opcoes}${sobra}`);
    }
    return partes.join('; ');
  }

  private precoUnitario(produto: Produto, rascunho: Rascunho): number | null {
    return rascunho.variacao?.preco ?? produto.preco;
  }

  private quantidadeTotalDaEscolha(escolha: EscolhaProduto, rascunho: Rascunho): number {
    return rascunho.quantidade * (rascunho.marcadas[escolha.nome]?.length ?? 0);
  }

  private atualizar(mudar: (rascunho: Rascunho) => Rascunho): void {
    this.rascunho.update((r) => (r ? mudar(r) : r));
  }
}

function limitar(quantidade: number): number {
  return Math.min(QUANTIDADE_MAXIMA, Math.max(1, quantidade));
}
