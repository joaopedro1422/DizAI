/** Opção que o cliente escolhe, ex.: Formato → amendoado, quadrado. */
export interface AtributoProduto {
  nome: string;
  opcoes: string[];
}

export interface Produto {
  id: number;
  categoria: string;
  nome: string;
  descricao: string;
  /** `null` quando o preço é sob consulta. */
  preco: number | null;
  precoAPartirDe: boolean;
  atributos: AtributoProduto[];
  fotoUrl?: string;
}

export type NovoProduto = Omit<Produto, 'id'>;
