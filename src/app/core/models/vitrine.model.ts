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
] as const;

export type FonteVitrine = (typeof FONTES_VITRINE)[number];
export type CorFundoVitrine = CorMarca | 'BRANCO' | 'SEM_COR';
export type AreaCorFundoVitrine = 'PAGINA' | 'CABECALHO';
/** Como a cor de destaque pinta a vitrine (null no perfil = NORMAL). */
export type EstiloCor = 'NORMAL' | 'METALICO' | 'DEGRADE' | 'VIDRO';
/** Menu de categorias da vitrine (null no perfil = ARREDONDADO). */
export type EstiloMenu = 'ARREDONDADO' | 'MINIMALISTA';

export interface ConfiguracaoVitrine {
  corMarca: CorMarca;
  fonteGaleria: FonteVitrine;
  corFundoGaleria: CorFundoVitrine;
  areaCorFundoGaleria: AreaCorFundoVitrine;
  estiloCor: EstiloCor;
  estiloMenu: EstiloMenu;
  capaUrl: string | null;
}
