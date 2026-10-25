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

export interface ConfiguracaoVitrine {
  corMarca: CorMarca;
  fonteGaleria: FonteVitrine;
  corFundoGaleria: CorFundoVitrine;
  areaCorFundoGaleria: AreaCorFundoVitrine;
  estiloCor: EstiloCor;
  capaUrl: string | null;
}
