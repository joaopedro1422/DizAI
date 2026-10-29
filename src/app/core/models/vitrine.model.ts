import type { CorMarca } from './perfil.model';

export const FONTES_VITRINE = [
  'Playfair Display',
  'Cormorant Garamond',
  'Lora',
  'Montserrat',
  'Poppins',
  'DM Sans',
  'Dancing Script',
  'Pacifico',
  'Caveat',
  'Oswald',
  'Bebas Neue',
  'Roboto Condensed',
  'Cinzel',
  'Bodoni Moda',
  'DM Serif Display',
  'Italiana',
  'Marcellus',
  'Great Vibes',
  'Allura',
  'Parisienne',
  'Pinyon Script',
  'Alex Brush',
  'Sacramento',
  'Satisfy',
] as const;

export type FonteVitrine = (typeof FONTES_VITRINE)[number];

/** As fontes em grupos, na ordem do seletor de "Personalizar vitrine". */
export const GRUPOS_FONTES: { rotulo: string; familia: 'serif' | 'cursive' | 'sans-serif'; fontes: FonteVitrine[] }[] = [
  {
    rotulo: 'Elegantes',
    familia: 'serif',
    fontes: ['Playfair Display', 'Cormorant Garamond', 'Lora', 'Cinzel', 'Bodoni Moda', 'DM Serif Display', 'Italiana', 'Marcellus'],
  },
  {
    rotulo: 'Manuscritas',
    familia: 'cursive',
    fontes: ['Great Vibes', 'Allura', 'Parisienne', 'Pinyon Script', 'Alex Brush', 'Sacramento', 'Dancing Script', 'Satisfy', 'Pacifico', 'Caveat'],
  },
  { rotulo: 'Modernas', familia: 'sans-serif', fontes: ['Montserrat', 'Poppins', 'DM Sans'] },
  { rotulo: 'Impactantes', familia: 'sans-serif', fontes: ['Oswald', 'Bebas Neue', 'Roboto Condensed'] },
];

export function ehFonteManuscrita(fonte: string): boolean {
  return GRUPOS_FONTES[1].fontes.includes(fonte as FonteVitrine);
}

/** "'Great Vibes', cursive": a fonte com a família de reserva certa. */
export function fonteComFamilia(fonte: string): string {
  const grupo = GRUPOS_FONTES.find((g) => g.fontes.includes(fonte as FonteVitrine));
  return `'${fonte}', ${grupo?.familia ?? 'sans-serif'}`;
}
/** ESCURO = tema escuro (página preta, textos e detalhes brancos). */
export type CorFundoVitrine = CorMarca | 'BRANCO' | 'SEM_COR' | 'ESCURO';
export type AreaCorFundoVitrine = 'PAGINA' | 'CABECALHO';
/** Como a cor de destaque pinta a vitrine (null no perfil = NORMAL). */
export type EstiloCor = 'NORMAL' | 'METALICO' | 'DEGRADE' | 'VIDRO';
/** Menu de categorias da vitrine (null no perfil = ARREDONDADO). */
export type EstiloMenu = 'ARREDONDADO' | 'MINIMALISTA';
/** Como as fotos de cada tópico aparecem na vitrine (null no perfil = GRADE). */
export type LayoutFotos = 'GRADE' | 'MOSAICO' | 'DESTAQUE' | 'CARROSSEL';

export interface ConfiguracaoVitrine {
  corMarca: CorMarca;
  fonteGaleria: FonteVitrine;
  corFundoGaleria: CorFundoVitrine;
  areaCorFundoGaleria: AreaCorFundoVitrine;
  estiloCor: EstiloCor;
  estiloMenu: EstiloMenu;
  layoutFotos: LayoutFotos;
  capaUrl: string | null;
}
