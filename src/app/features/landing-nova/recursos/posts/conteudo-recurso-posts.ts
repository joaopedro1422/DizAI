import type { TipoLanding } from '../../../landing/conteudo-landing';
import { ConteudoPost, EstiloPost, MarcaPost } from '../../../posts/motor/tipos-post';
import { conteudoDeExemplo, estiloDeExemplo, marcaDeExemplo } from '../../landing/artes-landing';
import { ConteudoRecurso } from '../conteudo-recurso';

/** As cenas do mock: o gerador no painel (o que divulgar, formato, as 4 artes, o post) e o post publicado. */
export type CenaPosts = 'tipo' | 'formato' | 'artes' | 'editar' | 'resultado';

/** A loja do exemplo e o post que sai do gerador (o mesmo do começo ao fim). */
export interface ExemploPosts {
  marca: MarcaPost;
  /** "studiobella": o @ do Instagram. */
  usuario: string;
  /** Os itens do passo 2 (o 1º é o tocado), com a foto de cada um. */
  itens: { nome: string; foto: string }[];
  /** As fotos do item escolhido (a 1ª é a da arte). */
  fotos: string[];
  orientacao: string;
  conteudo: ConteudoPost;
  /** As 4 combinações que o gerador entrega para o mesmo conteúdo (a 2ª é a escolhida). */
  estilos: EstiloPost[];
  legenda: string;
  comentario: { usuario: string; texto: string };
}

export interface ConteudoRecursoPosts extends ConteudoRecurso {
  exemplo: ExemploPosts;
}

const GALERIA = '/landing/galeria';
const LOGOS = `${GALERIA}/logos`;
const unhas = (n: number) => `${GALERIA}/unhas/${String(n).padStart(2, '0')}.webp`;
const bolos = (n: number) => `${GALERIA}/bolos/${String(n).padStart(2, '0')}.webp`;

const RECURSOS = (produtos: boolean): ConteudoRecurso['recursos']['itens'] => [
  { icone: 'brilho', titulo: '4 artes por vez', texto: 'Cada pedido gera 4 composições diferentes. Não gostou? "Outras artes" traz mais 4.' },
  { icone: 'imagem', titulo: 'Com a sua identidade', texto: 'A sua logo, a cor e a fonte da vitrine e as fotos que você já cadastrou.' },
  {
    icone: 'conversa',
    titulo: 'Textos e legenda prontos',
    texto: 'Título, frase de apoio, botão e a legenda com hashtags, escritos pela IA. Você edita o que quiser.',
  },
  {
    icone: produtos ? 'documento' : 'calendario',
    titulo: produtos ? 'Tabela de preços' : 'Agenda aberta',
    texto: produtos
      ? 'Escolha até 6 itens e a arte sai com o nome e o preço de cada um, organizada.'
      : 'Os próximos horários livres saem direto da sua agenda, do jeito que estão agora.',
  },
  { icone: 'estrela', titulo: 'Depoimentos', texto: 'Um feedback da sua vitrine vira um post com as estrelas e o nome do cliente.' },
  { icone: 'relogio', titulo: 'Feed, quadrado ou story', texto: 'O formato certo para cada lugar, no tamanho que o Instagram pede.' },
  { icone: 'externo', titulo: 'Compartilhe na hora', texto: 'Pelo celular, a arte vai direto para o Instagram ou o WhatsApp. No computador, é só baixar.' },
  { icone: 'listaRepetida', titulo: 'Sempre diferente', texto: 'Mais de 30 estilos combinados com a sua marca: lojas diferentes nunca recebem as mesmas artes.' },
];

const PERGUNTAS_COMUNS: [string, string][] = [
  ['Preciso saber design?', 'Não. Você escolhe o que quer divulgar e o DizAI monta as artes com a sua logo, cores e fotos.'],
  ['Quanto custa?', 'O gerador de posts faz parte do DizAI. Você cria quantas artes quiser.'],
  ['Posso mudar o texto da arte?', 'Sim. Título, frase de apoio, botão e legenda ficam editáveis antes de compartilhar.'],
  ['E se eu não gostar de nenhuma?', 'Toque em "Outras artes" para novas composições ou em "Outros textos" para outras frases.'],
];

const MOTIVOS = {
  rotulo: 'Por que postar com o DizAI',
  titulo: ['Postar com frequência', 'sem perder o dia no Canva.'] as [string, string],
  apoio: 'Quem aparece no Instagram é lembrado na hora de comprar. O difícil é ter tempo para criar: o DizAI resolve essa parte.',
};
const O_QUE_TEM = { rotulo: 'O que o gerador faz', titulo: ['Tudo o que um post precisa,', 'em poucos toques.'] as [string, string] };
const PERGUNTAS = { titulo: 'Sobre os posts', apoio: 'O que todo dono de negócio pergunta antes de criar o primeiro.' };
const FINAL = {
  titulo: 'O seu próximo post pronto hoje.',
  texto: 'Cadastre a sua loja, escolha o que divulgar e compartilhe uma arte com a cara do seu negócio.',
  botao: 'Criar as minhas artes',
};
const FATOS = ['Com a sua logo, cores e fotos', 'Legenda com hashtags', 'Feed, quadrado ou story'];

const BELLA = marcaDeExemplo('Studio Bella', 'studio-bella', 'ROSA_ESCURO', 'METALICO', 'Dancing Script', `${LOGOS}/studio-bella.webp`);
const PEDACINHO = marcaDeExemplo('Pedacinho do Céu', 'pedacinho-do-ceu', 'ROSA_ESCURO', 'DEGRADE', 'Dancing Script', `${LOGOS}/pedacinho-do-ceu.jpg`);

export const RECURSO_POSTS: Record<TipoLanding, ConteudoRecursoPosts> = {
  produtos: {
    tipo: 'produtos',
    landing: { rota: '/vendas', rotulo: 'Para quem vende' },
    tituloPagina: 'Posts para o Instagram com a sua marca | DizAI',
    rotulo: 'Posts para as redes sociais',
    hero: {
      titulo: 'O seu produto merece aparecer',
      grifo: 'todos os dias.',
      apoio: 'Escolha o que quer divulgar e o DizAI cria artes com a sua logo, as suas cores e as fotos dos seus produtos, '
        + 'com o texto e a legenda prontos para o Instagram.',
      botao: 'Criar as minhas artes grátis',
    },
    fatos: FATOS,
    cenas: [
      { cena: 'tipo', legenda: 'Você escolhe o que quer divulgar' },
      { cena: 'formato', legenda: 'Escolha o formato e, se quiser, o tom' },
      { cena: 'artes', legenda: 'Saem 4 artes com a cara da sua loja' },
      { cena: 'editar', legenda: 'Ajuste o texto e compartilhe', ms: 8000 },
      { cena: 'resultado', legenda: 'Pronto para o seu Instagram', ms: 8000 },
    ],
    motivos: {
      ...MOTIVOS,
      itens: [
        ['Quem é visto, vende', 'O cliente lembra de quem aparece no feed dele. Um post por semana já faz diferença nas encomendas.'],
        ['Profissional sem esforço', 'Artes organizadas, com a sua identidade, passam a mesma confiança de uma loja grande.'],
        ['Do produto ao pedido', 'A legenda chama para o WhatsApp, e o assistente atende quem vem pelo post.'],
      ],
    },
    recursos: { ...O_QUE_TEM, itens: RECURSOS(true) },
    perguntas: {
      ...PERGUNTAS,
      itens: [
        PERGUNTAS_COMUNS[0],
        ['Posso divulgar o cardápio com os preços?', 'Sim. Na Tabela de preços você escolhe até 6 itens e a arte sai com o nome e o valor de cada um.'],
        ...PERGUNTAS_COMUNS.slice(1),
      ],
    },
    final: FINAL,
    exemplo: {
      marca: PEDACINHO,
      usuario: 'pedacinhodoceu',
      itens: [
        { nome: 'Bolo de aniversário', foto: bolos(3) },
        { nome: 'Bolo decorado', foto: bolos(2) },
        { nome: 'Doces finos', foto: bolos(5) },
      ],
      fotos: [bolos(3), bolos(4), bolos(6), bolos(7)],
      orientacao: 'tom carinhoso, festa de aniversário',
      conteudo: conteudoDeExemplo({
        tipo: 'DESTAQUE',
        selo: 'Mais pedido',
        titulo: 'Bolo de aniversário',
        apoio: 'Massa fofinha e recheio cremoso',
        chamada: 'Encomende pelo WhatsApp',
        preco: 'R$ 120',
        fotos: [bolos(3)],
      }),
      estilos: [
        estiloDeExemplo({ layout: 'revista', paleta: 'foto', fonteApoio: 'DM Sans' }),
        estiloDeExemplo({ layout: 'cartao', paleta: 'creme', decor: 'brilhos', fonteApoio: 'DM Sans', cartao: 'flutuante', fundo: 'luz' }),
        estiloDeExemplo({ layout: 'dividido', paleta: 'cor', decor: 'pontos', alinhamento: 'esquerda', fonteApoio: 'Poppins' }),
        estiloDeExemplo({ layout: 'arco', paleta: 'clara', decor: 'organico', fonteApoio: 'DM Sans', fundo: 'papel' }),
      ],
      legenda: 'O bolo de aniversário mais pedido da casa 🎂 Massa fofinha e recheio cremoso.\n\n'
        + 'Encomendas pelo WhatsApp, o link está na bio.\n\n#pedacinhodoceu #bolodeaniversario #bolodefesta',
      comentario: { usuario: 'ana.souza', texto: 'Quero esse para o aniversário da minha mãe! 😍' },
    },
  },
  servicos: {
    tipo: 'servicos',
    landing: { rota: '/agendamentos', rotulo: 'Para quem agenda' },
    tituloPagina: 'Posts para o Instagram com a sua marca | DizAI',
    rotulo: 'Posts para as redes sociais',
    hero: {
      titulo: 'O seu trabalho merece aparecer',
      grifo: 'todos os dias.',
      apoio: 'Escolha o que quer divulgar e o DizAI cria artes com a sua logo, as suas cores e as fotos do seu trabalho, '
        + 'com o texto e a legenda prontos. Até os horários livres viram post.',
      botao: 'Criar as minhas artes grátis',
    },
    fatos: FATOS,
    cenas: [
      { cena: 'tipo', legenda: 'Você escolhe o que quer divulgar' },
      { cena: 'formato', legenda: 'Escolha o formato e, se quiser, o tom' },
      { cena: 'artes', legenda: 'Saem 4 artes com a cara do seu negócio' },
      { cena: 'editar', legenda: 'Ajuste o texto e compartilhe', ms: 8000 },
      { cena: 'resultado', legenda: 'Pronto para o seu Instagram', ms: 8000 },
    ],
    motivos: {
      ...MOTIVOS,
      itens: [
        ['Quem é visto, é lembrado', 'A cliente lembra de quem aparece no feed dela. Um post por semana já enche a agenda.'],
        ['Profissional sem esforço', 'Artes organizadas, com a sua identidade, valorizam o seu trabalho e o seu preço.'],
        ['Horário livre não fica parado', 'Um post com os horários da semana leva a cliente direto para o agendamento.'],
      ],
    },
    recursos: { ...O_QUE_TEM, itens: RECURSOS(false) },
    perguntas: {
      ...PERGUNTAS,
      itens: [
        PERGUNTAS_COMUNS[0],
        ['Os horários do post são os da minha agenda?', 'Sim. Em Agenda aberta, os horários livres saem da sua agenda do DizAI, e você marca quais dias vão para a arte.'],
        ...PERGUNTAS_COMUNS.slice(1),
      ],
    },
    final: FINAL,
    exemplo: {
      marca: BELLA,
      usuario: 'studiobella',
      itens: [
        { nome: 'Esmaltação em gel', foto: unhas(1) },
        { nome: 'Nail art', foto: unhas(4) },
        { nome: 'Alongamento', foto: unhas(2) },
      ],
      fotos: [unhas(1), unhas(3), unhas(5), unhas(2)],
      orientacao: 'tom delicado, para o fim de semana',
      conteudo: conteudoDeExemplo({
        tipo: 'DESTAQUE',
        selo: 'Queridinho',
        titulo: 'Esmaltação em gel',
        apoio: 'Dura até 21 dias sem descascar',
        chamada: 'Agende pelo WhatsApp',
        preco: 'R$ 80',
        fotos: [unhas(1)],
      }),
      estilos: [
        estiloDeExemplo({ layout: 'revista', paleta: 'foto', fonteApoio: 'Poppins' }),
        estiloDeExemplo({ layout: 'cartao', paleta: 'creme', decor: 'brilhos', fonteApoio: 'Poppins', cartao: 'flutuante', fundo: 'luz' }),
        estiloDeExemplo({ layout: 'dividido', paleta: 'cor', decor: 'linhas', alinhamento: 'esquerda', fonteApoio: 'Poppins' }),
        estiloDeExemplo({ layout: 'arco', paleta: 'clara', decor: 'organico', fonteApoio: 'Poppins', fundo: 'grao' }),
      ],
      legenda: 'Unhas lindas por até 21 dias 💅 A esmaltação em gel é a queridinha do Studio Bella.\n\n'
        + 'Agende pelo WhatsApp, o link está na bio.\n\n#studiobella #unhasemgel #esmaltacaoemgel',
      comentario: { usuario: 'camila.rocha', texto: 'Amei! Tem horário no sábado? 😍' },
    },
  },
};
