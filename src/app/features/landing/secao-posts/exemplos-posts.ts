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
