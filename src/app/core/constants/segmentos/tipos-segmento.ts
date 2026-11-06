import type { ConteudoRamo } from '../conteudo-por-ramo';
import type { RamoNegocio } from '../../models/perfil.model';

/**
 * Tipo do negócio dentro do ramo (barbearia, loja de bolos...). Escolhido no primeiro passo do onboarding e em Dados
 * da loja; só deixa os exemplos, sugestões e tutoriais do painel com a cara do negócio (qualquer produto ou serviço
 * pode ser cadastrado e o atendimento da IA não muda). Mesmos valores do enum SegmentoNegocio do backend.
 */
export type SegmentoNegocio =
  | 'BARBEARIA'
  | 'SALAO_BELEZA'
  | 'MANICURE'
  | 'ESTETICA'
  | 'DECORACAO_EVENTOS'
  | 'FOTOGRAFIA'
  | 'REFORMAS_REPAROS'
  | 'AULAS_CONSULTORIA'
  | 'DOCES'
  | 'BOLOS_TORTAS'
  | 'SALGADOS'
  | 'LANCHES'
  | 'CESTAS_PRESENTES'
  | 'FLORICULTURA'
  | 'PAPELARIA_PERSONALIZADA'
  | 'CAMISETAS_ESTAMPAS'
  | 'ROUPAS_ACESSORIOS'
  | 'COSMETICOS_PERFUMARIA'
  | 'CASA_DECORACAO'
  | 'VARIEDADES'
  | 'PET_SHOP'
  | 'SAUDE_BEM_ESTAR'
  | 'AULAS_CURSOS'
  | 'ACADEMIA_ESTUDIO';

/** Os textos do painel que mudam com o segmento (o termo do item e os títulos continuam os do ramo). */
export type ConteudoSegmento = Omit<
  ConteudoRamo,
  'termoItem' | 'tituloItens' | 'tituloNovoItem' | 'exemploNomeLoja' | 'exemploDescricaoLoja'
>;

/** Uma mensagem dos exemplos de conversa (cliente = balão verde). */
export interface MensagemExemplo {
  cliente?: boolean;
  texto: string;
}

/** Um item da lista de produtos/serviços dos tutoriais. */
export interface ItemExemplo {
  emoji: string;
  nome: string;
  detalhe: string;
  /** "R$ 35" ou um texto como "ver tamanhos". */
  preco: string;
}

/** Exemplos dos tutoriais de quem vende produtos (e do ramo "Outro", que usa os mesmos roteiros). */
export interface ExemplosProdutos {
  itens: [ItemExemplo, ItemExemplo, ItemExemplo];
  /** Nome sugerido no campo vazio do cadastro. */
  placeholderNome: string;
  /** Produto com o preço que muda conforme a escolha (variações de preço). */
  variacao: { item: string; opcoes: [string, string][] };
  /** Vários sabores/modelos com o mesmo preço: um produto só, com o preço da unidade e uma opção. */
  generico: {
    item: string;
    precoUnidade: string;
    /** "unidade", "cento", "peça"... */
    unidade: string;
    opcao: string;
    valores: string[];
    pedido: string;
    escolha: string;
    /** A conta que o assistente faz, ex.: "100 salgados a R$ 0,80 cada: R$ 80,00". */
    total: string;
  };
  /** Variações e opções no mesmo produto. */
  combinado: { item: string; variacoes: [string, string][]; opcao: string; valores: string[] };
  antecedencia: { item: string; preco: string; prazo: string; outro: string; prazoLoja: string };
  /** Tutorial do formulário: as opções (exatamente 1, até 2, adicional), a conversa e o adicional por tamanho. */
  guia: {
    opcoes: { nome: string; regra: string; valores: string[] }[];
    conversa: [string, string, string, string];
    adicional: { nome: string; tamanhos: [string, string, string][] };
  };
}

export interface ExemplosServicos {
  itens: [ItemExemplo, ItemExemplo, ItemExemplo];
  placeholderNome: string;
  /** A duração do serviço (cadastro) e como ela ocupa a agenda. */
  duracao: { item: string; chips: string[]; escolhida: string; minutos: string; equivale: string; inicio: string; fim: string };
  /** A conversa em que o assistente marca: antes e depois da duração em destaque. */
  conversaAgenda: { cliente: string; antes: string; duracao: string; depois: string; escolha: string; confirmacao: string };
  /** Preço que muda com o tipo: os valores na descrição e o preço em branco. */
  tipos: { item: string; linhas: string[]; duracao: string };
  escolhas: { item: string; preco: string; duracao: string; opcao: string; valores: string[] };
  /** Vídeo da agenda (só serviços com agenda): os horários do dia, as conversas e a página de agendamento. */
  agenda?: {
    servicos: { nome: string; duracao: string }[];
    dia: { hora: string; servico: string; cliente: string; duracao: string }[];
    agendar: [string, string, string, string];
    remarcar: [string, string, string, string];
    lembrete: [string, string, string];
    presenca: string;
  };
}

/** Os exemplos de todos os tutoriais do painel e das prévias do onboarding, de um segmento (ou o padrão do ramo). */
export interface ExemplosNegocio {
  loja: string;
  slug: string;
  descricaoLoja: string;
  emoji: string;
  instagram: { usuario: string; bio: [string, string] };
  saudacao: [string, string, string];
  regras: string[];
  conversaRegra: { cliente: string; assistente: string };
  catalogo: string;
  /** A conversa em que o cliente quer fechar (pedido anotado ou horário marcado) e o aviso que chega. */
  fechamento: { mensagens: MensagemExemplo[]; aviso: { titulo: string; texto: string } };
  /** Pergunta de preço (prévia do passo "Produtos" no tour). */
  conversaPreco: [string, string];
  /** O que chega no Chats quando o assistente passa a conversa (prévia do tour). */
  avisoChats: string;
  /** Galeria: os tópicos de exemplo e a conversa em que o cliente pede fotos. */
  galeria: {
    portfolio: [string, number];
    catalogo: [string, number];
    espaco: [string, number];
    pedidoFotos: string;
    reacao: string;
  };
  perguntas: {
    lista: { pergunta: string; resposta: string }[];
    nova: { pergunta: string; linhas: string[] };
    conversa: { cliente: string; assistente: string; agradecimento: string };
    semResposta: { pergunta: string; resposta: string };
    dicaFinal: string;
  };
  /** Vídeo dos Chats: o atendimento que chega para o dono confirmar. */
  chats: {
    cliente: string;
    titulo: string;
    destaque: string;
    pedido: MensagemExemplo[];
    resumo: { campo: string; valor: string }[];
    confirmacao: MensagemExemplo[];
    acompanhamento: MensagemExemplo[];
  };
  produtos?: ExemplosProdutos;
  servicos?: ExemplosServicos;
}

/** Um segmento: o rótulo do cartão de escolha, os textos do painel e os exemplos dos tutoriais. */
export interface DadosSegmento {
  valor: SegmentoNegocio;
  ramo: RamoNegocio;
  rotulo: string;
  descricao: string;
  emoji: string;
  conteudo: ConteudoSegmento;
  exemplos: ExemplosNegocio;
}
