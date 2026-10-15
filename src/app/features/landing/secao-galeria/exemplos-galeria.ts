import type { AreaCorFundoVitrine, FonteVitrine } from '../../../core/models/vitrine.model';

/**
 * Foto da galeria de exemplo. O degradê nos tons do trabalho aparece enquanto a imagem carrega
 * (ou sozinho, nos temas que ainda não têm fotos reais).
 */
export interface FotoExemplo {
  claro: string;
  escuro: string;
  /** Imagem em public/landing/galeria/<tema>/, quadrada e em WebP. */
  url?: string;
}

/** Liga cada degradê à foto de mesma posição: 01.webp, 02.webp... */
function comFotosDaPasta(pasta: string, tons: FotoExemplo[]): FotoExemplo[] {
  return tons.map((tom, indice) => ({
    ...tom,
    url: `/landing/galeria/${pasta}/${String(indice + 1).padStart(2, '0')}.webp`,
  }));
}

/** Uma loja de exemplo: a conversa que leva ao link e a página pública que abre. */
export interface ExemploGaleria {
  id: string;
  nomeLoja: string;
  descricao: string;
  /** Uma das cores de marca que o lojista pode escolher (CORES_MARCA). */
  corMarca: string;
  /** Cor coordenada à marca; quando omitida, a miniatura deriva um tom claro da cor de destaque. */
  corFundoGaleria?: string;
  areaCorFundoGaleria: AreaCorFundoVitrine;
  fonteGaleria: FonteVitrine;
  /** Caminho opcional do logo em public/, para trocar a inicial por uma imagem real. */
  logoUrl?: string;
  link: string;
  pergunta: string;
  resposta: string;
  /** A primeira é a categoria aberta pelo link. */
  categorias: string[];
  nomeAlbum: string;
  quantidadeFotos: number;
  fotos: FotoExemplo[];
}

export const EXEMPLOS_GALERIA: ExemploGaleria[] = [
  {
    id: 'unhas',
    nomeLoja: 'Bella Studio',
    descricao: 'Unhas em gel e nail art',
    corMarca: '#7a2e46',
    areaCorFundoGaleria: 'CABECALHO',
    fonteGaleria: 'Cormorant Garamond',
    link: 'dizai.com/bella-studio',
    pergunta: 'Tem fotos de unhas em gel que você já fez? 💅',
    resposta: 'Tenho sim! Olha alguns trabalhos:',
    categorias: ['Unhas em gel', 'Francesinha', 'Nail art', 'Pés'],
    nomeAlbum: 'Unhas em gel',
    quantidadeFotos: 12,
    fotos: comFotosDaPasta('unhas', [
      { claro: '#f3dcd6', escuro: '#c98f84' },
      { claro: '#f6e7e1', escuro: '#d8a9a0' },
      { claro: '#e9d3cf', escuro: '#a96a63' },
      { claro: '#f4e3dc', escuro: '#cf9a7f' },
      { claro: '#efd6db', escuro: '#b9707f' },
      { claro: '#f7ebe5', escuro: '#ddb7a6' },
      { claro: '#ecd9d2', escuro: '#b58273' },
      { claro: '#f5e1e4', escuro: '#d394a1' },
      { claro: '#efe0d6', escuro: '#c4987c' },
    ]),
  },
  {
    id: 'bolos',
    nomeLoja: 'Doce Encanto',
    descricao: 'Bolos e doces para festas',
    corMarca: '#A12A63',
    areaCorFundoGaleria: 'PAGINA',
    fonteGaleria: 'Playfair Display',
    link: 'dizai.com/doce-encanto',
    pergunta: 'Tem fotos de bolos infantis que você já fez? 🎂',
    resposta: 'Tenho sim! Olha só:',
    categorias: ['Bolos infantis', 'Casamento', 'Tortas', 'Docinhos'],
    nomeAlbum: 'Bolos infantis',
    quantidadeFotos: 18,
    fotos: comFotosDaPasta('bolos', [
      { claro: '#fbe3ec', escuro: '#e58fb0' },
      { claro: '#fff1d9', escuro: '#e9b872' },
      { claro: '#eaf2fb', escuro: '#9cc1e6' },
      { claro: '#f3e6da', escuro: '#8a5a3c' },
      { claro: '#fde8f0', escuro: '#f0a6c2' },
      { claro: '#fff4e3', escuro: '#e8c48f' },
      { claro: '#f7e1e8', escuro: '#b8577c' },
      { claro: '#eef6ea', escuro: '#a9cf98' },
      { claro: '#efe3d8', escuro: '#7a4b30' },
    ]),
  },
  {
    id: 'moveis',
    nomeLoja: 'Arte em Madeira',
    descricao: 'Móveis planejados sob medida',
    corMarca: '#5C3A21',
    areaCorFundoGaleria: 'CABECALHO',
    fonteGaleria: 'Lora',
    link: 'dizai.com/arte-em-madeira',
    pergunta: 'Tem fotos de cozinhas planejadas que vocês já fizeram?',
    resposta: 'Temos sim! Veja algumas das nossas cozinhas:',
    categorias: ['Cozinhas planejadas', 'Quartos', 'Closets', 'Banheiros'],
    nomeAlbum: 'Cozinhas planejadas',
    quantidadeFotos: 14,
    fotos: comFotosDaPasta('moveis', [
      { claro: '#efe4d6', escuro: '#b08860' },
      { claro: '#f4efe8', escuro: '#cdbba4' },
      { claro: '#e6d5c0', escuro: '#8c6542' },
      { claro: '#f1ece5', escuro: '#a8a39b' },
      { claro: '#e9dccb', escuro: '#9d7550' },
      { claro: '#f6f2ec', escuro: '#d8cfc2' },
      { claro: '#e2cdb4', escuro: '#7b5634' },
      { claro: '#eee9e2', escuro: '#8f8b84' },
      { claro: '#ecdfcd', escuro: '#b9936b' },
    ]),
  },
  {
    id: 'eletricista',
    nomeLoja: 'Zé Eletricista',
    descricao: 'Iluminação personalizada e instalações',
    corMarca: '#8A6100',
    areaCorFundoGaleria: 'PAGINA',
    fonteGaleria: 'Montserrat',
    link: 'dizai.com/ze-eletricista',
    pergunta: 'Tem fotos de projetos de iluminação personalizada que você já fez? 💡',
    resposta: 'Tenho sim! Olha alguns projetos:',
    categorias: ['Iluminação personalizada', 'Fitas de LED', 'Quadros de energia', 'Tomadas'],
    nomeAlbum: 'Iluminação personalizada',
    quantidadeFotos: 16,
    fotos: comFotosDaPasta('eletricista', [
      { claro: '#e9ecef', escuro: '#8b939c' },
      { claro: '#fff6d6', escuro: '#e8c25a' },
      { claro: '#eef0f2', escuro: '#a3abb4' },
      { claro: '#fdf3d2', escuro: '#d9a93a' },
      { claro: '#e4e8ec', escuro: '#6f7a86' },
      { claro: '#f6f1e2', escuro: '#c9b98a' },
      { claro: '#edeff1', escuro: '#9aa2ab' },
      { claro: '#fff8e1', escuro: '#f0cf6b' },
      { claro: '#e6e9ec', escuro: '#7d8792' },
    ]),
  },
  {
    id: 'cortinas',
    nomeLoja: 'Casa & Cortina',
    descricao: 'Cortinas e persianas sob medida',
    corMarca: '#0F4C5C',
    areaCorFundoGaleria: 'CABECALHO',
    fonteGaleria: 'Poppins',
    link: 'dizai.com/casa-e-cortina',
    pergunta: 'Tem foto de cortina blackout instalada?',
    resposta: 'Tenho sim! Veja como ficam:',
    categorias: ['Blackout', 'Rolô', 'Persianas', 'Varão'],
    nomeAlbum: 'Blackout',
    quantidadeFotos: 15,
    fotos: comFotosDaPasta('cortinas', [
      { claro: '#e7eef0', escuro: '#7f9ea8' },
      { claro: '#f2efe9', escuro: '#c7bcaa' },
      { claro: '#dfe8ea', escuro: '#5f8590' },
      { claro: '#efece6', escuro: '#b2a790' },
      { claro: '#e9f0f1', escuro: '#94b2ba' },
      { claro: '#f4f1ec', escuro: '#d5ccbd' },
      { claro: '#dbe4e6', escuro: '#4f7682' },
      { claro: '#eeeae3', escuro: '#a69b85' },
      { claro: '#e5edef', escuro: '#87a7b0' },
    ]),
  },
];
