import type { CorMarca } from '../../../core/models/perfil.model';
import type {
  AreaCorFundoVitrine,
  EstiloAbas,
  EstiloCor,
  EstiloMenu,
  FonteVitrine,
  LayoutFotos,
} from '../../../core/models/vitrine.model';

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

/** Um depoimento do tópico de feedbacks (o mesmo carrossel da vitrine). */
export interface FeedbackExemplo {
  texto: string;
  nome: string;
  /** AAAA-MM-DD, ou null (sem data). */
  data: string | null;
  estrelas: number;
}

/** A aba "Agendar horário" da página (lojas de serviço com a agenda online ligada). */
export interface AgendaExemplo {
  /** O primeiro é o escolhido. */
  servicos: { nome: string; descricao: string; preco: string; duracao: string }[];
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
  /** Como a cor de destaque pinta os botões e as etiquetas (normal, metálico, degradê, vidro). */
  estiloCor: EstiloCor;
  /** Abas Vitrine | Agendar horário (só nas lojas com agenda). */
  estiloAbas?: EstiloAbas;
  layoutFotos: LayoutFotos;
  /** Cor de fundo "Tema escuro (preto)": a página toda escura. */
  temaEscuro?: boolean;
  /** Logo da loja em public/landing/galeria/logos/ (no lugar da inicial). */
  logo?: string;
  /** "degrade" = a "capa pronta" com a cor da loja; ou o caminho de uma foto em public/. Sem capa: omitido. */
  capa?: 'degrade' | string;
  link: string;
  pergunta: string;
  resposta: string;
  /** Os tópicos de fotos: os dois primeiros aparecem como álbuns na página. */
  categorias: string[];
  quantidadeFotos: number;
  fotos: FotoExemplo[];
  /** Tópico "Feedbacks" depois das fotos. */
  feedbacks?: FeedbackExemplo[];
  /** Tópico "Como chegar" (o mapa com o endereço) no fim. */
  endereco?: string;
  agenda?: AgendaExemplo;
}

export const EXEMPLOS_GALERIA: ExemploGaleria[] = [
  {
    id: 'unhas',
    nomeLoja: 'Bella Studio',
    descricao: 'Unhas em gel e nail art',
    corMarca: 'VINHO',
    areaCorFundoGaleria: 'CABECALHO',
    fonteGaleria: 'Dancing Script',
    estiloMenu: 'MINIMALISTA',
    estiloCor: 'METALICO',
    estiloAbas: 'SUBLINHADO',
    layoutFotos: 'DESTAQUE',
    logo: '/landing/galeria/logos/bella-studio.svg',
    capa: 'degrade',
    link: 'dizai.com/l/bella-studio',
    pergunta: 'Tem horário essa semana? Queria ver uns trabalhos antes 💅',
    resposta: 'Tem sim! Aqui você vê os trabalhos e já escolhe o horário:',
    categorias: ['Unhas em gel', 'Nail art'],
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
    feedbacks: [
      {
        texto: 'Amei a esmaltação em gel! Durou mais de três semanas perfeita e o atendimento é um carinho.',
        nome: 'Fernanda Lima',
        data: '2026-10-12',
        estrelas: 5,
      },
      { texto: 'Pontual, caprichosa e o espaço é lindo. Já marquei a próxima!', nome: 'Juliana Costa', data: null, estrelas: 5 },
      { texto: 'A nail art ficou exatamente como eu pedi.', nome: 'Camila Rocha', data: '2026-09-30', estrelas: 5 },
    ],
    agenda: {
      servicos: [
        { nome: 'Esmaltação em gel', descricao: 'Cutilagem e esmalte em gel na unha natural. Dura até 21 dias.', preco: 'R$ 80,00', duracao: '1h15' },
        { nome: 'Manicure tradicional', descricao: 'Cutilagem, lixamento e esmaltação comum.', preco: 'R$ 35,00', duracao: '45 min' },
        { nome: 'Pé e mão', descricao: 'Manicure e pedicure no mesmo horário.', preco: 'R$ 70,00', duracao: '1h30' },
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
    estiloCor: 'DEGRADE',
    layoutFotos: 'MOSAICO',
    logo: '/landing/galeria/logos/pedacinho-do-ceu.jpg',
    capa: '/landing/galeria/bolos/02.webp',
    link: 'dizai.com/l/pedacinho-do-ceu',
    pergunta: 'Tem fotos de bolos infantis que você já fez? 🎂',
    resposta: 'Tenho sim! Olha só:',
    categorias: ['Bolos infantis', 'Casamento'],
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
    feedbacks: [
      {
        texto: 'O bolo da festa da minha filha estava lindo e delicioso. Todo mundo pediu o contato!',
        nome: 'Patrícia Melo',
        data: '2026-09-28',
        estrelas: 5,
      },
      { texto: 'Docinhos perfeitos e entregues no horário combinado.', nome: 'Renata Alves', data: null, estrelas: 5 },
      { texto: 'O melhor bolo de ninho com morango que já comi.', nome: 'Marcos Pereira', data: '2026-10-03', estrelas: 5 },
    ],
    endereco: 'Rua das Acácias, 120 - Manaíra, João Pessoa - PB',
  },
  {
    id: 'moveis',
    nomeLoja: 'Arte em Madeira',
    descricao: 'Móveis planejados sob medida',
    corMarca: 'MARROM',
    areaCorFundoGaleria: 'CABECALHO',
    fonteGaleria: 'DM Serif Display',
    estiloMenu: 'MINIMALISTA',
    estiloCor: 'NORMAL',
    layoutFotos: 'CARROSSEL',
    logo: '/landing/galeria/logos/arte-em-madeira.svg',
    link: 'dizai.com/l/arte-em-madeira',
    pergunta: 'Tem fotos de cozinhas planejadas que vocês já fizeram?',
    resposta: 'Temos sim! Veja algumas das nossas cozinhas:',
    categorias: ['Cozinhas planejadas', 'Quartos'],
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
    endereco: 'Av. Epitácio Pessoa, 2100 - Tambaú, João Pessoa - PB',
  },
  {
    id: 'eletricista',
    nomeLoja: 'Zé Eletricista',
    descricao: 'Iluminação personalizada e instalações',
    corMarca: 'MOSTARDA',
    areaCorFundoGaleria: 'PAGINA',
    fonteGaleria: 'Oswald',
    estiloMenu: 'ARREDONDADO',
    estiloCor: 'VIDRO',
    estiloAbas: 'CONTORNO',
    layoutFotos: 'GRADE',
    temaEscuro: true,
    logo: '/landing/galeria/logos/ze-eletricista.svg',
    capa: 'degrade',
    link: 'dizai.com/l/ze-eletricista',
    pergunta: 'Tem fotos de iluminação que você já fez? Queria marcar uma instalação 💡',
    resposta: 'Tenho sim! Veja os projetos e escolha o melhor horário:',
    categorias: ['Iluminação', 'Fitas de LED'],
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
    feedbacks: [
      {
        texto: 'Instalou os pendentes da cozinha com muito cuidado e deixou tudo limpo.',
        nome: 'Ricardo Souza',
        data: '2026-10-08',
        estrelas: 5,
      },
      { texto: 'Chegou no horário e resolveu o disjuntor na hora. Recomendo!', nome: 'Ana Paula', data: null, estrelas: 5 },
    ],
    agenda: {
      servicos: [
        {
          nome: 'Instalação de luminária',
          descricao: 'Lustre, pendente ou plafon, com o material do cliente.',
          preco: 'R$ 120,00',
          duracao: '1h',
        },
        { nome: 'Visita para orçamento', descricao: 'Avaliação no local e orçamento do serviço completo.', preco: 'R$ 50,00', duracao: '1h' },
        { nome: 'Troca de tomadas', descricao: 'Até 4 tomadas ou interruptores.', preco: 'R$ 40,00', duracao: '30 min' },
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
    areaCorFundoGaleria: 'PAGINA',
    fonteGaleria: 'Marcellus',
    estiloMenu: 'ARREDONDADO',
    estiloCor: 'NORMAL',
    layoutFotos: 'GRADE',
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
