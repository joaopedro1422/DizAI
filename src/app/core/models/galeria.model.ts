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
  /** Só no "Sobre" (SOBRE): título, texto, foto e o estilo do layout. */
  sobre: Sobre | null;
}

/** Layout do tópico "Sobre": foto em cima (CLASSICO), foto em arco com o selo (JANELA) ou foto cheia com cartão (CAPA). */
export type EstiloSobre = 'CLASSICO' | 'JANELA' | 'CAPA' | 'DELICADO';

/** O conteúdo do "Sobre". Extras por estilo: assinatura (CLASSICO), desde (JANELA) e até 2 destaques (CAPA). */
export interface Sobre {
  estilo: EstiloSobre;
  titulo: string;
  texto: string;
  /** Referência da foto principal (lojas/{slug}/sobre/...); null = sem foto. */
  foto: string | null;
  assinatura: string | null;
  desde: number | null;
  destaques: string[];
}

/** FOTOS (o de sempre), FEEDBACKS (depoimentos em slides), LOCALIZACAO ("Como chegar", com o mapa) ou SOBRE. */
export type TipoTopico = 'FOTOS' | 'FEEDBACKS' | 'LOCALIZACAO' | 'SOBRE';

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
  sobre?: Sobre | null;
}
