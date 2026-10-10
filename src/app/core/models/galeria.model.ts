export interface Foto {
  id: number;
  /** Referência da imagem no Storage (ex.: "lojas/studio-bella/galeria/unhas-em-gel/{uuid}.jpg"). Exiba com o pipe urlImagem. */
  url: string;
  legenda?: string | null;
}

/**
 * Tópico da galeria. Toda foto pertence obrigatoriamente a um álbum.
 * No painel, `fotos` traz só a prévia (as primeiras); o total fica em `quantidadeFotos`.
 */
export interface Album {
  id: number;
  nome: string;
  slug: string;
  descricao: string;
  quantidadeFotos: number;
  fotos: Foto[];
}

export interface NovoAlbum {
  nome: string;
  descricao: string;
}
