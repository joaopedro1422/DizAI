import { LayoutPost, PaletaPost, TipoPost } from './tipos-post';

/**
 * O catálogo das composições. Cada uma diz para que tipos de post serve, quantas fotos usa e em que paletas fica
 * bonita (o motor só sorteia combinações que funcionam). O desenho de cada uma está em arte-layouts-*.css.
 */
export interface DefinicaoLayout {
  id: LayoutPost;
  nome: string;
  tipos: TipoPost[];
  fotosMinimo: number;
  fotosMaximo: number;
  paletas: PaletaPost[];
  /** Só com preço (a etiqueta). */
  precisaPreco?: boolean;
  /** Quantas variantes internas o CSS desenha (data-variante 0..n-1). */
  variantes: number;
}

const QUASE_TODOS: TipoPost[] = ['DESTAQUE', 'NOVIDADE', 'PROMOCAO', 'CONVITE'];
/** Os de fundo liso não usam foto: servem para tudo o que não depende dela. */
const SEM_FOTO: TipoPost[] = ['DESTAQUE', 'PROMOCAO', 'CONVITE', 'AGENDA', 'CARDAPIO', 'DEPOIMENTO'];

export const LAYOUTS: DefinicaoLayout[] = [
  { id: 'moldura', nome: 'Moldura', tipos: [...QUASE_TODOS, 'AGENDA', 'DEPOIMENTO'], fotosMinimo: 1, fotosMaximo: 1, paletas: ['foto', 'cor', 'escura'], variantes: 3 },
  { id: 'editorial', nome: 'Editorial', tipos: [...QUASE_TODOS], fotosMinimo: 1, fotosMaximo: 1, paletas: ['clara', 'creme', 'escura', 'cor'], variantes: 2 },
  { id: 'polaroid', nome: 'Polaroid', tipos: ['DESTAQUE', 'NOVIDADE', 'CONVITE'], fotosMinimo: 1, fotosMaximo: 1, paletas: ['clara', 'creme', 'cor', 'escura'], variantes: 2 },
  { id: 'arco', nome: 'Arco', tipos: [...QUASE_TODOS], fotosMinimo: 1, fotosMaximo: 1, paletas: ['clara', 'creme', 'cor', 'escura'], variantes: 2 },
  { id: 'dividido', nome: 'Dividido', tipos: [...QUASE_TODOS, 'AGENDA'], fotosMinimo: 1, fotosMaximo: 1, paletas: ['cor', 'escura', 'creme', 'clara'], variantes: 2 },
  { id: 'circulo', nome: 'Círculo', tipos: ['DESTAQUE', 'NOVIDADE', 'CONVITE'], fotosMinimo: 1, fotosMaximo: 1, paletas: ['cor', 'clara', 'creme', 'escura'], variantes: 2 },
  { id: 'colagem', nome: 'Colagem', tipos: ['NOVIDADE', 'CONVITE', 'DESTAQUE'], fotosMinimo: 3, fotosMaximo: 3, paletas: ['clara', 'creme', 'escura', 'cor'], variantes: 2 },
  { id: 'tipografico', nome: 'Tipográfico', tipos: ['DESTAQUE', 'PROMOCAO', 'CONVITE', 'AGENDA', 'DEPOIMENTO'], fotosMinimo: 0, fotosMaximo: 0, paletas: ['cor', 'escura', 'creme', 'clara'], variantes: 2 },
  { id: 'etiqueta', nome: 'Etiqueta de preço', tipos: ['DESTAQUE', 'PROMOCAO'], fotosMinimo: 1, fotosMaximo: 1, paletas: ['foto', 'clara', 'creme'], precisaPreco: true, variantes: 2 },
  { id: 'cardapio', nome: 'Cardápio', tipos: ['CARDAPIO'], fotosMinimo: 0, fotosMaximo: 1, paletas: ['creme', 'clara', 'escura', 'cor'], variantes: 2 },
  { id: 'citacao', nome: 'Citação', tipos: ['DEPOIMENTO'], fotosMinimo: 0, fotosMaximo: 1, paletas: ['clara', 'creme', 'cor', 'escura'], variantes: 2 },
  { id: 'calendario', nome: 'Calendário', tipos: ['AGENDA'], fotosMinimo: 0, fotosMaximo: 1, paletas: ['clara', 'cor', 'escura', 'creme'], variantes: 2 },
  { id: 'diagonal', nome: 'Faixa diagonal', tipos: ['NOVIDADE', 'PROMOCAO', 'DESTAQUE'], fotosMinimo: 1, fotosMaximo: 1, paletas: ['foto', 'cor'], variantes: 2 },
  { id: 'minimal', nome: 'Minimalista', tipos: ['DESTAQUE', 'NOVIDADE', 'CONVITE'], fotosMinimo: 1, fotosMaximo: 1, paletas: ['clara', 'creme'], variantes: 2 },
  { id: 'cartao', nome: 'Cartão', tipos: [...QUASE_TODOS, 'AGENDA', 'DEPOIMENTO', 'CARDAPIO'], fotosMinimo: 0, fotosMaximo: 1, paletas: ['cor', 'escura', 'creme', 'clara'], variantes: 2 },
  { id: 'janela', nome: 'Janela', tipos: ['DESTAQUE', 'NOVIDADE', 'CONVITE', 'PROMOCAO'], fotosMinimo: 1, fotosMaximo: 1, paletas: ['foto', 'escura'], variantes: 2 },
  { id: 'bloco', nome: 'Bloco de cor', tipos: [...QUASE_TODOS], fotosMinimo: 1, fotosMaximo: 1, paletas: ['clara', 'creme', 'escura'], variantes: 2 },
  { id: 'lateral', nome: 'Faixa lateral', tipos: [...QUASE_TODOS, 'AGENDA'], fotosMinimo: 1, fotosMaximo: 1, paletas: ['clara', 'creme', 'escura', 'cor'], variantes: 2 },
  { id: 'bilhete', nome: 'Bilhete', tipos: ['DESTAQUE', 'PROMOCAO', 'CONVITE'], fotosMinimo: 0, fotosMaximo: 1, paletas: ['cor', 'escura', 'creme'], variantes: 1 },
  { id: 'quadro', nome: 'Quadro de galeria', tipos: ['DESTAQUE', 'NOVIDADE', 'CONVITE'], fotosMinimo: 1, fotosMaximo: 1, paletas: ['escura', 'cor', 'creme'], variantes: 2 },
  { id: 'tira', nome: 'Tira de filme', tipos: ['NOVIDADE', 'CONVITE', 'DESTAQUE'], fotosMinimo: 3, fotosMaximo: 3, paletas: ['clara', 'creme', 'escura', 'cor'], variantes: 2 },
  { id: 'balao', nome: 'Balão', tipos: ['DEPOIMENTO'], fotosMinimo: 0, fotosMaximo: 1, paletas: ['cor', 'escura', 'creme', 'clara'], variantes: 2 },
  { id: 'liso', nome: 'Fundo liso', tipos: SEM_FOTO, fotosMinimo: 0, fotosMaximo: 0, paletas: ['cor', 'creme', 'escura'], variantes: 2 },
  { id: 'liso-cartao', nome: 'Fundo liso com cartão', tipos: SEM_FOTO, fotosMinimo: 0, fotosMaximo: 0, paletas: ['cor', 'escura', 'creme'], variantes: 2 },
];

export function layoutsPara(tipo: TipoPost, fotosDisponiveis: number, temPreco: boolean): DefinicaoLayout[] {
  return LAYOUTS.filter(
    (layout) =>
      layout.tipos.includes(tipo) &&
      fotosDisponiveis >= layout.fotosMinimo &&
      (!layout.precisaPreco || temPreco),
  );
}
