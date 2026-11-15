import { ROTA_LANDING } from '../../landing/conteudo-landing';
import { ConteudoLandingNova, EtapaAviso, PERGUNTAS_COMUNS } from './conteudo-landing-nova';

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
  { titulo: 'Responde o seu cliente', texto: 'Uma triagem inicial: envia o seu catálogo, tira dúvidas e faz orçamentos nos primeiros minutos. Sem dar chances para o cliente perguntar em outra loja.', cena: 'conversa' },
  { titulo: 'Coleta informações do pedido', texto: 'Confere sabores, tamanhos, prazo de preparo e tudo que o seu tipo de produto precisar. Te entrega o atendimento resumido.', cena: 'resumo' },
  {
    titulo: 'Você confirma, do seu jeito',
    texto: 'O assistente apenas coleta o que você definir e o pedido chega resumido. Ele não confirma pedidos e nem pede pagamentos. Você assume a conversa e finaliza do seu jeito.',
    cena: 'confirmar',
  },
  { titulo: 'Avisa o cliente em cada etapa', texto: 'Um gestor de pedidos com avisos automáticos.\nPronto ou entregue: um toque e a mensagem personalizada por você é enviada.', cena: 'etapas' },
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
    'Utilize o assistente para coletar pedidos ou cadastre manualmente',
    'Receba uma página de portfólio com a sua cara',
    'Gestor de pedidos para organizar o seu negócio e otimizar o seu tempo',
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

export const CONTEUDO_VENDAS: ConteudoLandingNova = {
  tipo: 'produtos',
  tituloPagina: 'DizAI para quem vende pelo WhatsApp: orçamentos e pedidos anotados',
  rota: ROTA_LANDING.produtos,
  outra: { rota: ROTA_LANDING.servicos, rotulo: 'Para quem agenda' },
  rotuloRecursos: 'Recursos',
  hero: {
    descricao:
      'Uma solução completa para as suas vendas: do atendimento com IA no WhatsApp à gestão de pedidos, com análise financeira e ferramentas de marketing.',
    garantias: ['No seu número de sempre', 'Pronto em poucos minutos', 'Recursos com ou sem o assistente', 'Todos os tipos de negócio'],
    conversas: [
      {
        chave: 'doces',
        rotulo: 'Doces e bolos',
        loja: 'Pedacinho do Céu',
        logo: FOTOS.logoPedacinho,
        aviso: ['Pedido anotado', 'Bolo M · sábado, 15:00'],
        dono: 'Camila',
        msgs: [
          ['c', 'Oi! Vocês fazem bolo de aniversário?'],
          ['l', 'Olá, Fazemos sim! 😊 Te mando o cardápio com os sabores e os tamanhos.'],
          ['a', 'Cardápio Pedacinho do Céu.pdf'],
          ['c', 'Quanto fica o de 20 pessoas?'],
          ['l', 'O bolo M serve 20 pessoas e fica R$ 150. Para qual dia seria?'],
          ['c', 'Sábado, para retirar às 15h'],
          ['l', 'Anotado! Qual recheio você prefere: ninho com morango, brigadeiro ou doce de leite?'],
          ['c', 'Ninho com morango e massa de chocolate'],
          ['l', 'Ótimo! Qual o seu nome?'],
          ['c', 'Ana'],
          ['l', 'Perfeito, Ana! A Camila vai confirmar o seu pedido.'],
          ['t', 'Pedido para você confirmar|Bolo M · sábado, 15:00'],
          ['d', 'Oii, Preciso de um sinal de 50% para confirmar o pedido 😊'],
          ['c', 'Pronto, enviei o Pix!'],
          ['d', 'Recebido! Pedido confirmado 💕'],
          ['x', 'Sábado'],
          ['t', 'Pedido ficou pronto|Mensagem automática'],
          ['m', 'Boas notícias Ana, seu bolo está pronto para retirada! 🎂'],
          ['c', 'OK, estou indo buscar'],
          ['t', 'Pedido entregue|Mensagem automática'],
          ['m', 'Muito obrigada pela confiança!  Boa comemoração e espero que goste 😊'],
        ],
      },
      {
        chave: 'salgados',
        rotulo: 'Salgados',
        loja: 'Rei dos Salgados',
        logo: `${LOGOS}/rei-dos-salgados.svg`,
        aviso: ['Pedido anotado', '100 salgados · sábado'],
        dono: 'Rosa',
        msgs: [
          ['c', 'Quanto custa o cento de salgados?'],
          ['l', 'O cento sai a R$ 85! Te mando o nosso cardápio com os sabores:'],
          ['i', 'Cardápio de salgados|Coxinha · Risole · Kibe · Bolinha de queijo · Enroladinho|Cento R$ 85,00'],
          ['l', 'Para quando seria?'],
          ['c', 'Sábado de manhã. Quero 50 coxinhas e 50 risoles'],
          ['l', 'Combinado! Vai retirar ou prefere entrega?'],
          ['c', 'Vou retirar às 10h, me chamo Carlos'],
          ['l', 'Perfeito, Carlos! A Rosa vai confirmar o seu pedido.'],
          ['t', 'Pedido para você confirmar|100 salgados · sábado'],
          ['d', 'Oi, Carlos! Pedido confirmado. Pode pagar na retirada 😊'],
          ['x', 'Sábado'],
          ['t', 'Pedido ficou pronto|Mensagem automática'],
          ['m', 'Carlos, os seus salgados estão prontos para retirada!'],
          ['c', 'OK, estou indo buscar'],
          ['t', 'Pedido entregue|Mensagem automática'],
          ['m', 'Obrigado pela preferência, Carlos! Volte sempre 💛'],
        ],
      },
      {
        chave: 'presentes',
        rotulo: 'Presentes',
        loja: 'Ateliê das Flores',
        logo: `${LOGOS}/atelie-das-flores.svg`,
        aviso: ['Pedido anotado', 'Buquê de rosas · hoje'],
        dono: 'Marta',
        msgs: [
          ['c', 'Vocês fazem buquê para entrega hoje?'],
          ['l', 'Fazemos! Para hoje, pedidos até as 16h. Te mando as opções 💐'],
          ['a', 'Buquês Ateliê das Flores.pdf'],
          ['c', 'Quero o de rosas vermelhas, entrega no Centro'],
          ['l', 'O buquê de 12 rosas fica R$ 120, mais R$ 10 da entrega no Centro. Para qual nome vai o cartão?'],
          ['c', 'Para Júlia. O endereço é Rua das Acácias, 120'],
          ['l', 'Perfeito! A Marta vai confirmar o seu pedido.'],
          ['t', 'Pedido para você confirmar|Buquê de rosas · hoje'],
          ['d', 'Oi! Aqui é a Marta 💐 Pedido confirmado, o buquê sai para entrega às 15h.'],
          ['t', 'Pedido ficou pronto|Mensagem automática'],
          ['m', 'O seu buquê está pronto e já vai sair para entrega!'],
          ['t', 'Pedido entregue|Mensagem automática'],
          ['m', 'Buquê entregue! Obrigada pela preferência 💐'],
        ],
      },
    ],
  },
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
        texto: 'Preço, sabores, tamanhos, prazo e entrega: horas parando de produzir para responder o que já está decidido.',
        citacao: '"Quanto fica o cento?" "Tem de ninho?" "Entrega no meu bairro?"',
      },
      {
        titulo: 'Pedidos desorganizados',
        texto: 'Pedido anotado no caderno ou perdido entre as conversas, e minutos procurando o número de cada cliente.',
        citacao: '"Moça, o meu pedido de sábado ficou anotado?"',
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
    exemplos: [
      {
        loja: 'Rei dos Salgados',
        logo: `${LOGOS}/rei-dos-salgados.svg`,
        sem: [
          ['t', 'De madrugada', ''],
          ['c', 'Boa noite! Quais opções de salgados vocês têm? Queria 100 para sábado', '02:14'],
          ['t', 'No outro dia de manhã', ''],
          ['l', 'Bom dia! Temos coxinha, risole, kibe e bolinha de queijo. O cento sai a R$ 85. Para que horas seria?', '08:12'],
        ],
        com: [
          ['t', 'De madrugada', ''],
          ['c', 'Boa noite! Quais opções de salgados vocês têm? Queria 100 para sábado', '02:14'],
          ['l', 'Boa noite! Temos coxinha, risole, kibe e bolinha de queijo, e o cento sai a R$ 85. Te mando o cardápio.', '02:14'],
          ['c', 'Quero 50 coxinhas e 50 risoles, para retirar às 10h', '02:15'],
          ['l', 'Anotado! Estamos fechados agora, mas às 8:00 a Rosa confirma o seu pedido.', '02:15'],
          ['t', 'No outro dia de manhã', ''],
          ['l', 'Bom dia, posso confirmar os seus salgados?', '08:00'],
          ['c', 'Pode sim!', '08:02'],
        ],
        fimSem: 'Outra loja respondeu primeiro',
        fimCom: 'Pedido confirmado às 8:00',
      },
      {
        loja: 'Ateliê das Flores',
        logo: `${LOGOS}/atelie-das-flores.svg`,
        sem: [
          ['c', 'Oi! Vocês fazem buquê para entrega hoje?', '11:05'],
          ['t', '30 minutos depois', ''],
          ['c', 'É para o aniversário da minha namorada', '11:35'],
          ['t', '45 minutos depois', ''],
          ['c', 'Deixa, já resolvi', '12:20'],
        ],
        com: [
          ['c', 'Oi! Vocês fazem buquê para entrega hoje?', '11:05'],
          ['l', 'Fazemos! Para hoje, pedidos até as 16h. Te mando as opções de buquê 💐', '11:05'],
          ['c', 'Quero o de 12 rosas vermelhas', '11:06'],
          ['l', 'Ótima escolha! A Marta vai confirmar o seu pedido em instantes.', '11:06'],
        ],
        fimSem: 'Comprou em outra loja',
        fimCom: 'Pedido anotado em 1 minuto',
      },
      {
        loja: 'Pedacinho do Céu',
        logo: FOTOS.logoPedacinho,
        sem: [
          ['c', 'Boa tarde! Vocês fazem ovo de Páscoa recheado?', '15:16'],
          ['t', '22 minutos depois', ''],
          ['c', 'Quanto fica o de 500 g?', '15:38'],
          ['t', '40 minutos depois', ''],
          ['c', '??', '16:18'],
        ],
        com: [
          ['c', 'Boa tarde! Vocês fazem ovo de Páscoa recheado?', '15:16'],
          ['l', 'Fazemos sim! O de 500 g fica R$ 89,90. Te mando o cardápio com os recheios 🐣', '15:16'],
          ['c', 'Quero o de ninho com morango', '15:17'],
          ['l', 'Anotado! A Camila vai confirmar o seu pedido em instantes.', '15:17'],
        ],
        fimSem: 'Comprou em outra loja',
        fimCom: 'Pedido anotado em 2 minutos',
      },
    ],
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
  ],
  semAssistente:
    'Sem problemas, todos os recursos da plataforma podem ser utilizados sem ele. Você cadastra os pedidos manualmente para organizar as suas vendas e utiliza todo o resto normalmente.',
  vitrine: {
    texto: 'O link para a bio do Instagram e para mandar no WhatsApp. O cliente vê os seus trabalhos, as avaliações e o horário, e já faz a encomenda.',
    itens: [
      'Portfólio com as fotos do seu trabalho',
      'Avaliações dos clientes, endereço no Maps e informações gerais',
      'Você define cores, estilo, tipo de fonte e muito mais',
    ],
    textoPosts: 'Escolha o que divulgar e receba as artes prontas para o feed e o story, com a legenda escrita.',
    diferenciais: [
      ['Com a sua identidade', 'A sua logo, as suas cores, as suas fotos e a fonte da sua vitrine.'],
      ['Com os seus dados de verdade', 'Preços, cardápio e encomendas abertas, tirados do seu cadastro.'],
      ['Legenda pronta', 'Título, chamada e hashtags. É baixar e postar.'],
    ],
  },
  confiancaCabeca: { rotulo: 'Por que o DizAI', titulo: ['Tudo o que o seu negócio precisa.', 'Em um lugar só.'] },
  confianca: [
    ['Atendimento 24 horas', 'Com o assistente ativado, o seu cliente recebe atendimento de qualidade em poucos segundos, a qualquer hora.'],
    ['Pedidos organizados', 'Cada pedido detalhado na palma da sua mão, com o status de produção e acesso rápido ao cliente.'],
    ['Gestão financeira inteligente', 'Faturamento, dias mais movimentados, produtos mais pedidos e muito mais, na palma da sua mão.'],
    ['Posts rápidos', 'Em menos de 1 minuto você gera um post profissional para movimentar as suas redes.'],
    ['Atração de clientes', 'Crie campanhas em massa para enviar aos seus clientes nas datas mais importantes.'],
    ['Site profissional', 'Uma página profissional para colocar na bio do Instagram.'],
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
    ['Preciso usar o assistente de IA?', 'Não. Você pode desligar o assistente quando quiser e responder os clientes você mesmo. A gestão continua funcionando: a tela de pedidos, os avisos de status, os números, a vitrine, os posts e as campanhas.'],
    ['Ele recebe pagamento ou fecha a venda sozinho?', 'Não. Ele anota o pedido e te entrega o resumo com o total. Você confirma e recebe do seu jeito: Pix, cartão ou na entrega.'],
    ['Ele respeita o meu prazo de preparo e o pedido mínimo?', 'Sim. Ele confere a antecedência de cada produto, os dias e horários em que você trabalha e as regras que você escrever.'],
    ...PERGUNTAS_COMUNS,
  ],
  final: {
    titulo: 'Deixe o DizAI atender enquanto você produz.',
    texto: 'Cadastre os seus produtos em poucos minutos e veja o assistente anotando um pedido de verdade.',
  },
};
