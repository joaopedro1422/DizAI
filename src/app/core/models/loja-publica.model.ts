import { CorMarca } from './perfil.model';
import { AreaCorFundoVitrine, CorFundoVitrine, FonteVitrine } from './vitrine.model';

/** Tópico na página pública: `fotos` traz as primeiras; "Ver todas" busca o resto. */
export interface AlbumPublico {
  nome: string;
  slug: string;
  descricao: string | null;
  quantidadeFotos: number;
  fotos: string[];
  /** Os ids das fotos de `fotos`, na mesma ordem (para o link de cada foto). */
  idsFotos?: number[];
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
  /** Mostra a aba "Orçamento" (lojas de produtos com produtos cadastrados). */
  orcamentoAtivo?: boolean;
}

export interface FotoPublica {
  id: number;
  url: string;
  legenda: string | null;
}

/** Uma foto aberta pelo link /l/{slug}/foto/{id} (o que o cliente manda para a loja pelo WhatsApp). */
export interface FotoCompartilhada {
  id: number;
  url: string;
  legenda: string | null;
  nomeAlbum: string;
  nomeLoja: string;
}

export interface AlbumPublicoDetalhe {
  nome: string;
  slug: string;
  descricao: string | null;
  fotos: FotoPublica[];
}
