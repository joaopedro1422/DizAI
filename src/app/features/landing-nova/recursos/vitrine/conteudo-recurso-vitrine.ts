import type { TipoLanding } from '../../../landing/conteudo-landing';
import { ConteudoRecurso } from '../conteudo-recurso';

/** As cenas do mock do painel no topo da página (passam sozinhas, uma depois da outra). */
export type CenaVitrine = 'personalizar' | 'fotos' | 'mapa' | 'agenda' | 'avaliacoes' | 'resultado';

/** A loja do exemplo (o mesmo negócio do começo ao fim: o que é personalizado no painel aparece no resultado). */
export interface LojaExemplo {
  nome: string;
  slug: string;
  cor: string;
  fonte: string;
  topico: string;
  outroTopico: string;
  fotos: string[];
  feedback: { texto: string; nome: string };
}

export interface ConteudoRecursoVitrine extends ConteudoRecurso {
  /** Nos serviços, o cartão azul da agenda online (o destaque de "O que tem na vitrine"). */
  agenda: { titulo: string; texto: string; itens: string[] } | null;
  loja: LojaExemplo;
}

const GALERIA = '/landing/galeria';

const RECURSOS_COMUNS = (produtos: boolean): ConteudoRecurso['recursos']['itens'] => [
  {
    icone: 'imagem',
    titulo: 'Portfólio por tópicos',
    texto: produtos
      ? 'As fotos separadas por tema, como Bolos de festa e Doces finos. O cliente toca no tópico e vê tudo do assunto.'
      : 'As fotos separadas por serviço, como Esmaltação em gel e Nail art. O cliente toca no tópico e vê tudo do assunto.',
  },
  { icone: 'estrela', titulo: 'Avaliações com estrelas', texto: 'Os elogios dos seus clientes, com a nota média em destaque no topo da página.' },
  { icone: 'local', titulo: 'Como chegar', texto: 'O seu endereço no mapa, com o botão para o cliente traçar a rota até você.' },
  {
    icone: 'relogio',
    titulo: 'Informações à vista',
    texto: produtos
      ? 'Horário de funcionamento, formas de pagamento e entrega ou retirada, com a taxa.'
      : 'Horário de atendimento, formas de pagamento e o endereço, sempre atualizados.',
  },
  { icone: 'sino', titulo: 'Aberto agora', texto: 'O selo mostra se você está atendendo agora e quando abre de novo.' },
  { icone: 'brilho', titulo: 'Com a cara da sua marca', texto: 'Cor de destaque, estilo da cor, fonte, menu, abas e o jeito das fotos: você escolhe tudo.' },
  {
    icone: 'conversa',
    titulo: 'Do clique à conversa',
    texto: produtos
      ? 'O cliente toca numa foto e manda para você no WhatsApp: a conversa já começa com o produto que ele quer.'
      : 'O cliente toca numa foto e manda para você no WhatsApp: a conversa já começa com o trabalho que ele quer.',
  },
  { icone: 'link', titulo: 'Um link para tudo', texto: 'dizai.com/l/sua-loja na bio do Instagram, no status e nas respostas do assistente.' },
];

const PERGUNTAS_COMUNS: [string, string][] = [
  ['Preciso pagar pela vitrine?', 'Não. A vitrine faz parte do DizAI e você pode montar a sua de graça, mesmo sem ligar o assistente.'],
  ['Posso mudar as cores e as fotos depois?', 'Sim, quando quiser. A vitrine se atualiza na hora e o link continua o mesmo.'],
  ['E se eu trocar o nome da loja?', 'O link acompanha o nome novo, e o endereço antigo continua abrindo a sua vitrine.'],
  ['Funciona no celular?', 'A vitrine foi pensada primeiro para o celular, que é onde o seu cliente está.'],
];

const MOTIVOS = { rotulo: 'Por que ter uma vitrine', titulo: ['Uma página com a sua marca', 'vende por você.'] as [string, string],
  apoio: 'O cliente decide se confia no seu negócio nos primeiros segundos. Uma página organizada, com a sua logo e as suas '
    + 'cores, mostra cuidado antes mesmo da primeira mensagem.' };
const O_QUE_TEM = { rotulo: 'O que tem na vitrine', titulo: ['Tudo o que o cliente precisa,', 'em uma página.'] as [string, string] };
const PERGUNTAS = { titulo: 'Sobre a vitrine', apoio: 'O que todo dono de negócio pergunta antes de montar a sua.' };
const FINAL = { titulo: 'A sua vitrine pronta hoje.', texto: 'Monte de graça, coloque o link na bio e mostre o seu trabalho do jeito que ele merece.',
  botao: 'Criar a minha vitrine' };
const FATOS = ['Grátis, mesmo sem ligar o assistente', 'Pronta em poucos minutos', 'Atualiza na hora, pelo celular'];

export const RECURSO_VITRINE: Record<TipoLanding, ConteudoRecursoVitrine> = {
  produtos: {
    tipo: 'produtos',
    landing: { rota: '/vendas', rotulo: 'Para quem vende' },
    tituloPagina: 'Vitrine online para a bio do Instagram | DizAI',
    rotulo: 'Vitrine online',
    fatos: FATOS,
    final: FINAL,
    hero: {
      botao: 'Criar a minha vitrine grátis',
      titulo: 'O seu cliente quer ver',
      grifo: 'antes de pedir.',
      apoio: 'Uma página com a cara do seu negócio, com as fotos dos seus produtos, as avaliações dos clientes e tudo o que '
        + 'ele precisa saber para fazer o pedido. Pronta para a bio do Instagram e para mandar no WhatsApp.',
    },
    motivos: { ...MOTIVOS, itens: [
      ['Mostra que o negócio é sério', 'Logo, cores e fotos organizadas passam confiança antes da primeira mensagem. Quem confia, pede sem pechinchar.'],
      ['Um link para tudo', 'Na bio do Instagram, no status do WhatsApp e na resposta do assistente: o mesmo endereço, sempre atualizado.'],
      ['O cliente chega decidido', 'Ele já viu as fotos, as avaliações e como funciona a entrega. A conversa começa no pedido.'],
    ] },
    recursos: { ...O_QUE_TEM, itens: RECURSOS_COMUNS(true) },
    agenda: null,
    cenas: [
      {
        legenda: 'Você escolhe a cor e a fonte da sua marca',
        cena: 'personalizar',
      },
      {
        legenda: 'Cada tópico vira uma categoria na vitrine',
        cena: 'fotos',
      },
      {
        legenda: 'Digite o CEP e o endereço se completa sozinho',
        cena: 'mapa',
      },
      {
        legenda: 'Os elogios viram avaliações com estrelas',
        cena: 'avaliacoes',
      },
      {
        legenda: 'O link vai na bio do Instagram',
        cena: 'resultado',
        ms: 15000,
      },
    ],
    perguntas: { ...PERGUNTAS, itens: [
      PERGUNTAS_COMUNS[0],
      ['O cliente faz o pedido pela vitrine?', 'Ele vê os produtos e chama no WhatsApp com a foto do que quer. O assistente atende e anota o pedido para você confirmar.'],
      ...PERGUNTAS_COMUNS.slice(1),
    ] },
    loja: {
      nome: 'Pedacinho do Céu',
      slug: 'pedacinho-do-ceu',
      cor: '#A12A63',
      fonte: "'Dancing Script', cursive",
      topico: 'Bolos de festa',
      outroTopico: 'Doces finos',
      fotos: [2, 3, 4, 5, 6].map((n) => `${GALERIA}/bolos/0${n}.webp`),
      feedback: { texto: 'O bolo estava lindo e muito gostoso. Todo mundo elogiou na festa!', nome: 'Juliana' },
    },
  },
  servicos: {
    tipo: 'servicos',
    landing: { rota: '/agendamentos', rotulo: 'Para quem agenda' },
    tituloPagina: 'Vitrine e agenda online | DizAI',
    rotulo: 'Vitrine e agenda online',
    fatos: FATOS,
    final: FINAL,
    hero: {
      botao: 'Criar a minha vitrine grátis',
      titulo: 'O seu cliente quer ver o seu trabalho',
      grifo: 'antes de agendar.',
      apoio: 'Uma página com a cara do seu negócio, com o portfólio, as avaliações e a agenda online com os horários livres. '
        + 'O cliente escolhe o horário sem precisar te chamar.',
    },
    motivos: { ...MOTIVOS, itens: [
      ['Mostra que o negócio é sério', 'Logo, cores e o portfólio organizado passam confiança antes da primeira mensagem. Quem confia, agenda sem pechinchar.'],
      ['Um link para tudo', 'Na bio do Instagram, no status do WhatsApp e na resposta do assistente: o mesmo endereço, sempre atualizado.'],
      ['O cliente chega decidido', 'Ele já viu os trabalhos e os horários livres. A conversa começa no agendamento.'],
    ] },
    recursos: { ...O_QUE_TEM, itens: RECURSOS_COMUNS(false) },
    agenda: {
      titulo: 'A agenda online vem dentro da vitrine',
      texto: 'Na aba Agendar horário o cliente escolhe o serviço, o profissional, o dia e um dos horários livres de verdade. '
        + 'A mensagem chega pronta no seu WhatsApp e, com o agendamento automático ligado, o assistente confere a agenda e confirma.',
      itens: [
        'Aparecem os horários que estão livres, com a duração de cada serviço',
        'Com vários profissionais, o cliente escolhe com quem quer',
        'Dia lotado vira lista de espera, se você quiser',
        'Você também escolhe o estilo das abas Vitrine e Agendar',
      ],
    },
    cenas: [
      {
        legenda: 'Você escolhe a cor e a fonte da sua marca',
        cena: 'personalizar',
      },
      {
        legenda: 'Cada tópico vira uma categoria na vitrine',
        cena: 'fotos',
      },
      {
        legenda: 'Digite o CEP e o endereço se completa sozinho',
        cena: 'mapa',
      },
      {
        legenda: 'Os elogios viram avaliações com estrelas',
        cena: 'avaliacoes',
      },
      {
        legenda: 'O cliente vê os horários livres',
        cena: 'agenda',
      },
      {
        legenda: 'O link vai na bio do Instagram',
        cena: 'resultado',
        ms: 15000,
      },
    ],
    perguntas: { ...PERGUNTAS, itens: [
      PERGUNTAS_COMUNS[0],
      ['O cliente consegue marcar o horário sozinho?', 'Ele escolhe o serviço, o dia e o horário livre, e a mensagem chega pronta no seu WhatsApp. Com o agendamento automático ligado, o assistente confere a agenda e confirma na hora.'],
      ...PERGUNTAS_COMUNS.slice(1),
    ] },
    loja: {
      nome: 'Studio Bella',
      slug: 'studio-bella',
      cor: '#A12A63',
      fonte: "'Dancing Script', cursive",
      topico: 'Esmaltação em gel',
      outroTopico: 'Nail art',
      fotos: [1, 2, 3, 4, 5].map((n) => `${GALERIA}/unhas/0${n}.webp`),
      feedback: { texto: 'Atendimento impecável e o gel durou três semanas!', nome: 'Camila' },
    },
  },
};
