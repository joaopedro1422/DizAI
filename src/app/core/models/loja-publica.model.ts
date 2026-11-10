import { CorMarca } from './perfil.model';
import { AreaCorFundoVitrine, CorFundoVitrine, EstiloAbas, EstiloCor, EstiloMenu, FonteVitrine, LayoutFotos } from './vitrine.model';

/** Tópico na página pública: `fotos` traz as primeiras; "Ver todas" busca o resto. */
export interface AlbumPublico {
  nome: string;
  slug: string;
  descricao: string | null;
  quantidadeFotos: number;
  fotos: string[];
  /** Os ids das fotos de `fotos`, na mesma ordem (para o link de cada foto). */
  idsFotos?: number[];
  /** FEEDBACKS: tópico de depoimentos (slides), sem fotos. Sem o campo (backend antigo) = fotos. */
  tipo?: 'FOTOS' | 'FEEDBACKS' | 'LOCALIZACAO';
  feedbacks?: FeedbackPublico[];
  /** LOCALIZACAO ("Como chegar"): o endereço do mapa. */
  endereco?: string | null;
}

/** Depoimento de cliente na vitrine. data: "AAAA-MM-DD" ou null. */
export interface FeedbackPublico {
  id: number;
  texto: string;
  nome: string;
  data: string | null;
  estrelas: number;
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
  /** Estilo da cor de destaque (null = normal). */
  estiloCor?: EstiloCor | null;
  /** Menu de categorias da vitrine (null = arredondado). */
  estiloMenu?: EstiloMenu | null;
  estiloAbas?: EstiloAbas | null;
  layoutFotos?: LayoutFotos | null;
  capaUrl?: string | null;
  /** Número normalizado (só dígitos, com 55). */
  numeroWhatsapp: string;
  albuns: AlbumPublico[];
  /** Mostra a aba "Agenda" (só serviços presenciais com a agenda ligada). */
  agendaAtiva?: boolean;
  /** Mostra a aba "Orçamento" (lojas de produtos com produtos cadastrados). */
  orcamentoAtivo?: boolean;
  /** Horário, pagamento e entrega (selo "Aberto agora" e seção Informações). Sem o campo = backend antigo. */
  informacoes?: InformacoesLoja;
}

export type DiaSemana = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

/** Um período de um dia: inicio e fim em "08:00". */
export interface HorarioLoja {
  diaSemana: DiaSemana;
  inicio: string;
  fim: string;
}

/** O que o lojista cadastrou em Dados da loja (listas vazias = não aparece). horarioLivre = "Sempre". */
export interface InformacoesLoja {
  horarioLivre: boolean;
  horarios: HorarioLoja[];
  formasPagamento: string[];
  formasRecebimento: string[];
  taxaEntrega: string | null;
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
