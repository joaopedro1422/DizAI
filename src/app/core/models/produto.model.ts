/** Opção que o cliente escolhe, ex.: Formato → amendoado, quadrado. */
export interface AtributoProduto {
  nome: string;
  opcoes: string[];
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
}

export type NovoProduto = Omit<Produto, 'id' | 'disponivel'> & { disponivel?: boolean };

/** O PUT substitui todos os campos; a foto também precisa ser reenviada ou preservada. */
export type ProdutoAtualizacao = Omit<Produto, 'id' | 'fotoUrl'> & { fotoUrl: string | null };
