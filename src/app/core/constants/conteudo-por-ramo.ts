import { NovaPerguntaFrequente } from '../models/pergunta-frequente.model';
import { RamoNegocio } from '../models/perfil.model';

/**
 * Exemplos, placeholders e sugestões do painel, adaptados ao ramo escolhido no cadastro.
 * A ideia é que o lojista se veja no sistema desde o primeiro acesso.
 *
 * Textos entre colchetes, como [2 dias], marcam o que o lojista deve ajustar
 * quando usar uma sugestão como modelo.
 */
export interface ConteudoRamo {
  /** Como o ramo chama o que vende: "serviço", "produto"... (minúsculo, singular). */
  termoItem: string;
  /** Título da seção, ex.: "Serviços". */
  tituloItens: string;
  /** "Novo serviço", "Novo produto"... */
  tituloNovoItem: string;

  produto: {
    nome: string;
    categoria: string;
    descricao: string;
    nomeOpcao: string;
    valoresOpcao: string;
    /** Exemplo curto na dica do campo de opções, ex.: "Recheio → brigadeiro, ninho". */
    exemploOpcoes: string;
  };
  /** Exemplo de item do ramo, citado no tour do painel. */
  exemploProduto: string;
  /** Exemplos usados na janela de dicas da tela de produtos. */
  dicasProdutos: { exemploVariacao: string; exemploSemPreco: string };

  pergunta: { pergunta: string; resposta: string };
  perguntasSugeridas: NovaPerguntaFrequente[];

  /** Emoji do placeholder da saudação (o nome da loja entra junto). */
  emojiSaudacao: string;
  camposPedido: string;
  instrucoes: string;
  /** Regras comuns do ramo, que o lojista adiciona com um toque. */
  instrucoesSugeridas: string[];

  topico: { nome: string; descricao: string };
  topicosSugeridos: string[];
}

export const CONTEUDO_POR_RAMO: Record<RamoNegocio, ConteudoRamo> = {
  SERVICOS_PRESENCIAIS: {
    termoItem: 'serviço',
    tituloItens: 'Serviços',
    tituloNovoItem: 'Novo serviço',
    produto: {
      nome: 'Ex.: Esmaltação em gel',
      categoria: 'Nome da categoria, ex.: Unhas',
      descricao: 'Ex.: Duração de até 21 dias. O atendimento leva cerca de 1h30 e é somente com horário marcado.',
      nomeOpcao: 'Nome (ex.: Formato)',
      valoresOpcao: 'Ex.: Amendoado, quadrado, bailarina',
      exemploOpcoes: 'Formato → amendoado, quadrado, bailarina',
    },
    exemploProduto: 'Esmaltação em gel',
    dicasProdutos: {
      exemploVariacao: 'Ex.: "Banho e tosa porte pequeno" e "Banho e tosa porte grande".',
      exemploSemPreco: 'Procedimentos que dependem de avaliação ficam sem preço: o assistente explica que o valor sai depois de você ver o caso.',
    },
    pergunta: {
      pergunta: 'Ex.: Vocês atendem aos sábados?',
      resposta: 'Ex.: Atendemos sim! No sábado, das 8h às 12h, sempre com horário marcado.',
    },
    perguntasSugeridas: [
      {
        pergunta: 'Qual o horário de atendimento?',
        resposta: 'Atendemos [de terça a sábado, das 9h às 18h], sempre com horário marcado.',
      },
      {
        pergunta: 'Quanto tempo dura o atendimento?',
        resposta: 'Depende do serviço: [a esmaltação leva cerca de 1h e o alongamento, 2h30].',
      },
      {
        pergunta: 'Preciso pagar sinal para agendar?',
        resposta: '[Sim, pedimos um sinal de R$ __ no Pix para reservar o horário / Não, o pagamento é feito no dia].',
      },
      {
        pergunta: 'E se eu precisar remarcar?',
        resposta: 'Sem problema! É só avisar com [24h] de antecedência que encontramos outro horário.',
      },
    ],
    emojiSaudacao: '💅',
    camposPedido: 'Ex.: serviço desejado, dia e horário preferidos, nome completo, se é a primeira vez',
    instrucoes: 'Ex.: Nunca confirme horário sem me consultar antes.',
    instrucoesSugeridas: [
      'Nosso horário de funcionamento é [de segunda a sexta, das 8h às 18h]. Fora desse horário, avise que respondemos no próximo dia útil.',
      'Nunca confirme horário sem me consultar antes.',
      'Peça uma foto de referência quando o cliente quiser algo personalizado.',
      'Avise que atrasos acima de 15 minutos podem precisar remarcar.',
      'Não agende atendimentos aos domingos.',
    ],
    topico: { nome: 'Ex.: Unhas em gel', descricao: 'Ex.: Acabamento natural, duração de até 21 dias.' },
    topicosSugeridos: ['Unhas em gel', 'Antes e depois', 'Trabalhos recentes'],
  },

  SERVICOS_PERSONALIZADOS: {
    termoItem: 'serviço',
    tituloItens: 'Serviços',
    tituloNovoItem: 'Novo serviço',
    produto: {
      nome: 'Ex.: Projeto de iluminação personalizada',
      categoria: 'Nome da categoria, ex.: Projetos',
      descricao: 'Ex.: Somente com agendamento. Primeiro faço uma visita para analisar o ambiente e depois envio o orçamento, sem valor fixo.',
      nomeOpcao: 'Nome (ex.: Ambiente)',
      valoresOpcao: 'Ex.: Sala, quarto, área externa',
      exemploOpcoes: 'Ambiente → sala, quarto, área externa',
    },
    exemploProduto: 'Projeto de iluminação personalizada',
    dicasProdutos: {
      exemploVariacao: 'Ex.: "Pintura de quarto" e "Pintura de apartamento inteiro".',
      exemploSemPreco: 'Projetos que dependem de visita ficam sem preço: o assistente explica que o valor sai depois da avaliação.',
    },
    pergunta: {
      pergunta: 'Ex.: Vocês fazem visita para orçamento?',
      resposta: 'Ex.: Fazemos sim! A visita é agendada e sem custo. Depois dela enviamos o orçamento.',
    },
    perguntasSugeridas: [
      {
        pergunta: 'Vocês fazem visita para orçamento?',
        resposta: 'Fazemos sim! A visita é agendada e [é gratuita / custa R$ __]. Depois dela enviamos o orçamento completo.',
      },
      {
        pergunta: 'Quais bairros vocês atendem?',
        resposta: 'Atendemos [bairros ou cidades]. Para outras regiões, consulte a taxa de deslocamento.',
      },
      {
        pergunta: 'Qual o prazo para ficar pronto?',
        resposta: 'Depende do projeto: em média [15 dias] depois da aprovação do orçamento. Confirmamos o prazo certinho na visita.',
      },
      {
        pergunta: 'O serviço tem garantia?',
        resposta: 'Sim! Todos os serviços têm garantia de [90 dias].',
      },
    ],
    emojiSaudacao: '🛠️',
    camposPedido: 'Ex.: serviço desejado, endereço com bairro, medidas ou fotos do local, melhor dia e horário para a visita',
    instrucoes: 'Ex.: Nunca passe valor fechado sem antes fazer a visita técnica.',
    instrucoesSugeridas: [
      'Nosso horário de funcionamento é [de segunda a sexta, das 8h às 18h]. Fora desse horário, avise que respondemos no próximo dia útil.',
      'Nunca passe valor fechado sem antes fazer a visita técnica.',
      'Sempre pergunte o bairro antes de agendar uma visita.',
      'Peça fotos do local quando o cliente quiser um orçamento.',
      'Não agende visitas aos domingos.',
    ],
    topico: { nome: 'Ex.: Projetos de iluminação', descricao: 'Ex.: Salas e áreas externas com LED embutido.' },
    topicosSugeridos: ['Projetos entregues', 'Antes e depois', 'Em andamento'],
  },

  DOCES_SALGADOS: {
    termoItem: 'produto',
    tituloItens: 'Produtos',
    tituloNovoItem: 'Novo produto',
    produto: {
      nome: 'Ex.: Torta de aniversário',
      categoria: 'Nome da categoria, ex.: Tortas',
      descricao: 'Ex.: Serve 20 pessoas (cerca de 2 kg). Encomendas com 48h de antecedência.',
      nomeOpcao: 'Nome (ex.: Recheio)',
      valoresOpcao: 'Ex.: Brigadeiro, ninho com morango, doce de leite',
      exemploOpcoes: 'Recheio → brigadeiro, ninho com morango, doce de leite',
    },
    exemploProduto: 'Torta de aniversário',
    dicasProdutos: {
      exemploVariacao: 'Ex.: "Torta para 10 pessoas" e "Torta para 20 pessoas".',
      exemploSemPreco: 'Bolos com decoração especial podem ficar sem preço: o assistente explica que o valor depende do projeto.',
    },
    pergunta: {
      pergunta: 'Ex.: Com quantos dias de antecedência preciso encomendar?',
      resposta: 'Ex.: Pedimos 2 dias de antecedência. Para festas grandes, o ideal é 1 semana.',
    },
    perguntasSugeridas: [
      {
        pergunta: 'Com quantos dias de antecedência preciso encomendar?',
        resposta: 'Pedimos [2 dias] de antecedência. Para festas grandes, o ideal é [1 semana].',
      },
      {
        pergunta: 'Vocês entregam?',
        resposta: 'Entregamos em [bairros] com taxa de [R$ __]. Também dá para retirar aqui, em [endereço].',
      },
      {
        pergunta: 'Quais sabores vocês têm?',
        resposta: 'Temos [brigadeiro, ninho com morango, doce de leite e prestígio]. Dá para combinar dois recheios na mesma torta.',
      },
      {
        pergunta: 'Fazem sem lactose ou sem açúcar?',
        resposta: '[Sim, fazemos sob encomenda, com 3 dias de antecedência / No momento não fazemos].',
      },
    ],
    emojiSaudacao: '🎂',
    camposPedido: 'Ex.: sabor da massa e do recheio, para quantas pessoas, data e horário, entrega ou retirada, bairro',
    instrucoes: 'Ex.: Não aceite encomendas para o mesmo dia.',
    instrucoesSugeridas: [
      'Nosso horário de funcionamento é [de segunda a sexta, das 8h às 18h]. Fora desse horário, avise que respondemos no próximo dia útil.',
      'Não aceite encomendas com menos de 48h de antecedência.',
      'Sempre pergunte para quantas pessoas é antes de sugerir um tamanho.',
      'Sempre confirme a data e o horário da entrega.',
      'O pedido só é confirmado depois do sinal de 50% no Pix.',
    ],
    topico: { nome: 'Ex.: Tortas de aniversário', descricao: 'Ex.: Decoradas com chantininho e topo personalizado.' },
    topicosSugeridos: ['Tortas de aniversário', 'Docinhos de festa', 'Salgados'],
  },

  PRODUTOS_PERSONALIZADOS: {
    termoItem: 'produto',
    tituloItens: 'Produtos personalizados',
    tituloNovoItem: 'Novo produto',
    produto: {
      nome: 'Ex.: Cesta romântica café da manhã',
      categoria: 'Nome da categoria, ex.: Cestas',
      descricao: 'Ex.: Inclui cesta decorada, cartão personalizado e itens de café da manhã. Encomendas com 2 dias de antecedência.',
      nomeOpcao: 'Nome (ex.: Tamanho)',
      valoresOpcao: 'Ex.: Pequena, média, grande',
      exemploOpcoes: 'Tamanho → pequena, média, grande',
    },
    exemploProduto: 'Cesta romântica café da manhã',
    dicasProdutos: {
      exemploVariacao: 'Ex.: "Cesta romântica pequena" e "Cesta romântica grande".',
      exemploSemPreco: 'Peças que dependem de medição ou de arte, como cortinas e estampas, ficam sem preço: o assistente explica que o valor sai no orçamento.',
    },
    pergunta: {
      pergunta: 'Ex.: Dá para colocar um nome ou frase?',
      resposta: 'Ex.: Dá sim! Me envie o texto e eu mostro a prévia antes de produzir.',
    },
    perguntasSugeridas: [
      {
        pergunta: 'Qual o prazo de produção?',
        resposta: 'Em média [3 dias úteis] depois da aprovação. Para datas especiais, peça com antecedência!',
      },
      {
        pergunta: 'Dá para personalizar com nome ou foto?',
        resposta: 'Dá sim! Me envie o nome, a frase ou a foto e eu mando a prévia para você aprovar antes de produzir.',
      },
      {
        pergunta: 'Vocês entregam?',
        resposta: 'Entregamos em [bairros] com taxa de [R$ __]. Também dá para retirar aqui.',
      },
      {
        pergunta: 'Vocês tiram as medidas?',
        resposta: '[Sim! Para cortinas, agendamos uma visita para medir e levamos amostras / Não trabalhamos com peças sob medida].',
      },
    ],
    emojiSaudacao: '🎁',
    camposPedido: 'Ex.: produto, personalização (nome, frase ou foto), data de entrega, entrega ou retirada, endereço',
    instrucoes: 'Ex.: Sempre envie a prévia para aprovação antes de produzir.',
    instrucoesSugeridas: [
      'Nosso horário de funcionamento é [de segunda a sexta, das 8h às 18h]. Fora desse horário, avise que respondemos no próximo dia útil.',
      'Sempre envie a prévia da personalização para aprovação antes de produzir.',
      'Confirme a data de entrega antes de fechar o pedido.',
      'Nunca passe valor final de peças sob medida sem as medidas.',
      'Avise que o prazo de produção começa depois da aprovação da prévia.',
    ],
    topico: { nome: 'Ex.: Cestas românticas', descricao: 'Ex.: Café da manhã e kits para datas especiais.' },
    topicosSugeridos: ['Cestas românticas', 'Cortinas', 'Estampas', 'Presentes'],
  },

  PRODUTOS_GERAIS: {
    termoItem: 'produto',
    tituloItens: 'Produtos',
    tituloNovoItem: 'Novo produto',
    produto: {
      nome: 'Ex.: Vestido midi canelado',
      categoria: 'Nome da categoria, ex.: Vestidos',
      descricao: 'Ex.: Tecido canelado com elastano, não amassa. Veste do 36 ao 42.',
      nomeOpcao: 'Nome (ex.: Tamanho)',
      valoresOpcao: 'Ex.: P, M, G',
      exemploOpcoes: 'Tamanho → P, M, G',
    },
    exemploProduto: 'Vestido midi canelado',
    dicasProdutos: {
      exemploVariacao: 'Ex.: "Camiseta básica" e "Camiseta estampada".',
      exemploSemPreco: 'Peças sob encomenda podem ficar sem preço: o assistente explica que o valor é confirmado por você.',
    },
    pergunta: {
      pergunta: 'Ex.: Vocês fazem troca?',
      resposta: 'Ex.: Sim! Trocas em até 7 dias, com a etiqueta e a nota.',
    },
    perguntasSugeridas: [
      {
        pergunta: 'Tem no meu tamanho?',
        resposta: 'Trabalhamos do [P ao GG]. Me diga o seu tamanho que eu confiro o estoque.',
      },
      {
        pergunta: 'Vocês fazem troca?',
        resposta: 'Sim! Trocas em até [7 dias], com a etiqueta e a nota.',
      },
      {
        pergunta: 'Vocês entregam?',
        resposta: 'Entregamos em [bairros] com taxa de [R$ __]. Também dá para retirar na loja, em [endereço].',
      },
      {
        pergunta: 'Parcela no cartão?',
        resposta: 'Parcelamos em até [3x sem juros] no cartão. No Pix, [5% de desconto].',
      },
    ],
    emojiSaudacao: '🛍️',
    camposPedido: 'Ex.: produto, tamanho, cor, quantidade, entrega ou retirada, endereço',
    instrucoes: 'Ex.: Sempre confirme o tamanho antes de fechar.',
    instrucoesSugeridas: [
      'Nosso horário de funcionamento é [de segunda a sexta, das 8h às 18h]. Fora desse horário, avise que respondemos no próximo dia útil.',
      'Sempre confirme tamanho e cor antes de fechar o pedido.',
      'Não reserve peças por mais de 24h sem pagamento.',
      'Não ofereça desconto: me chame se o cliente pedir.',
      'Informe a política de troca quando o cliente estiver em dúvida sobre o tamanho.',
    ],
    topico: { nome: 'Ex.: Coleção de verão', descricao: 'Ex.: Vestidos e conjuntos leves.' },
    topicosSugeridos: ['Novidades', 'Mais vendidos', 'Promoções'],
  },

  OUTRO: {
    termoItem: 'produto ou serviço',
    tituloItens: 'Produtos e serviços',
    tituloNovoItem: 'Novo item',
    produto: {
      nome: 'Ex.: Atendimento inicial',
      categoria: 'Nome da categoria, ex.: Serviços',
      descricao: 'Ex.: O que está incluso, quanto tempo dura e como funciona.',
      nomeOpcao: 'Nome (ex.: Horário)',
      valoresOpcao: 'Ex.: Manhã, tarde, noite',
      exemploOpcoes: 'Horário → manhã, tarde, noite',
    },
    exemploProduto: 'Atendimento inicial',
    dicasProdutos: {
      exemploVariacao: 'Ex.: "Pacote com 4 encontros" e "Pacote com 8 encontros".',
      exemploSemPreco: 'Quando o valor só sai depois de entender o pedido, deixe sem preço: o assistente explica isso ao cliente.',
    },
    pergunta: {
      pergunta: 'Ex.: Qual o horário de atendimento?',
      resposta: 'Ex.: Atendemos de segunda a sexta, das 8h às 18h.',
    },
    perguntasSugeridas: [
      { pergunta: 'Qual o horário de atendimento?', resposta: 'Atendemos [de segunda a sexta, das 8h às 18h].' },
      { pergunta: 'Quais as formas de pagamento?', resposta: 'Aceitamos [Pix, cartão e dinheiro].' },
      { pergunta: 'Onde vocês ficam?', resposta: 'Estamos em [endereço]. [Também atendemos online].' },
      { pergunta: 'Como faço para agendar?', resposta: 'É só me dizer o melhor dia e horário que eu confirmo para você.' },
    ],
    emojiSaudacao: '😊',
    camposPedido: 'Ex.: o que o cliente precisa, melhor dia e horário, forma de pagamento',
    instrucoes: 'Ex.: Nunca confirme horário sem me consultar.',
    instrucoesSugeridas: [
      'Nosso horário de funcionamento é [de segunda a sexta, das 8h às 18h]. Fora desse horário, avise que respondemos no próximo dia útil.',
      'Nunca confirme horário sem antes me consultar.',
      'Não ofereça descontos sem a minha autorização.',
      'Sempre pergunte o nome do cliente no início da conversa.',
      'Não atendemos aos domingos e feriados.',
    ],
    topico: { nome: 'Ex.: Trabalhos recentes', descricao: 'Ex.: O que fizemos nos últimos meses.' },
    topicosSugeridos: ['Trabalhos recentes', 'Antes e depois'],
  },
};
