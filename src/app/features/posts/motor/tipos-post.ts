/**
 * Gerador de posts para redes sociais: os tipos de dados da arte. A arte é montada em HTML/CSS (ArtePostComponent) com
 * a identidade da loja (MarcaPost), o conteúdo do post (ConteudoPost) e um estilo sorteado pelo motor (EstiloPost).
 */

/** O que o post divulga (o backend usa os mesmos nomes em TipoPostRedes). */
export type TipoPost = 'DESTAQUE' | 'AGENDA' | 'DEPOIMENTO' | 'NOVIDADE' | 'PROMOCAO' | 'CARDAPIO' | 'CONVITE';

/** Feed 4:5 (o formato que mais aparece no Instagram), quadrado ou story. */
export type FormatoPost = 'feed' | 'quadrado' | 'story';

export const DIMENSOES: Record<FormatoPost, { largura: number; altura: number; rotulo: string }> = {
  feed: { largura: 1080, altura: 1350, rotulo: 'Feed' },
  quadrado: { largura: 1080, altura: 1080, rotulo: 'Quadrado' },
  story: { largura: 1080, altura: 1920, rotulo: 'Story' },
};

/** As composições da arte (o CSS de cada uma fica em arte-layouts-*.css). */
export type LayoutPost =
  | 'moldura'
  | 'editorial'
  | 'polaroid'
  | 'arco'
  | 'dividido'
  | 'circulo'
  | 'colagem'
  | 'tipografico'
  | 'etiqueta'
  | 'cardapio'
  | 'citacao'
  | 'calendario'
  | 'diagonal'
  | 'minimal'
  | 'cartao'
  | 'janela';

/** De onde vêm as cores: fundo claro tingido, a cor da loja, escuro, creme ou a foto dominando. */
export type PaletaPost = 'clara' | 'cor' | 'escura' | 'creme' | 'foto';
export type DecorPost = 'nenhum' | 'linhas' | 'pontos' | 'organico' | 'brilhos' | 'geometrico' | 'faixas';
export type FiltroFoto = 'natural' | 'quente' | 'pb' | 'duotone';
export type RaioPost = 'reto' | 'suave' | 'redondo';
/** A fonte das letras pequenas (selo, apoio, chamada); o título usa sempre a fonte da vitrine da loja. */
export type FonteApoio = 'Manrope' | 'DM Sans' | 'Montserrat' | 'Poppins';

export interface EstiloPost {
  layout: LayoutPost;
  paleta: PaletaPost;
  decor: DecorPost;
  alinhamento: 'esquerda' | 'centro';
  filtro: FiltroFoto;
  raio: RaioPost;
  fonteApoio: FonteApoio;
  /** Selo e apoio em maiúsculas espaçadas (ar de revista) ou normais. */
  caixaAlta: boolean;
  /** Pequenas variações dentro do layout (posição da foto, lado do texto...), de 0 a 3. */
  variante: number;
}

/** A identidade da loja, igual à da vitrine pública. */
export interface MarcaPost {
  nome: string;
  /** Data URL da logo (o Firebase não libera CORS: a imagem passa pelo backend) ou null (vai a inicial). */
  logo: string | null;
  /** A cor de destaque (hex) e o preenchimento no estilo escolhido (metálico, degradê...). */
  cor: string;
  preenchimento: string;
  /** "'Playfair Display', serif": a fonte da vitrine, para o título. */
  fonteTitulo: string;
  fonteManuscrita: boolean;
  /** "dizai.com/l/salvia-nail-studio" */
  link: string;
}

export interface ItemCardapio {
  nome: string;
  preco: string;
}

export interface DiaLivre {
  /** "Amanhã", "Sábado 08/11" */
  dia: string;
  horas: string[];
}

/** Os textos e os dados de um post (os textos vêm da IA, o resto dos cadastros da loja). */
export interface ConteudoPost {
  tipo: TipoPost;
  selo: string;
  titulo: string;
  apoio: string;
  chamada: string;
  /** "R$ 80" ou "a partir de R$ 80"; null sem preço. */
  preco: string | null;
  /** Data URLs das fotos (0 a 4). */
  fotos: string[];
  itens: ItemCardapio[];
  horarios: DiaLivre[];
  depoimento: { texto: string; nome: string; estrelas: number } | null;
}

/** Uma opção pronta na tela: o estilo da arte e os textos (inclusive a legenda para colar). */
export interface OpcaoPost {
  id: string;
  estilo: EstiloPost;
  conteudo: ConteudoPost;
  legenda: string;
}
