import { buscarCorMarca } from '../../../core/constants/cores-marca';
import { fundoDoDestaque } from '../../../core/constants/estilos-cor';
import { CorMarca } from '../../../core/models/perfil.model';
import { EstiloCor, ehFonteManuscrita, fonteComFamilia } from '../../../core/models/vitrine.model';
import { ConteudoPost, EstiloPost, MarcaPost } from '../../posts/motor/tipos-post';

/**
 * As artes do leque de posts das landings: o próprio ArtePostComponent do gerador, com estilos escolhidos à mão para
 * mostrar a variedade (foto cheia, foto sangrada, cardápio, foto com cartão, pôster, carimbo, depoimento, duas fotos e
 * mosaico nos produtos; agenda, só texto e foto com texto nos serviços), com as lojas e fotos de exemplo de public/landing.
 */
export interface ArteLanding {
  id: string;
  /** Para o leitor de tela: "Arte de promoção da Barbearia do Léo". */
  descricao: string;
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

const GALERIA = '/landing/galeria';
const LOGOS = `${GALERIA}/logos`;
const unhas = (n: number) => `${GALERIA}/unhas/${String(n).padStart(2, '0')}.webp`;
const bolos = (n: number) => `${GALERIA}/bolos/${String(n).padStart(2, '0')}.webp`;
const salgados = (n: number) => `${GALERIA}/salgados/${String(n).padStart(2, '0')}.webp`;

const BELLA = marca('Studio Bella', 'studio-bella', 'ROSA_ESCURO', 'METALICO', 'Dancing Script', `${LOGOS}/studio-bella.webp`);
const LEO = marca('Barbearia do Léo', 'barbearia-do-leo', 'PRETO', 'NORMAL', 'Oswald', `${LOGOS}/barbearia-do-leo.svg`);
const PEDACINHO = marca('Pedacinho do Céu', 'pedacinho-do-ceu', 'ROSA_ESCURO', 'DEGRADE', 'Playfair Display', `${LOGOS}/pedacinho-do-ceu.jpg`);
const SALGADOS = marca('Rei dos Salgados', 'rei-dos-salgados', 'MOSTARDA', 'NORMAL', 'Oswald', `${LOGOS}/rei-dos-salgados.svg`);
const FLORES = marca('Ateliê das Flores', 'atelie-das-flores', 'VERDE_OLIVA', 'NORMAL', 'Marcellus', `${LOGOS}/atelie-das-flores.svg`);

const SERVICOS: ArteLanding[] = [
  {
    // foto simples: a foto cheia, como capa de revista
    id: 'bella-revista',
    descricao: 'Arte de novidade do Studio Bella, com a foto cheia',
    marca: BELLA,
    conteudo: conteudo({ tipo: 'NOVIDADE', selo: 'Novidade', titulo: 'Nail art da semana', apoio: 'Francesinha com detalhe dourado', chamada: 'Agende pelo WhatsApp', fotos: [unhas(4)] }),
    estilo: estilo({ layout: 'revista', paleta: 'foto', fonteApoio: 'Poppins' }),
  },
  {
    // cartão elaborado: os horários livres de verdade
    id: 'bella-agenda',
    descricao: 'Arte de agenda aberta do Studio Bella, com os horários livres',
    marca: BELLA,
    conteudo: conteudo({
      tipo: 'AGENDA',
      selo: 'Horários livres',
      titulo: 'Ainda dá tempo',
      apoio: 'Esmaltação em gel',
      chamada: 'Agende já',
      horarios: [
        { dia: 'Amanhã', horas: ['09:00 às 11:30', '14:00', '16:30'] },
        { dia: 'Sábado, 15/11', horas: ['10:00', '13:30 às 15:00'] },
      ],
    }),
    estilo: estilo({ layout: 'calendario', paleta: 'clara', decor: 'organico', alinhamento: 'esquerda', fonteApoio: 'Poppins', fundo: 'grao', cartao: 'sombra-dura' }),
  },
  {
    // só texto, fundo liso com o preço em destaque
    id: 'leo-promocao',
    descricao: 'Arte de promoção da Barbearia do Léo, só com texto e o preço',
    marca: LEO,
    conteudo: conteudo({ tipo: 'PROMOCAO', selo: 'Terça e quarta', titulo: 'Corte + barba', apoio: 'Nos horários da manhã', chamada: 'Agende o seu', preco: 'R$ 55' }),
    estilo: estilo({ layout: 'liso', paleta: 'cor', fonteApoio: 'Montserrat', variante: 1, botao: 'quadrado', raio: 'reto' }),
  },
  {
    // foto com cartão por cima
    id: 'bella-cartao',
    descricao: 'Arte de destaque do Studio Bella, com a foto e um cartão',
    marca: BELLA,
    conteudo: conteudo({ tipo: 'DESTAQUE', selo: 'Queridinho', titulo: 'Esmaltação em gel', apoio: 'Dura até 21 dias sem descascar', chamada: 'Agende pelo WhatsApp', preco: 'R$ 80', fotos: [unhas(1)] }),
    estilo: estilo({ layout: 'cartao', paleta: 'creme', decor: 'brilhos', fonteApoio: 'Poppins', cartao: 'flutuante', fundo: 'luz' }),
  },
  {
    // foto e texto lado a lado
    id: 'leo-dividido',
    descricao: 'Arte de destaque da Barbearia do Léo, com foto e texto',
    marca: LEO,
    conteudo: conteudo({ tipo: 'DESTAQUE', selo: 'Mais pedido', titulo: 'Degradê na régua', apoio: 'Acabamento na navalha e toalha quente', chamada: 'Marque o seu horário', preco: 'R$ 40', fotos: ['/landing/hub/barbearia.webp'] }),
    estilo: estilo({ layout: 'dividido', paleta: 'escura', decor: 'linhas', alinhamento: 'esquerda', fonteApoio: 'Montserrat', raio: 'reto' }),
  },
];

const PRODUTOS: ArteLanding[] = [
  {
    // foto simples: a foto cheia, como capa de revista
    id: 'pedacinho-revista',
    descricao: 'Arte de destaque do Pedacinho do Céu, com a foto cheia',
    marca: PEDACINHO,
    conteudo: conteudo({ tipo: 'DESTAQUE', selo: 'Encomendas abertas', titulo: 'O bolo da sua festa', apoio: 'Massa fofinha e recheio cremoso', chamada: 'Peça o seu', fotos: [bolos(2)] }),
    estilo: estilo({ layout: 'revista', paleta: 'foto', fonteApoio: 'DM Sans' }),
  },
  {
    // foto sangrada até as bordas, com a logo na borda
    id: 'salgados-sangrada',
    descricao: 'Arte de destaque do Rei dos Salgados, com a foto até as bordas',
    marca: SALGADOS,
    conteudo: conteudo({ tipo: 'DESTAQUE', selo: 'Para a sua festa', titulo: 'Salgados fritos na hora', apoio: 'Coxinha, risole, kibe e bolinha de queijo', chamada: 'Encomende o seu', preco: 'R$ 85 o cento', fotos: [salgados(2)] }),
    estilo: estilo({ layout: 'sangrada', paleta: 'escura', filtro: 'quente', fonteApoio: 'Montserrat', alinhamento: 'esquerda', botao: 'quadrado', selo: 'tarja', raio: 'reto' }),
  },
  {
    // cartão elaborado: o cardápio com os preços
    id: 'pedacinho-cardapio',
    descricao: 'Arte de cardápio do Pedacinho do Céu, com os preços',
    marca: PEDACINHO,
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
    estilo: estilo({ layout: 'cardapio', paleta: 'creme', decor: 'pontos', fonteApoio: 'DM Sans', fundo: 'papel' }),
  },
  {
    // foto com cartão por cima
    id: 'flores-cartao',
    descricao: 'Arte de novidade do Ateliê das Flores, com a foto e um cartão',
    marca: FLORES,
    conteudo: conteudo({ tipo: 'NOVIDADE', selo: 'Entrega hoje', titulo: 'Buquê do campo', apoio: 'Pedidos até as 16h, com cartão escrito à mão', chamada: 'Encomende o seu', fotos: ['/landing/hub/flores.webp'] }),
    estilo: estilo({ layout: 'cartao', paleta: 'clara', decor: 'organico', fonteApoio: 'DM Sans', cartao: 'fosco', variante: 1 }),
  },
  {
    // pôster: o título grande e a foto num círculo
    id: 'pedacinho-poster',
    descricao: 'Arte de Páscoa do Pedacinho do Céu, em estilo pôster',
    marca: PEDACINHO,
    conteudo: conteudo({ tipo: 'PROMOCAO', selo: 'Encomendas de Páscoa', titulo: 'Doces de Páscoa', apoio: 'Bolos, ovos de colher e mini tortas', chamada: 'Garanta o seu', preco: 'A partir de R$ 49,90', fotos: [bolos(3)] }),
    estilo: estilo({ layout: 'poster', paleta: 'cor', decor: 'brilhos', fonteApoio: 'DM Sans', fundo: 'degrade', selo: 'contorno' }),
  },
  {
    // carimbo: a oferta num selo redondo inclinado
    id: 'salgados-carimbo',
    descricao: 'Arte de promoção do Rei dos Salgados, com o carimbo da oferta',
    marca: SALGADOS,
    conteudo: conteudo({ tipo: 'PROMOCAO', selo: 'Combo festa', titulo: '100 salgados + 2 refrigerantes', apoio: 'Para retirar ou receber em casa', chamada: 'Peça pelo WhatsApp', preco: 'R$ 99', fotos: [salgados(4)] }),
    estilo: estilo({ layout: 'carimbo', paleta: 'creme', decor: 'pontos', filtro: 'quente', fonteApoio: 'Montserrat', fundo: 'papel', botao: 'quadrado' }),
  },
  {
    // depoimento de cliente, como citação
    id: 'flores-citacao',
    descricao: 'Arte de depoimento do Ateliê das Flores',
    marca: FLORES,
    conteudo: conteudo({
      tipo: 'DEPOIMENTO',
      selo: 'Quem recebeu, amou',
      titulo: 'O que dizem os nossos clientes',
      chamada: 'Encomende o seu buquê',
      fotos: ['/landing/hub/flores.webp'],
      depoimento: { texto: 'O buquê chegou no horário, lindo e perfumado. A minha mãe chorou de emoção!', nome: 'Juliana A.', estrelas: 5 },
    }),
    estilo: estilo({ layout: 'citacao', paleta: 'creme', decor: 'organico', fonteApoio: 'DM Sans', fundo: 'grao', variante: 1 }),
  },
  {
    // duas fotos desencontradas
    id: 'pedacinho-dupla',
    descricao: 'Arte de destaque do Pedacinho do Céu, com duas fotos',
    marca: PEDACINHO,
    conteudo: conteudo({ tipo: 'DESTAQUE', selo: 'Feito sob encomenda', titulo: 'Bolos que viram lembrança', apoio: 'Do recheio à decoração, do seu jeito', chamada: 'Fale com a gente', fotos: [bolos(4), bolos(1)] }),
    estilo: estilo({ layout: 'dupla', paleta: 'clara', decor: 'linhas', fonteApoio: 'Poppins', alinhamento: 'esquerda', selo: 'texto', botao: 'sublinhado' }),
  },
  {
    // várias fotos e texto
    id: 'pedacinho-mosaico',
    descricao: 'Arte de novidade do Pedacinho do Céu, com várias fotos',
    marca: PEDACINHO,
    conteudo: conteudo({ tipo: 'NOVIDADE', selo: 'Saiu do forno', titulo: 'Doces para a sua festa', apoio: 'Bem-casados, brigadeiros e mini tortas', chamada: 'Monte a sua mesa', fotos: [bolos(5), bolos(6), bolos(7)] }),
    estilo: estilo({ layout: 'mosaico', paleta: 'cor', decor: 'confete', fonteApoio: 'Poppins' }),
  },
];

export function artesDaLanding(tipo: 'produtos' | 'servicos'): ArteLanding[] {
  return tipo === 'servicos' ? SERVICOS : PRODUTOS;
}

/** As mesmas peças para montar as artes das páginas de recurso (posts e campanhas). */
export { marca as marcaDeExemplo, conteudo as conteudoDeExemplo, estilo as estiloDeExemplo };
