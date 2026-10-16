import { CorMarca } from './perfil.model';
import { AreaCorFundoVitrine, CorFundoVitrine, FonteVitrine } from './vitrine.model';

/** Tópico na página pública: `fotos` traz as primeiras; "Ver todas" busca o resto. */
export interface AlbumPublico {
  nome: string;
  slug: string;
  descricao: string | null;
  quantidadeFotos: number;
  fotos: string[];
}

/** Página pública da loja (/l/:slug), aberta pelo cliente sem login. */
export interface LojaPublica {
  nomeLoja: string;
  slug: string;
  descricao: string | null;
  /** Referência no Storage; exiba com o pipe urlImagem. */
  fotoPerfilUrl: string | null;
  corMarca: CorMarca;
  fonteGaleria?: FonteVitrine;
  corFundoGaleria?: CorFundoVitrine;
  areaCorFundoGaleria?: AreaCorFundoVitrine;
  /** Referência da imagem de capa no Storage. */
  capaUrl?: string | null;
  /** Número normalizado (só dígitos, com 55). */
  numeroWhatsapp: string;
  albuns: AlbumPublico[];
  /** Mostra a aba "Agenda" (só serviços presenciais com a agenda ligada). */
  agendaAtiva?: boolean;
}

export interface FotoPublica {
  url: string;
  legenda: string | null;
}

export interface AlbumPublicoDetalhe {
  nome: string;
  slug: string;
  descricao: string | null;
  fotos: FotoPublica[];
}
