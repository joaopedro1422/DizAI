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
  /** FOTOS (o de sempre) ou FEEDBACKS (depoimentos de clientes, em slides na vitrine). */
  tipo: TipoTopico;
  /** Só nos tópicos de feedbacks, o mais novo primeiro. */
  feedbacks: Feedback[];
  /** Só no "Como chegar" (LOCALIZACAO): o endereço que vai no mapa. */
  endereco: string | null;
}

/** FOTOS (o de sempre), FEEDBACKS (depoimentos em slides) ou LOCALIZACAO ("Como chegar", com o mapa). */
export type TipoTopico = 'FOTOS' | 'FEEDBACKS' | 'LOCALIZACAO';

/** Depoimento de cliente num tópico de feedbacks. data: "AAAA-MM-DD" ou null. */
export interface Feedback {
  id: number;
  texto: string;
  nome: string;
  data: string | null;
  estrelas: number;
}

export type NovoFeedback = Omit<Feedback, 'id'>;

export interface NovoAlbum {
  nome: string;
  descricao: string;
  tipo?: TipoTopico;
  endereco?: string | null;
}
