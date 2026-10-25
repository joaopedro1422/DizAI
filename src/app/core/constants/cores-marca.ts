import { CorMarca } from '../models/perfil.model';

export interface OpcaoCorMarca {
  valor: CorMarca;
  nome: string;
  hex: string;
  /** Fundo claro da página pública que acompanha esta cor (opção do seletor "Cor de fundo"). */
  fundo: string;
  /** Nome do fundo no seletor ("Azul-gelo", "Creme"...). */
  nomeFundo: string;
}

/**
 * Cores que o lojista pode escolher para a página pública.
 * Só tons escuros: todas têm contraste de pelo menos 4,5:1 com texto branco (WCAG AA),
 * então botões e etiquetas continuam legíveis com qualquer escolha.
 * Cada uma tem um fundo claro com nome próprio (tons diferentes entre si, para dar para ver a diferença no seletor).
 */
export const CORES_MARCA: OpcaoCorMarca[] = [
  { valor: 'PRETO', nome: 'Preto', hex: '#151515', fundo: '#f3f3f3ec', nomeFundo: 'Cinza-claro' },
  { valor: 'GRAFITE', nome: 'Grafite', hex: '#3F4652', fundo: '#edf0f4ec', nomeFundo: 'Cinza-azulado' },
  { valor: 'AZUL_MARINHO', nome: 'Azul-marinho', hex: '#1E3A72', fundo: '#eef2fbec', nomeFundo: 'Azul-gelo' },
  { valor: 'AZUL_PETROLEO', nome: 'Azul petróleo', hex: '#0F4C5C', fundo: '#ebf5f6ec', nomeFundo: 'Azul-água' },
  { valor: 'VERDE_ESCURO', nome: 'Verde-escuro', hex: '#1D5A36', fundo: '#edf7f0ec', nomeFundo: 'Verde-menta' },
  { valor: 'VERDE_OLIVA', nome: 'Verde-oliva', hex: '#4A5A23', fundo: '#f3f6e6ec', nomeFundo: 'Verde-pistache' },
  { valor: 'MOSTARDA', nome: 'Mostarda', hex: '#8A6100', fundo: '#fdf7e4ec', nomeFundo: 'Creme' },
  { valor: 'TERRACOTA', nome: 'Terracota', hex: '#A3410F', fundo: '#fcefe7ec', nomeFundo: 'Pêssego' },
  { valor: 'VINHO', nome: 'Vinho', hex: '#8E1B2B', fundo: '#faecedec', nomeFundo: 'Rosa-antigo' },
  { valor: 'ROSA_ESCURO', nome: 'Rosa-escuro', hex: '#A12A63', fundo: '#fcedf4ec', nomeFundo: 'Rosa-bebê' },
  { valor: 'ROXO', nome: 'Roxo', hex: '#5B2A86', fundo: '#f3edfbec', nomeFundo: 'Lilás' },
  { valor: 'MARROM', nome: 'Marrom', hex: '#5C3A21', fundo: '#f6f0e8ec', nomeFundo: 'Areia' },
];

export const COR_MARCA_PADRAO: CorMarca = 'PRETO';

export function buscarCorMarca(cor: CorMarca): OpcaoCorMarca {
  return CORES_MARCA.find((opcao) => opcao.valor === cor) ?? CORES_MARCA[0];
}
