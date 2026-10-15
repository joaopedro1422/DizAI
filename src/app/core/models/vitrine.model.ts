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

export interface ConfiguracaoVitrine {
  corMarca: CorMarca;
  fonteGaleria: FonteVitrine;
  corFundoGaleria: CorFundoVitrine;
  areaCorFundoGaleria: AreaCorFundoVitrine;
  capaUrl: string | null;
}
