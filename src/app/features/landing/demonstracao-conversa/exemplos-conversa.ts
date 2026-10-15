/** Conversas de exemplo exibidas no celular da landing page, uma por tipo de negócio. */

export interface AlbumNaConversa {
  titulo: string;
  link: string;
  cores: string[];
}

export interface MensagemExemplo {
  /** "cliente" aparece à direita (verde), "loja" à esquerda (branca), como no WhatsApp do cliente. */
  autor: 'cliente' | 'loja';
  horario: string;
  texto?: string;
  album?: AlbumNaConversa;
}

export interface ExemploConversa {
  id: string;
  ramo: string;
  nomeLoja: string;
  corAvatar: string;
  mensagens: MensagemExemplo[];
}

export const EXEMPLOS_CONVERSA: ExemploConversa[] = [
  {
    id: 'estudio-unhas',
    ramo: 'Estúdio de unhas',
    nomeLoja: 'Bella Studio',
    corAvatar: '#E9D7D1',
    mensagens: [
      { autor: 'cliente', horario: '09:41', texto: 'Oi! Boa tarde!' },
      { autor: 'cliente', horario: '09:41', texto: 'Você trabalha com unha em gel?' },
      {
        autor: 'loja',
        horario: '09:41',
        texto: 'Olá! Seja bem vinda ao Bella Studio 💅\nTrabalhamos sim!\nQuer ver alguns trabalhos feitos?',
      },
      { autor: 'cliente', horario: '09:42', texto: 'Quero!' },
      {
        autor: 'loja',
        horario: '09:42',
        album: { titulo: 'Unhas em gel · Bella Studio', link: 'dizai.com/bella-studio', cores: ['#d9c4bd', '#e8dcd8', '#cdb6ae'] },
      },
      { autor: 'cliente', horario: '09:43', texto: 'Lindas!' },
      { autor: 'cliente', horario: '09:43', texto: 'Tem horário no sabado às 9h?' },
      { autor: 'loja', horario: '09:43', texto: 'Vou consultar, 1 minuto!' },
    ],
  },
  {
    id: 'doceria',
    ramo: 'Doceria',
    nomeLoja: 'Doce Encanto',
    corAvatar: '#F3E6CC',
    mensagens: [
      { autor: 'cliente', horario: '14:10', texto: 'Boa tarde! Você faz torta para 20 pessoas?' },
      {
        autor: 'loja',
        horario: '14:10',
        texto: 'Boa tarde! Que bom ter você aqui na Doce Encanto 🍰\nFazemos sim! A torta para 20 pessoas sai por R$ 140.\n Recheios: \n • Brigadeiro Branco \n • Brigadeiro Preto \n • Crocante \n • Doce de leite \n\n Massa branca, preta ou mista.',
      },
      { autor: 'cliente', horario: '14:12', texto: 'Show, me manda algumas fotos' },
      {
        autor: 'loja',
        horario: '14:13',
        album: { titulo: 'Tortas - Doce encanto', link: 'dizai.com/doce-encanto', cores: ['#d9bdca', '#d8dce8', '#aecdb2'] },
      }
    ],
  },
  {
    id: 'eletricista',
    ramo: 'Eletricista',
    nomeLoja: 'Luz & Cia',
    corAvatar: '#DCE6F7',
    mensagens: [
      { autor: 'cliente', horario: '07:58', texto: 'Bom dia! Vocês fazem projeto de iluminação para casa?' },
      {
        autor: 'loja',
        horario: '07:58',
        texto: 'Bom dia!⚡\nFazemos sim! Montamos projetos do zero, pensados para cada ambiente.\nÉ para algum cômodo específico?',
      },
      { autor: 'cliente', horario: '08:00', texto: 'Sala e cozinha. Quero deixar mais aconchegante' },
      {
        autor: 'loja',
        horario: '08:00',
        texto: 'Ótima escolha! Na sala costuma ficar lindo com luz indireta no teto, e na cozinha com LED embaixo dos armários.',
      },
      { autor: 'cliente', horario: '08:02', texto: 'Vocês fazem orçamento? Precisa de visita?' },
      {
        autor: 'loja',
        horario: '08:02',
        texto: 'Fazemos sim, a visita técnica e o orçamento são gratuitos 😊\nQual o melhor dia e horário para você?',
      },
    ],
  },
  {
    id: 'cortinas',
    ramo: 'Loja de cortinas',
    nomeLoja: 'Casa & Cortina',
    corAvatar: '#EDE4F3',
    mensagens: [
      { autor: 'cliente', horario: '15:30', texto: 'Boa tarde! Queria ver cortinas que deixam o quarto bem escuro' },
      {
        autor: 'loja',
        horario: '15:30',
        texto: 'Boa tarde! Que bom ter você aqui na Casa & Cortina 🪟\nPara isso, a ideal é a blackout: ela bloqueia quase toda a luz e ainda ajuda a manter o quarto fresco.\nTemos em tecido e em rolô, em várias cores.',
      },
      { autor: 'cliente', horario: '15:32', texto: 'Gostei do rolô! Vocês fazem visita para medir?' },
      {
        autor: 'loja',
        horario: '15:32',
        texto: 'Fazemos sim, a medição é sem custo e já levamos as amostras de cor.\nMe passa o seu endereço com bairro, por favor?',
      },
      { autor: 'cliente', horario: '15:34', texto: 'Rua do brasil, 120, Catolé' },
      { autor: 'loja', horario: '15:34', texto: 'Perfeito! Vou ver os horários disponíveis, 1 minuto!' },
    ],
  },
  {
    id: 'loja-roupas',
    ramo: 'Loja de roupas',
    nomeLoja: 'Moda Leve',
    corAvatar: '#DDEBDF',
    mensagens: [
      { autor: 'cliente', horario: '19:20', texto: 'Oi! O vestido floral midi ainda tem no M?' },
      {
        autor: 'loja',
        horario: '19:20',
        texto: 'Oi! Que bom ter você aqui na Moda Leve 👗\nTemos sim, no M e no G, nas cores azul e verde. Ele custa R$ 129.\nQuer ver as fotos dele?',
      },
      { autor: 'cliente', horario: '19:21', texto: 'Quero!' },
      {
        autor: 'loja',
        horario: '19:21',
        album: { titulo: 'Vestidos · Moda Leve', link: 'dizai.com/moda-leve', cores: ['#b9cbe0', '#cfe0cf', '#e8e0d4'] },
      },
      { autor: 'cliente', horario: '19:23', texto: 'Amei o azul! Dá para entregar hoje?' },
      { autor: 'loja', horario: '19:23', texto: 'Vou verificar se sai hoje, 1 minuto!' },
    ],
  },
];
