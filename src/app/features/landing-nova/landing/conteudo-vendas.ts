import { ROTA_LANDING } from '../../landing/conteudo-landing';
import { ArtePost, ConteudoLandingNova, EtapaAviso, PERGUNTAS_COMUNS } from './conteudo-landing-nova';

/** Textos e exemplos da landing de vendas (/vendas). Imagens em public/landing (as mesmas da landing antiga). */
const LOGOS = '/landing/galeria/logos';
const BOLOS = '/landing/galeria/bolos';

export const FOTOS = {
  bolo: `${BOLOS}/02.webp`,
  salgados: '/landing/hub/salgados.webp',
  flores: '/landing/hub/flores.webp',
  cortinas: '/landing/galeria/cortinas/01.webp',
  capaPedacinho: '/landing/hub/pedacinho-capa.webp',
  logoPedacinho: `${LOGOS}/pedacinho-do-ceu.jpg`,
  bolos: ['01', '03', '04', '05', '06', '07'].map((n) => `${BOLOS}/${n}.webp`),
};

export type CenaPratica = 'conversa' | 'resumo' | 'confirmar' | 'etapas' | 'numeros';

export const PASSOS_PRATICA: { titulo: string; texto: string; cena: CenaPratica }[] = [
  { titulo: 'Responde o seu cliente', texto: 'Envia o seu catálogo, tira dúvidas e faz orçamentos enquanto você produz.', cena: 'conversa' },
  { titulo: 'Coleta informações do pedido', texto: 'Confere sabores, tamanhos, adicionais e o prazo de preparo, e pergunta o que falta.', cena: 'resumo' },
  {
    titulo: 'Você confirma, do seu jeito',
    texto: 'O assistente apenas coleta o que você definir e o pedido chega anotado. Você assume a conversa, combina o pagamento e confirma o pedido.',
    cena: 'confirmar',
  },
  { titulo: 'Avisa o cliente em cada etapa', texto: 'Pronto, entregue: um toque e a mensagem sai com o nome e o valor.', cena: 'etapas' },
  { titulo: 'Mostra quanto você vendeu', texto: 'Faturamento, os dias que mais vendem e os clientes que mais voltam.', cena: 'numeros' },
];

/** As mensagens automáticas de cada etapa do pedido (as mesmas da tela de Pedidos). */
export const ETAPAS_PRATICA: EtapaAviso[] = [
  { nome: 'Confirmado', mensagem: 'Oi, Ana! Seu pedido foi confirmado 😊 Fica pronto sábado às 15h.' },
  { nome: 'Pronto', mensagem: 'Ana, seu bolo está pronto para retirada! 🎂' },
  { nome: 'Entregue', mensagem: 'Muito obrigada pela confiança! Espero que goste 😊' },
];

export const ETAPAS_PEDIDO: EtapaAviso[] = [
  { nome: 'Confirmado', mensagem: 'Oi, Ana! Seu pedido foi confirmado 😊 Fica pronto sábado às 15h.' },
  { nome: 'Pronto', mensagem: 'Ana, seu pedido está pronto para retirada! Total: R$ 135,00' },
  { nome: 'Entregue', mensagem: 'Obrigada pela preferência, Ana! Volte sempre 💛' },
];

export const RECURSOS_VENDAS = {
  checks: [
    'Faz a triagem e mantém o cliente por perto',
    'Faz orçamentos e coleta os dados do pedido',
    'Você confirma cada pedido e combina o pagamento',
    'Pedidos organizados numa tela própria, do confirmado ao entregue',
    'Ganhe uma página de portfólio',
  ],
  alem: [
    ['Coleta o que o seu produto precisa', 'Sabores, massas, quantidades etc. O assistente confere uma por uma.'],
    ['Dados de fechamento do seu jeito', 'Defina o que deve ser coletado pelo assistente antes de passar para você.'],
    ['Prazo de preparo calculado', 'Pelo seu horário e pelo tempo de cada produto, diz quando fica pronto, sem prometer o impossível.'],
  ],
  barras: [38, 30, 52, 46, 74, 100, 22],
};

export const TABELA_VENDAS: [string, string, string][] = [
  ['Responder "quanto custa?"', 'Você para a produção', 'Responde na hora'],
  ['Mensagem às 23h', 'Responde amanhã', 'Responde e anota'],
  ['Anotar o pedido', 'Papel, print, memória', 'Resumo completo'],
  ['Avisar que está pronto', 'Digita um por um', 'Um toque'],
  ['Saber quanto vendeu', 'Caderno e planilha', 'Painel pronto'],
  ['Postar no Instagram', 'Horas no Canva', 'Menos de 1 minuto'],
];

const ARTES_VENDAS: ArtePost[] = [
  { loja: 'Rei dos Salgados', titulo: 'Cento a R$ 85 neste fim de semana', botao: 'Peça pelo WhatsApp', foto: FOTOS.salgados, estilo: 'amarelo' },
  { loja: 'Pedacinho do Céu', titulo: 'Encomendas abertas para o Dia das Crianças', botao: 'Garanta o seu', foto: FOTOS.bolo, estilo: 'claro' },
  { loja: 'Ateliê das Flores', titulo: 'Buquês para entrega hoje', botao: 'Pedidos até 16h', foto: FOTOS.flores, estilo: 'escuro' },
];

export const CONTEUDO_VENDAS: ConteudoLandingNova = {
  tipo: 'produtos',
  tituloPagina: 'DizAI para quem vende pelo WhatsApp: orçamentos e pedidos anotados',
  rota: ROTA_LANDING.produtos,
  outra: { rota: ROTA_LANDING.servicos, rotulo: 'Para quem agenda' },
  rotuloRecursos: 'Recursos',
  hero: {
    descricao:
      'O DizAI responde os seus clientes no WhatsApp na hora: envia o catálogo, faz o orçamento e anota o pedido. Você apenas confirma.',
    garantias: ['No seu número de sempre', 'Você confirma cada pedido', 'Pronto em poucos minutos'],
    conversas: [
      {
        chave: 'doces',
        rotulo: 'Doces e bolos',
        loja: 'Pedacinho do Céu',
        logo: FOTOS.logoPedacinho,
        aviso: ['Pedido anotado', 'Bolo M · sábado, 15:00'],
        msgs: [
          ['c', 'Oi! Vocês fazem bolo de aniversário?'],
          ['l', 'Fazemos sim! Te mando o cardápio com os sabores e os tamanhos 🎂'],
          ['a', 'Cardápio Pedacinho do Céu.pdf'],
          ['c', 'Quanto fica o de 20 pessoas?'],
          ['l', 'O bolo M serve 20 pessoas e fica R$ 150. Para qual dia seria?'],
          ['c', 'Sábado, para retirar às 15h'],
          ['l', 'Anotado! Qual recheio você prefere: ninho com morango, brigadeiro ou doce de leite?'],
        ],
      },
      {
        chave: 'salgados',
        rotulo: 'Salgados',
        loja: 'Rei dos Salgados',
        logo: `${LOGOS}/rei-dos-salgados.svg`,
        aviso: ['Pedido anotado', '100 salgados · sábado'],
        msgs: [
          ['c', 'Quanto custa o cento de salgados?'],
          ['l', 'O cento sai a R$ 85: coxinha, risole, bolinha de queijo e kibe. Para quando seria?'],
          ['c', 'Sábado de manhã. Quero 50 coxinhas e 50 risoles'],
          ['l', 'Fica R$ 85 o cento. Vai retirar ou prefere entrega?'],
          ['c', 'Vou retirar, me chamo Carlos'],
          ['l', 'Anotado, Carlos! O seu pedido foi para a confirmação.'],
        ],
      },
      {
        chave: 'presentes',
        rotulo: 'Presentes',
        loja: 'Ateliê das Flores',
        logo: `${LOGOS}/atelie-das-flores.svg`,
        aviso: ['Pedido anotado', 'Buquê de rosas · hoje'],
        msgs: [
          ['c', 'Vocês fazem buquê para entrega hoje?'],
          ['l', 'Fazemos! Para hoje, pedidos até as 16h. Te mando as opções 💐'],
          ['a', 'Buquês Ateliê das Flores.pdf'],
          ['c', 'Quero o de rosas vermelhas, entrega no Centro'],
          ['l', 'O buquê de 12 rosas fica R$ 120, mais R$ 10 da entrega no Centro. Para qual nome vai o cartão?'],
        ],
      },
    ],
  },
  negocios: [
    'Confeitaria', 'Bolos e tortas', 'Doces finos', 'Salgados para festa', 'Lanches', 'Cestas e presentes',
    'Floricultura', 'Papelaria personalizada', 'Camisetas e estampas', 'Encomendas em geral',
  ],
  dores: {
    titulo: ['Você trabalha,', 'o WhatsApp não espera.'],
    itens: [
      {
        titulo: 'Encomenda que espera vai para outra loja',
        texto: 'Com a mão na massa, a mensagem fica sem resposta e o cliente compra no concorrente.',
        citacao: '"Faz bolo para sábado?" · enviada há 2 h',
      },
      {
        titulo: 'As mesmas perguntas, o dia inteiro',
        texto: 'Preço, sabores, tamanhos, prazo e entrega: horas respondendo o que já está decidido.',
        citacao: '"Quanto fica o cento?" "Tem de ninho?" "Entrega no meu bairro?"',
      },
      {
        titulo: 'Produzir ou responder?',
        texto: 'Parar a produção a cada notificação atrasa as entregas. Ignorar o celular perde venda.',
        citacao: '"Ainda dá para encomendar?" · chegou no meio da produção',
      },
    ],
  },
  bloqueio: {
    contador: '12 mensagens esperando',
    avisos: [
      { nome: 'Ana Souza', cor: '#B4466A', texto: 'Faz bolo para sábado? É para 20 pessoas', quando: 'há 2 h' },
      { nome: 'Carlos Lima', cor: '#D9822B', texto: 'Quanto fica o cento de coxinha?', quando: 'há 1 h' },
      { nome: 'Júlia Reis', cor: '#3F7D58', texto: 'Tem de ninho com morango?', quando: 'há 40 min' },
      { nome: 'Pedro Alves', cor: '#2F5FA8', texto: 'Vocês entregam no Centro?', quando: 'há 15 min' },
      { nome: 'Marina Costa', cor: '#7A4FB5', texto: 'Oi? Ainda dá para encomendar?', quando: 'agora' },
    ],
  },
  prova: {
    loja: 'Pedacinho do Céu',
    logo: FOTOS.logoPedacinho,
    objetivo: 'fechar a venda',
    sem: [
      ['c', 'Boa tarde! Vocês fazem bolo de aniversário para sábado?', '15:16'],
      ['t', '22 minutos depois', ''],
      ['c', 'Quanto fica um para 20 pessoas?', '15:38'],
      ['t', '40 minutos depois', ''],
      ['c', '??', '16:18'],
    ],
    com: [
      ['c', 'Boa tarde! Vocês fazem bolo de aniversário para sábado?', '15:16'],
      ['l', 'Fazemos sim! O bolo M serve 20 pessoas e fica R$ 150. Te mando o cardápio de sabores.', '15:16'],
      ['c', 'Perfeito, quero o de ninho com morango', '15:17'],
      ['l', 'Anotado! A Camila vai confirmar o seu pedido em instantes.', '15:17'],
    ],
    fimSem: 'Comprou em outra loja',
    fimCom: 'Pedido anotado em 2 minutos',
  },
  como: {
    cadastro: ['Cadastre os seus produtos e informações', 'Preços, opções, tamanhos, sabores, prazos e muito mais.'],
    atende: ['Ele atende por você', 'Mantém o cliente por perto desde o primeiro minuto, até você aparecer para confirmar o pedido.'],
    selo: '✓ Respondido em segundos',
    slides: [
      {
        produto: 'Bolo M · 20 pessoas', preco: 'R$ 150', opcao: 'Recheios', regra: 'O cliente escolhe até 2',
        valores: ['Morango', 'Ninho', 'Chocolate', 'Nutella'], extra: ['Prazo de preparo', '48 h'],
        pergunta: 'Quais são os sabores disponíveis?',
        resposta: 'Temos morango, ninho, chocolate e nutella 😊 Você pode escolher até 2!',
      },
      {
        produto: 'Cento de salgados', preco: 'R$ 85', opcao: 'Sabores', regra: 'O cliente escolhe quantos quiser',
        valores: ['Coxinha', 'Risole', 'Kibe', 'Bolinha de queijo'], extra: ['Pedido mínimo', '50 un.'],
        pergunta: 'Quais sabores de salgado vocês têm?',
        resposta: 'Temos coxinha, risole, kibe e bolinha de queijo 😋 Pode misturar como quiser!',
      },
      {
        produto: 'Buquê de rosas', preco: 'a partir de R$ 120', opcao: 'Tipo de rosa', regra: 'O cliente escolhe 1',
        valores: ['Vermelha', 'Branca', 'Champanhe', 'Colombiana'], extra: ['Prazo de preparo', '3 h'],
        pergunta: 'Quais rosas vocês têm para o buquê?',
        resposta: 'Temos vermelha, branca, champanhe e colombiana 🌹 Qual você prefere?',
      },
    ],
  },
  dia: [
    { momento: 'Pergunta de madrugada', titulo: 'Responde em segundos, 24 horas', texto: 'De madrugada, no domingo ou com as mãos ocupadas.', visual: 'conversa', conversa: ['Vocês abrem amanhã?', 'Abrimos sim, das 9h às 19h!'] },
    { momento: 'Chegou um áudio', titulo: 'Entende os áudios', texto: 'O cliente manda voz, ele entende e responde por escrito.', visual: 'audio' },
    { momento: 'Pediram o cardápio', titulo: 'Envia o seu catálogo', texto: 'Cardápio, tabela de preços ou portfólio, em PDF ou imagem.', visual: 'arquivo', detalhe: 'Cardápio de novembro.pdf' },
    { momento: 'Uma pergunta difícil', titulo: 'Não inventa: te chama', texto: 'Se não souber, avisa você no celular. Depois, ele aprende a resposta.', visual: 'chama', detalhe: '"Fazem sem lactose?"' },
    { momento: 'Você quis responder', titulo: 'Você assume quando quiser', texto: 'Respondeu pelo celular? Ele sai daquela conversa na hora.', visual: 'chave' },
    { momento: 'Do jeito da sua loja', titulo: 'Fala do seu jeito', texto: 'Saudação, regras e jeito de falar definidos por você.', visual: 'jeito' },
    { momento: 'Hora de divulgar', titulo: 'Posts prontos para o Instagram', texto: 'Com a sua logo, as suas fotos e os seus preços.', visual: 'posts' },
    { momento: 'Fim do dia', titulo: 'Seus números, prontos', texto: 'Quanto faturou, os melhores dias e os clientes que mais voltam.', visual: 'numeros', detalhe: 'R$ 4.820' },
  ],
  vitrine: {
    texto: 'O link para a bio do Instagram e para mandar no WhatsApp. O cliente vê os seus trabalhos, as avaliações e o horário, e já faz a encomenda.',
    itens: [
      'Portfólio com as fotos separadas por tema',
      'Avaliações dos clientes, com estrelas',
      'Horário, pagamento e entrega à vista',
      'Endereço com mapa e o botão do WhatsApp',
    ],
    textoPosts: 'Escolha o que divulgar e receba as artes prontas para o feed e o story, com a legenda escrita.',
    diferenciais: [
      ['Com a sua identidade', 'A sua logo, as suas cores, as suas fotos e a fonte da sua vitrine.'],
      ['Com os seus dados de verdade', 'Preços, cardápio e encomendas abertas, tirados do seu cadastro.'],
      ['Legenda pronta', 'Título, chamada e hashtags. É baixar e postar.'],
    ],
    artes: ARTES_VENDAS,
  },
  confianca: [
    ['O seu negócio sob controle', 'O DizAI não confirma pedidos, não pede pagamentos e nem promete entregas.'],
    ['O pagamento continua com você', 'Ele não cobra nem recebe nada. Você combina Pix, cartão ou na entrega.'],
    ['Assume quando quiser', 'Respondeu pelo celular? Ele sai daquela conversa na hora.'],
    ['Não inventa respostas', 'Se não souber, responde "vou confirmar" e te chama.'],
    ['Contatos pessoais ficam de fora', 'Você pode definir os contatos que o assistente não deve responder.'],
    ['Liga e desliga quando quiser', 'No seu número de sempre, sem trocar de chip nem de aplicativo.'],
  ],
  ramos: [
    {
      titulo: 'Doces, bolos e salgados',
      quem: 'Confeitaria, bolos, doces finos, salgados, lanches',
      fotos: [FOTOS.bolo, FOTOS.salgados],
      faz: ['Orçamento com os seus preços, até por quantidade', 'Confere pedido mínimo e antecedência', 'Anota sabores, tamanho, data e entrega'],
    },
    {
      titulo: 'Personalizados e presentes',
      quem: 'Cestas, floricultura, papelaria, estampas',
      fotos: [FOTOS.flores],
      faz: ['Explica modelos e o que muda o valor', 'Mostra as fotos dos seus trabalhos', 'Coleta os detalhes para você confirmar'],
    },
    {
      titulo: 'Lojas e revenda',
      quem: 'Roupas, cosméticos, acessórios, casa',
      fotos: [FOTOS.cortinas],
      faz: ['Responde tamanhos, cores e disponibilidade', 'Envia o seu catálogo na conversa', 'Segue as suas regras de troca e envio'],
    },
  ],
  perguntas: [
    ['Vou perder o controle dos meus pedidos?', 'Não. O assistente faz a triagem: tira dúvidas, faz o orçamento e anota o pedido. Quem confirma, combina o pagamento e decide é sempre você.'],
    ['Ele recebe pagamento ou fecha a venda sozinho?', 'Não. Ele anota o pedido e te entrega o resumo com o total. Você confirma e recebe do seu jeito: Pix, cartão ou na entrega.'],
    ['Ele respeita o meu prazo de preparo e o pedido mínimo?', 'Sim. Ele confere a antecedência de cada produto, os dias e horários em que você trabalha e as regras que você escrever.'],
    ...PERGUNTAS_COMUNS,
  ],
  final: {
    titulo: 'Deixe o DizAI atender enquanto você produz.',
    texto: 'Cadastre os seus produtos em poucos minutos e veja o assistente anotando um pedido de verdade.',
  },
};
