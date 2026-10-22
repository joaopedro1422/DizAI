/** Opção que o cliente escolhe, ex.: Formato → amendoado, quadrado. */
export interface AtributoProduto {
  nome: string;
  opcoes: string[];
  /** Quantas opções o cliente escolhe, lida com o modo. 0 = não obrigatória: o assistente só usa como informação. */
  quantidadeEscolha?: number;
  modoEscolha?: ModoEscolha;
}

/** Como ler a quantidade: exatamente 2, até 5, no mínimo 2 ou quantas quiser (aí o número não importa). */
export type ModoEscolha = 'EXATAMENTE' | 'ATE' | 'MINIMO' | 'QUANTAS_QUISER' | 'ADICIONAL';

export const MODOS_ESCOLHA: { valor: ModoEscolha; rotulo: string }[] = [
  { valor: 'EXATAMENTE', rotulo: 'Exatamente' },
  { valor: 'ATE', rotulo: 'Até' },
  { valor: 'MINIMO', rotulo: 'No mínimo' },
  { valor: 'QUANTAS_QUISER', rotulo: 'Quantas quiser' },
  { valor: 'ADICIONAL', rotulo: 'Adicional (Não obrigatorio)' },
];

/** -1 era o "quantas quiser" antigo: abre no formulário como 1 + "Quantas quiser". */
export function escolhaParaFormulario(atributo: AtributoProduto): { quantidade: number; modo: ModoEscolha } {
  const quantidade = atributo.quantidadeEscolha ?? 1;
  return quantidade < 0
    ? { quantidade: 1, modo: 'QUANTAS_QUISER' }
    : { quantidade, modo: atributo.modoEscolha ?? 'EXATAMENTE' };
}

export interface Produto {
  id: number;
  categoria: string;
  nome: string;
  descricao: string | null;
  /** `null` quando o preço é sob consulta. */
  preco: number | null;
  precoAPartirDe: boolean;
  /** Estado retornado pela API; deve ser preservado ao substituir os demais campos. */
  disponivel: boolean;
  atributos: AtributoProduto[];
  fotoUrl?: string | null;
  /** Duração do atendimento em minutos (serviços). Obrigatória nos ramos com agenda. */
  duracaoMinutos?: number | null;
  /** Produtos: antecedência própria em minutos, quando o tempo de preparo difere do da loja (null = o da loja). */
  antecedenciaMinutos?: number | null;
  /** Variações de preço (ex.: Tamanho P / M): o cliente escolhe uma e o valor dela vale no lugar do preço. */
  variacoes?: VariacaoProduto[];
}

/** Uma variação de preço: nome e valor (obrigatório). */
export interface VariacaoProduto {
  nome: string;
  preco: number;
}

export type NovoProduto = Omit<Produto, 'id' | 'disponivel'> & { disponivel?: boolean };

/** O PUT substitui todos os campos; a foto também precisa ser reenviada ou preservada. */
export type ProdutoAtualizacao = Omit<Produto, 'id' | 'fotoUrl'> & { fotoUrl: string | null };
