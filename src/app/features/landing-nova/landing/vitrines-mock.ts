import type { TipoLanding } from '../../landing/conteudo-landing';

/**
 * As lojas do mock da vitrine ("E ainda vem junto"): 2 por tipo, que se alternam. Cada uma com as cores, a fonte e
 * o conteúdo da vitrine no layout novo. `capa` null = a capa automática em degradê da cor de destaque.
 * Uma foto pode aparecer com enquadramentos diferentes (`posicao`, o object-position) quando só há uma do tema.
 */
export interface FotoMock {
  src: string;
  posicao?: string;
}

export interface LojaMock {
  chave: string;
  nome: string;
  descricao: string;
  logo: string | null;
  capa: string | null;
  fonte: string;
  cores: { destaque: string; fundo: string; borda: string; suave: string; selo: string };
  aberto: string;
  nota: string;
  avaliacoes: number;
  /** Produtos: o menu das categorias; serviços: o tópico da aba Vitrine. */
  categorias: string[];
  topico: { nome: string; fotos: number };
  fotos: FotoMock[];
  depoimentos: { texto: string; nome: string }[];
  semana: [string, string][];
  /** O dia da semana que fica em negrito (o "hoje" da semana acima). */
  hoje: number;
  pagamento: string;
  entrega: string;
  /** O tópico "Como chegar" (o mapa vai no fim, embaixo das Informações). */
  endereco?: { rua: string; bairro: string };
  /** Só serviços: a aba "Agendar horário". */
  agenda?: { servicos: [string, string][]; dias: [string, string][]; horas: string[] };
}

const BOLOS = '/landing/galeria/bolos';
const UNHAS = '/landing/galeria/unhas';
const LOGOS = '/landing/galeria/logos';

const PEDACINHO: LojaMock = {
  chave: 'pedacinho',
  nome: 'Pedacinho do Céu',
  descricao: 'Doces e tortas personalizadas',
  logo: `${LOGOS}/pedacinho-do-ceu.jpg`,
  capa: '/landing/hub/pedacinho-capa.webp',
  fonte: "'Dancing Script', cursive",
  cores: { destaque: '#8a6200', fundo: '#fffaf3', borda: '#eee3d6', suave: '#8a7666', selo: '#f5ede4' },
  aberto: 'Aberto agora · fecha às 19h',
  nota: '4,9',
  avaliacoes: 32,
  categorias: ['Frutas vermelhas', 'Chocolate', 'Red velvet'],
  topico: { nome: 'Frutas vermelhas', fotos: 8 },
  fotos: ['01', '03', '04', '05', '06', '07'].map((n) => ({ src: `${BOLOS}/${n}.webp` })),
  depoimentos: [
    { texto: 'O bolo ficou lindo e delicioso. Todo mundo da festa amou!', nome: 'Ana Souza' },
    { texto: 'Atendimento rápido e entregaram certinho no horário.', nome: 'Carlos Lima' },
  ],
  semana: [['Segunda a sexta', '9h às 19h'], ['Sábado', '9h às 14h'], ['Domingo', 'Fechado']],
  hoje: 1,
  pagamento: 'Pix, Cartão de crédito e Dinheiro',
  entrega: 'Entrega e Retirada no local · Taxa de entrega: R$ 8',
  endereco: { rua: 'Av. Epitácio Pessoa, 1200', bairro: 'Tambaú, João Pessoa - PB' },
};

const SUPER_SALGADOS: LojaMock = {
  chave: 'super-salgados',
  nome: 'Super Salgados',
  descricao: 'Salgados para festas e eventos',
  logo: null,
  capa: null,
  fonte: "'Bebas Neue', sans-serif",
  cores: { destaque: '#c2410c', fundo: '#fff8f3', borda: '#f3dfd2', suave: '#8a6a5a', selo: '#fbece2' },
  aberto: 'Aberto agora · fecha às 20h',
  nota: '4,8',
  avaliacoes: 57,
  categorias: ['Fritos', 'Assados', 'Kits festa'],
  topico: { nome: 'Fritos', fotos: 12 },
  fotos: ['01', '06', '04', '02', '05', '03'].map((n) => ({ src: `/landing/galeria/salgados/${n}.webp` })),
  depoimentos: [
    { texto: 'Pedi 300 salgados para o aniversário e chegaram quentinhos. Sucesso total!', nome: 'Fernanda Rocha' },
    { texto: 'Responderam na hora, até de noite. Já é o meu fornecedor de festa.', nome: 'Paulo Henrique' },
  ],
  semana: [['Terça a sábado', '8h às 20h'], ['Domingo', '8h às 12h'], ['Segunda', 'Fechado']],
  hoje: 0,
  pagamento: 'Pix, Cartão de débito e Dinheiro',
  entrega: 'Entrega e Retirada no local · Taxa de entrega: R$ 10',
  endereco: { rua: 'Rua das Trincheiras, 455', bairro: 'Centro, João Pessoa - PB' },
};

const STUDIO_BELLA: LojaMock = {
  chave: 'studio-bella',
  nome: 'Studio Bella Unhas',
  descricao: 'Unhas em gel e nail art',
  logo: `${LOGOS}/studio-bella.webp`,
  capa: null,
  fonte: "'Dancing Script', cursive",
  cores: { destaque: '#a8455a', fundo: '#fff7f8', borda: '#f0dfe2', suave: '#8f6a72', selo: '#f8e9ec' },
  aberto: 'Aberto agora · fecha às 18h',
  nota: '5,0',
  avaliacoes: 48,
  categorias: ['Esmaltação em gel'],
  topico: { nome: 'Esmaltação em gel', fotos: 9 },
  fotos: ['02', '03', '04', '05', '06', '07'].map((n) => ({ src: `${UNHAS}/${n}.webp` })),
  depoimentos: [],
  semana: [],
  hoje: 0,
  pagamento: '',
  entrega: '',
  agenda: {
    servicos: [['Esmaltação em gel', '1 h · R$ 60'], ['Pé e mão', '1 h 30 · R$ 70']],
    dias: [['Qui', '13'], ['Sex', '14'], ['Sáb', '15'], ['Seg', '17']],
    horas: ['09:00', '10:30', '14:00', '15:30', '17:00'],
  },
};

const BARBEARIA_LEO: LojaMock = {
  chave: 'barbearia-do-leo',
  nome: 'Barbearia do Léo',
  descricao: 'Corte, barba e tradição',
  logo: `${LOGOS}/barbearia-do-leo.svg`,
  capa: null,
  fonte: "'Oswald', sans-serif",
  cores: { destaque: '#1f2937', fundo: '#f6f5f3', borda: '#e2dfda', suave: '#6b665f', selo: '#ecebe8' },
  aberto: 'Aberto agora · fecha às 21h',
  nota: '4,9',
  avaliacoes: 112,
  categorias: ['Cortes'],
  topico: { nome: 'Cortes', fotos: 14 },
  fotos: ['03', '04', '05', '02', '01', '06'].map((n) => ({ src: `/landing/galeria/barbearia/${n}.webp` })),
  depoimentos: [],
  semana: [],
  hoje: 0,
  pagamento: '',
  entrega: '',
  agenda: {
    servicos: [['Corte + barba', '45 min · R$ 55'], ['Corte degradê', '30 min · R$ 35']],
    dias: [['Hoje', '13'], ['Sex', '14'], ['Sáb', '15'], ['Ter', '18']],
    horas: ['15:00', '16:00', '17:30', '18:30', '19:30'],
  },
};

export const VITRINES_MOCK: Record<TipoLanding, LojaMock[]> = {
  produtos: [PEDACINHO, SUPER_SALGADOS],
  servicos: [STUDIO_BELLA, BARBEARIA_LEO],
};
