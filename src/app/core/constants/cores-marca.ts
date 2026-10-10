import { CorMarca } from '../models/perfil.model';

export interface OpcaoCorMarca {
  valor: CorMarca;
  nome: string;
  hex: string;
}

/**
 * Cores que o lojista pode escolher para a página pública.
 * Só tons escuros: todas têm contraste de pelo menos 4,5:1 com texto branco (WCAG AA),
 * então botões e etiquetas continuam legíveis com qualquer escolha.
 */
export const CORES_MARCA: OpcaoCorMarca[] = [
  { valor: 'PRETO', nome: 'Preto', hex: '#151515' },
  { valor: 'GRAFITE', nome: 'Grafite', hex: '#3F4652' },
  { valor: 'AZUL_MARINHO', nome: 'Azul-marinho', hex: '#1E3A72' },
  { valor: 'AZUL_PETROLEO', nome: 'Azul petróleo', hex: '#0F4C5C' },
  { valor: 'VERDE_ESCURO', nome: 'Verde-escuro', hex: '#1D5A36' },
  { valor: 'VERDE_OLIVA', nome: 'Verde-oliva', hex: '#4A5A23' },
  { valor: 'MOSTARDA', nome: 'Mostarda', hex: '#8A6100' },
  { valor: 'TERRACOTA', nome: 'Terracota', hex: '#A3410F' },
  { valor: 'VINHO', nome: 'Vinho', hex: '#8E1B2B' },
  { valor: 'ROSA_ESCURO', nome: 'Rosa-escuro', hex: '#A12A63' },
  { valor: 'ROXO', nome: 'Roxo', hex: '#5B2A86' },
  { valor: 'MARROM', nome: 'Marrom', hex: '#5C3A21' },
];

export const COR_MARCA_PADRAO: CorMarca = 'PRETO';

export function buscarCorMarca(cor: CorMarca): OpcaoCorMarca {
  return CORES_MARCA.find((opcao) => opcao.valor === cor) ?? CORES_MARCA[0];
}
