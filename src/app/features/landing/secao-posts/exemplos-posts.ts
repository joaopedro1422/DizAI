import { buscarCorMarca } from '../../../core/constants/cores-marca';
import { fundoDoDestaque } from '../../../core/constants/estilos-cor';
import { CorMarca } from '../../../core/models/perfil.model';
import { EstiloCor, ehFonteManuscrita, fonteComFamilia } from '../../../core/models/vitrine.model';
import { ConteudoPost, EstiloPost, MarcaPost } from '../../posts/motor/tipos-post';

/**
 * Artes de exemplo da landing (card em "A solução" e a seção "Redes sociais"): o próprio ArtePostComponent do
 * gerador, com as lojas de exemplo da vitrine pública (mesmas logos e fotos de public/landing/galeria), cada uma
 * com a sua identidade e um layout diferente.
 */
export interface ExemploPost {
  id: string;
  negocio: string;
  marca: MarcaPost;
  conteudo: ConteudoPost;
  estilo: EstiloPost;
}

function marca(nome: string, slug: string, cor: CorMarca, estiloCor: EstiloCor, fonte: string, logo: string | null): MarcaPost {
  const hex = buscarCorMarca(cor).hex;
  return {
    nome,
    logo,
    cor: hex,
    preenchimento: fundoDoDestaque(hex, estiloCor),
    corLogo: null,
    preenchimentoLogo: null,
    fonteTitulo: fonteComFamilia(fonte),
    fonteManuscrita: ehFonteManuscrita(fonte),
    link: `dizai.com/l/${slug}`,
  };
}

function conteudo(parcial: Partial<ConteudoPost> & Pick<ConteudoPost, 'tipo' | 'selo' | 'titulo'>): ConteudoPost {
  return { apoio: '', chamada: '', preco: null, fotos: [], itens: [], horarios: [], depoimento: null, ...parcial };
}

function estilo(parcial: Partial<EstiloPost> & Pick<EstiloPost, 'layout' | 'paleta'>): EstiloPost {
  return {
    decor: 'nenhum',
    alinhamento: 'centro',
    filtro: 'natural',
    raio: 'suave',
    fonteApoio: 'Manrope',
    caixaAlta: true,
    variante: 0,
    fundo: 'liso',
    cartao: 'padrao',
    botao: 'pilula',
    selo: 'pilula',
    origemCor: 'vitrine',
    ...parcial,
  };
}

const foto = (pasta: string, n: number) => `/landing/galeria/${pasta}/${String(n).padStart(2, '0')}.webp`;

export const EXEMPLOS_POSTS: ExemploPost[] = [
  {
    id: 'unhas',
    negocio: 'Manicure',
    marca: marca('Bella Studio', 'bella-studio', 'VINHO', 'METALICO', 'Dancing Script', '/landing/galeria/logos/bella-studio.svg'),
    conteudo: conteudo({
      tipo: 'DESTAQUE',
      selo: 'Queridinho',
      titulo: 'Unhas prontas para brilhar',
      apoio: 'Esmaltação em gel que dura até 21 dias',
      chamada: 'Agende pelo WhatsApp',
      preco: 'R$ 80',
      fotos: [foto('unhas', 1)],
    }),
    estilo: estilo({ layout: 'polaroid', paleta: 'escura', decor: 'brilhos', variante: 1, fonteApoio: 'Poppins' }),
  },
  {
    id: 'bolos',
    negocio: 'Confeitaria',
    marca: marca('Pedacinho do Céu', 'pedacinho-do-ceu', 'ROSA_ESCURO', 'DEGRADE', 'Playfair Display', '/landing/galeria/logos/pedacinho-do-ceu.jpg'),
    conteudo: conteudo({
      tipo: 'DESTAQUE',
      selo: 'Encomendas abertas',
      titulo: 'O bolo da sua festa',
      apoio: 'Massa fofinha e recheio cremoso, do jeitinho que você sonhou',
      chamada: 'Peça o seu',
      preco: 'a partir de R$ 120',
      fotos: [foto('bolos', 2)],
    }),
    estilo: estilo({ layout: 'etiqueta', paleta: 'foto', alinhamento: 'esquerda', fonteApoio: 'DM Sans' }),
  },
  {
    id: 'agenda',
    negocio: 'Agenda aberta',
    marca: marca('Bella Studio', 'bella-studio', 'VINHO', 'METALICO', 'Dancing Script', '/landing/galeria/logos/bella-studio.svg'),
    conteudo: conteudo({
      tipo: 'AGENDA',
      selo: 'Horários livres',
      titulo: 'Ainda dá tempo',
      apoio: 'Esmaltação em gel',
      chamada: 'Agende já',
      horarios: [
        { dia: 'Amanhã', horas: ['09:00 às 11:30', '14:00', '16:30'] },
        { dia: 'Sábado, 08/11', horas: ['10:00', '13:30 às 15:00'] },
      ],
    }),
    estilo: estilo({ layout: 'calendario', paleta: 'clara', decor: 'organico', alinhamento: 'esquerda', fonteApoio: 'Poppins' }),
  },
  {
    id: 'moveis',
    negocio: 'Móveis planejados',
    marca: marca('Arte em Madeira', 'arte-em-madeira', 'MARROM', 'NORMAL', 'DM Serif Display', '/landing/galeria/logos/arte-em-madeira.svg'),
    conteudo: conteudo({
      tipo: 'NOVIDADE',
      selo: 'Recém-entregue',
      titulo: 'Cozinha sob medida',
      apoio: 'Projeto do zero, pensado para a rotina da família',
      chamada: 'Peça um orçamento',
      fotos: [foto('moveis', 1)],
    }),
    estilo: estilo({ layout: 'editorial', paleta: 'creme', decor: 'linhas', alinhamento: 'esquerda', fonteApoio: 'DM Sans', variante: 1 }),
  },
  {
    id: 'eletricista',
    negocio: 'Eletricista',
    marca: marca('Zé Eletricista', 'ze-eletricista', 'MOSTARDA', 'VIDRO', 'Oswald', '/landing/galeria/logos/ze-eletricista.svg'),
    conteudo: conteudo({
      tipo: 'DEPOIMENTO',
      selo: 'Cliente feliz',
      titulo: 'Serviço caprichado',
      depoimento: {
        texto: 'Instalou os pendentes da cozinha com muito cuidado e deixou tudo limpo. Recomendo!',
        nome: 'Ricardo',
        estrelas: 5,
      },
      chamada: 'Chame no WhatsApp',
      fotos: [foto('eletricista', 2)],
    }),
    estilo: estilo({ layout: 'balao', paleta: 'escura', decor: 'geometrico', fonteApoio: 'Montserrat', caixaAlta: true }),
  },
];

const BELLA = () => marca('Bella Studio', 'bella-studio', 'VINHO', 'METALICO', 'Dancing Script', '/landing/galeria/logos/bella-studio.svg');
const PEDACINHO = () => marca('Pedacinho do Céu', 'pedacinho-do-ceu', 'ROSA_ESCURO', 'DEGRADE', 'Playfair Display', '/landing/galeria/logos/pedacinho-do-ceu.jpg');

/** Artes que só aparecem na landing do tipo delas (as outras de cada tipo vêm de EXEMPLOS_POSTS). */
const SO_PRODUTOS: ExemploPost[] = [
  {
    id: 'bolos-cardapio',
    negocio: 'Tabela de preços',
    marca: PEDACINHO(),
    conteudo: conteudo({
      tipo: 'CARDAPIO',
      selo: 'Cardápio',
      titulo: 'Bolos de festa',
      chamada: 'Encomende pelo WhatsApp',
      itens: [
        { nome: 'Bolo P · 10 pessoas', preco: 'R$ 90' },
        { nome: 'Bolo M · 20 pessoas', preco: 'R$ 150' },
        { nome: 'Bolo G · 30 pessoas', preco: 'R$ 210' },
        { nome: 'Cento de docinhos', preco: 'R$ 120' },
      ],
    }),
    estilo: estilo({ layout: 'cardapio', paleta: 'creme', decor: 'pontos', fonteApoio: 'DM Sans' }),
  },
  {
    id: 'cortinas',
    negocio: 'Cortinas sob medida',
    marca: marca('Casa & Cortina', 'casa-e-cortina', 'AZUL_PETROLEO', 'NORMAL', 'Marcellus', '/landing/galeria/logos/casa-e-cortina.svg'),
    conteudo: conteudo({
      tipo: 'NOVIDADE',
      selo: 'Coleção nova',
      titulo: 'Linho que filtra a luz',
      apoio: 'Sob medida para a sua janela, com instalação',
      chamada: 'Peça um orçamento',
      fotos: [foto('cortinas', 2)],
    }),
    estilo: estilo({ layout: 'arco', paleta: 'clara', decor: 'linhas', fonteApoio: 'DM Sans' }),
  },
  {
    id: 'bolos-promocao',
    negocio: 'Promoção',
    marca: PEDACINHO(),
    conteudo: conteudo({
      tipo: 'PROMOCAO',
      selo: 'Só esta semana',
      titulo: 'Cento de docinhos com 15% off',
      apoio: 'Nas encomendas até sexta',
      chamada: 'Garanta o seu',
      preco: 'R$ 102',
    }),
    estilo: estilo({ layout: 'bilhete', paleta: 'cor', decor: 'confete', fonteApoio: 'Poppins' }),
  },
];

const SO_SERVICOS: ExemploPost[] = [
  {
    id: 'unhas-precos',
    negocio: 'Tabela de preços',
    marca: BELLA(),
    conteudo: conteudo({
      tipo: 'CARDAPIO',
      selo: 'Nossos serviços',
      titulo: 'Tabela de preços',
      chamada: 'Agende pelo WhatsApp',
      itens: [
        { nome: 'Manicure', preco: 'R$ 35' },
        { nome: 'Pé e mão', preco: 'R$ 60' },
        { nome: 'Esmaltação em gel', preco: 'R$ 80' },
        { nome: 'Alongamento', preco: 'R$ 150' },
      ],
    }),
    estilo: estilo({ layout: 'cardapio', paleta: 'escura', decor: 'brilhos', fonteApoio: 'Poppins' }),
  },
  {
    id: 'unhas-promocao',
    negocio: 'Promoção',
    marca: BELLA(),
    conteudo: conteudo({
      tipo: 'PROMOCAO',
      selo: 'Terça e quarta',
      titulo: 'Pé e mão com 20% off',
      apoio: 'Nos horários da manhã',
      chamada: 'Agende o seu',
      preco: 'R$ 48',
      fotos: [foto('unhas', 3)],
    }),
    estilo: estilo({ layout: 'diagonal', paleta: 'foto', fonteApoio: 'Poppins' }),
  },
];

/** As 5 artes do leque de cada landing (o hub usa EXEMPLOS_POSTS, de negócios dos dois tipos). */
export function exemplosPostsDe(tipo: 'produtos' | 'servicos' | null): ExemploPost[] {
  const de = (ids: string[]) => ids.map((id) => EXEMPLOS_POSTS.find((exemplo) => exemplo.id === id)!);
  if (tipo === 'produtos') {
    const [cardapio, cortinas, promocao] = SO_PRODUTOS;
    return [cortinas, cardapio, ...de(['bolos']), promocao, ...de(['moveis'])];
  }
  if (tipo === 'servicos') {
    const [precos, promocao] = SO_SERVICOS;
    return [precos, ...de(['unhas']), ...de(['agenda']), promocao, ...de(['eletricista'])];
  }
  return EXEMPLOS_POSTS;
}
