import type { CorMarca } from '../../../core/models/perfil.model';
import type { AreaCorFundoVitrine, EstiloMenu, FonteVitrine } from '../../../core/models/vitrine.model';

/**
 * Foto da galeria de exemplo. O degradê nos tons do trabalho aparece enquanto a imagem carrega.
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

/** A aba "Agendar horário" da página (lojas de serviço com a agenda online ligada). */
export interface AgendaExemplo {
  servicos: { nome: string; duracao: string }[];
  /** Horários livres no dia escolhido (todos à tarde). */
  horarios: string[];
  horaEscolhida: string;
  nomeCliente: string;
}

/** Uma loja de exemplo: a conversa que leva ao link e a página pública que abre (igual a /l/{slug}). */
export interface ExemploGaleria {
  id: string;
  nomeLoja: string;
  descricao: string;
  /** Uma das cores de marca que o lojista escolhe no painel (CORES_MARCA). */
  corMarca: CorMarca;
  areaCorFundoGaleria: AreaCorFundoVitrine;
  fonteGaleria: FonteVitrine;
  /** Menu das categorias, como na vitrine (Personalizar vitrine): arredondado ou minimalista. */
  estiloMenu: EstiloMenu;
  /** Logo da loja em public/landing/galeria/logos/ (no lugar da inicial). */
  logo?: string;
  /** "degrade" = a "capa pronta" com a cor da loja; ou o caminho de uma foto em public/. Sem capa: omitido. */
  capa?: 'degrade' | string;
  link: string;
  pergunta: string;
  resposta: string;
  /** Os tópicos da galeria: os dois primeiros aparecem como álbuns na página. */
  categorias: string[];
  quantidadeFotos: number;
  fotos: FotoExemplo[];
  agenda?: AgendaExemplo;
}

export const EXEMPLOS_GALERIA: ExemploGaleria[] = [
  {
    id: 'unhas',
    nomeLoja: 'Bella Studio',
    descricao: 'Unhas em gel e nail art',
    corMarca: 'VINHO',
    areaCorFundoGaleria: 'CABECALHO',
    fonteGaleria: 'Cormorant Garamond',
    estiloMenu: 'MINIMALISTA',
    logo: '/landing/galeria/logos/bella-studio.svg',
    capa: 'degrade',
    link: 'dizai.com/l/bella-studio',
    pergunta: 'Tem horário essa semana? Queria ver uns trabalhos antes 💅',
    resposta: 'Tem sim! Aqui você vê os trabalhos e já escolhe o horário:',
    categorias: ['Unhas em gel', 'Francesinha', 'Nail art', 'Pés'],
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
    agenda: {
      servicos: [
        { nome: 'Esmaltação em gel', duracao: '1h15' },
        { nome: 'Manicure tradicional', duracao: '45 min' },
        { nome: 'Pé e mão', duracao: '1h30' },
      ],
      horarios: ['13:00', '14:30', '16:00', '16:30'],
      horaEscolhida: '16:00',
      nomeCliente: 'Fernanda',
    },
  },
  {
    id: 'bolos',
    nomeLoja: 'Pedacinho do Céu',
    descricao: 'Bolos e doces para festas',
    corMarca: 'ROSA_ESCURO',
    areaCorFundoGaleria: 'PAGINA',
    fonteGaleria: 'Playfair Display',
    estiloMenu: 'ARREDONDADO',
    logo: '/landing/galeria/logos/pedacinho-do-ceu.jpg',
    capa: '/landing/galeria/bolos/02.webp',
    link: 'dizai.com/l/pedacinho-do-ceu',
    pergunta: 'Tem fotos de bolos infantis que você já fez? 🎂',
    resposta: 'Tenho sim! Olha só:',
    categorias: ['Bolos infantis', 'Casamento', 'Tortas', 'Docinhos'],
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
    corMarca: 'MARROM',
    areaCorFundoGaleria: 'CABECALHO',
    fonteGaleria: 'Lora',
    estiloMenu: 'MINIMALISTA',
    logo: '/landing/galeria/logos/arte-em-madeira.svg',
    link: 'dizai.com/l/arte-em-madeira',
    pergunta: 'Tem fotos de cozinhas planejadas que vocês já fizeram?',
    resposta: 'Temos sim! Veja algumas das nossas cozinhas:',
    categorias: ['Cozinhas planejadas', 'Quartos', 'Closets', 'Banheiros'],
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
    corMarca: 'MOSTARDA',
    areaCorFundoGaleria: 'PAGINA',
    fonteGaleria: 'Montserrat',
    estiloMenu: 'ARREDONDADO',
    logo: '/landing/galeria/logos/ze-eletricista.svg',
    capa: 'degrade',
    link: 'dizai.com/l/ze-eletricista',
    pergunta: 'Tem fotos de iluminação que você já fez? Queria marcar uma visita 💡',
    resposta: 'Tenho sim! Veja os projetos e escolha o melhor horário:',
    categorias: ['Iluminação personalizada', 'Fitas de LED', 'Quadros de energia', 'Tomadas'],
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
    agenda: {
      servicos: [
        { nome: 'Visita para orçamento', duracao: '1h' },
        { nome: 'Instalação de luminária', duracao: '1h' },
        { nome: 'Troca de tomadas', duracao: '30 min' },
      ],
      horarios: ['13:00', '14:00', '15:00', '17:00'],
      horaEscolhida: '14:00',
      nomeCliente: 'Ricardo',
    },
  },
  {
    id: 'cortinas',
    nomeLoja: 'Casa & Cortina',
    descricao: 'Cortinas e persianas sob medida',
    corMarca: 'AZUL_PETROLEO',
    areaCorFundoGaleria: 'CABECALHO',
    fonteGaleria: 'Poppins',
    estiloMenu: 'MINIMALISTA',
    logo: '/landing/galeria/logos/casa-e-cortina.svg',
    link: 'dizai.com/l/casa-e-cortina',
    pergunta: 'Tem foto de cortina blackout instalada?',
    resposta: 'Tenho sim! Veja como ficam:',
    categorias: ['Blackout', 'Rolô', 'Persianas', 'Varão'],
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
