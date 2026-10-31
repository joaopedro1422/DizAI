import {
  FormaPagamento,
  FormaRecebimento,
  ModoCatalogo,
  ModoFotos,
  ModoPedido,
  PrazoMinimo,
  RamoNegocio,
} from '../models/perfil.model';

/** Par valor/rótulo usado em chips e listas de seleção. */
export interface OpcaoSelecao<T extends string> {
  valor: T;
  rotulo: string;
}

/** Opção exibida como card (título + descrição). */
export interface OpcaoDescrita<T extends string> extends OpcaoSelecao<T> {
  descricao: string;
}

export const RAMOS_NEGOCIO: OpcaoDescrita<RamoNegocio>[] = [
  {
    valor: 'SERVICOS_PRESENCIAIS',
    rotulo: 'Serviços presenciais',
    descricao: 'Manicures, esteticistas, cabeleireiras, pet shops',
  },
  {
    valor: 'SERVICOS_PERSONALIZADOS',
    rotulo: 'Serviços personalizados',
    descricao: 'Eletricistas, móveis projetados, pintores',
  },
  {
    valor: 'DOCES_SALGADOS',
    rotulo: 'Doces e salgados',
    descricao: 'Bolos, doces, tortas, salgados e lanches sob encomenda',
  },
  {
    valor: 'PRODUTOS_PERSONALIZADOS',
    rotulo: 'Produtos personalizados',
    descricao: 'Cortinas, presentes, estampas, cestas românticas',
  },
  {
    valor: 'PRODUTOS_GERAIS',
    rotulo: 'Produtos em geral',
    descricao: 'Roupas, tênis, acessórios, presentes',
  },
  {
    valor: 'OUTRO',
    rotulo: 'Outro tipo de negócio',
    descricao: 'Nenhum dos anteriores se parece com o meu',
  },
];

/** Ramos oferecidos no cadastro e em Dados da loja: "Produtos em geral" saiu por enquanto (continua valendo para quem já tem). */
export const RAMOS_PARA_ESCOLHER = RAMOS_NEGOCIO.filter((ramo) => ramo.valor !== 'PRODUTOS_GERAIS');

export const FORMAS_PAGAMENTO: OpcaoSelecao<FormaPagamento>[] = [
  { valor: 'PIX', rotulo: 'Pix' },
  { valor: 'CARTAO_CREDITO', rotulo: 'Cartão de crédito' },
  { valor: 'CARTAO_DEBITO', rotulo: 'Cartão de débito' },
  { valor: 'DINHEIRO', rotulo: 'Dinheiro' },
  { valor: 'LINK_PAGAMENTO', rotulo: 'Link de pagamento' },
];

export const FORMAS_RECEBIMENTO: OpcaoSelecao<FormaRecebimento>[] = [
  { valor: 'ENTREGA', rotulo: 'Entrega' },
  { valor: 'RETIRADA', rotulo: 'Retirada no local' },
  { valor: 'ATENDIMENTO_LOCAL', rotulo: 'Atendo no local' },
];

export const PRAZOS_MINIMOS: OpcaoSelecao<PrazoMinimo>[] = [
  { valor: 'SEM_ANTECEDENCIA', rotulo: 'Sem antecedência' },
  { valor: 'HORAS_1', rotulo: '1 hora' },
  { valor: 'HORAS_2', rotulo: '2 horas' },
  { valor: 'HORAS_4', rotulo: '4 horas' },
  { valor: 'HORAS_12', rotulo: '12 horas' },
  { valor: 'HORAS_24', rotulo: '24 horas' },
  { valor: 'HORAS_48', rotulo: '48 horas' },
  { valor: 'DIAS_3', rotulo: '3 dias ou mais' },
];

/**
 * destaque: estrelinha no card. soComAgenda: só aparece para os ramos com agenda (serviços presenciais).
 * soServicos / soProdutos: nos serviços, "Agendo por outro app" fica no lugar de "Me chamar na hora".
 */
export const MODOS_PEDIDO: (OpcaoDescrita<ModoPedido> & {
  destaque?: boolean;
  soComAgenda?: boolean;
  soServicos?: boolean;
  soProdutos?: boolean;
})[] = [
  {
    valor: 'ENCAMINHAR_AO_DONO',
    rotulo: 'Me chamar na hora',
    descricao: 'O assistente tira dúvidas e, assim que o cliente quiser fechar, passa a conversa para você.',
    soProdutos: true,
  },
  {
    valor: 'LINK_EXTERNO',
    rotulo: 'Agendo por outro app',
    descricao:
      'Já usa um app de agenda (AppBarber, Trinks, Booksy...)? O assistente envia o seu link e avisa caso esteja fora do seu horário de funcionamento.',
    soServicos: true,
  },
  {
    valor: 'COLETAR_DADOS',
    rotulo: 'Coletar os dados do pedido',
    descricao:
      'O assistente pergunta tudo o que você precisa, envia um resumo, pede confirmação e só então te chama.',
  },
  {
    valor: 'AGENDAMENTO_AUTOMATICO',
    rotulo: 'Agendamento automático',
    descricao:
      'O assistente confere sua agenda, oferece os horários livres e marca o cliente sozinho, com confirmação na hora.',
    destaque: true,
    soComAgenda: true,
  },
];

export const MODOS_FOTOS: OpcaoDescrita<ModoFotos>[] = [
  {
    valor: 'GALERIA',
    rotulo: 'Galeria do DizAI',
    descricao: 'Envia o álbum certo da sua galeria, como "Unhas em gel".',
  },
  {
    valor: 'LINK_EXTERNO',
    rotulo: 'Link externo',
    descricao: 'Envia o seu portfólio em outro lugar, como Instagram, Drive ou Canva.',
  },
];

/** "Enviar catálogo em imagem ou PDF?": nas duas opções de "Sim", o catálogo vai no máximo 1 vez por conversa. */
export const MODOS_CATALOGO: OpcaoDescrita<ModoCatalogo>[] = [
  {
    valor: 'SAUDACAO',
    rotulo: 'Sim, na saudação inicial',
    descricao: 'Logo no início da conversa: a saudação, a resposta do assistente e o seu catálogo.',
  },
  {
    valor: 'AO_PERGUNTAR',
    rotulo: 'Sim, quando perguntarem sobre produtos',
    descricao: 'Uma única vez,quando o cliente perguntar sobre produtos, opções, detalhes... ou pedir o menu.',
  },
  {
    valor: 'NAO',
    rotulo: 'Não',
    descricao: 'O assistente não envia catálogo. Responde sobre produtos por mensagem com base no que você cadastrou..',
  },
];

/** Busca o rótulo de um valor em uma lista de opções. */
export function obterRotulo<T extends string>(opcoes: OpcaoSelecao<T>[], valor: T): string {
  return opcoes.find((opcao) => opcao.valor === valor)?.rotulo ?? valor;
}

/** Junta os rótulos de vários valores: "Pix, Cartão de crédito e Dinheiro". */
export function juntarRotulos<T extends string>(opcoes: OpcaoSelecao<T>[], valores: T[]): string {
  const rotulos = valores.map((valor) => obterRotulo(opcoes, valor));
  if (rotulos.length <= 1) {
    return rotulos[0] ?? 'Não informado';
  }
  return `${rotulos.slice(0, -1).join(', ')} e ${rotulos[rotulos.length - 1]}`;
}
