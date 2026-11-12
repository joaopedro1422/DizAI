/** Campanhas de WhatsApp: o mesmo formato do CampanhaDTO do backend. */

export type TipoCampanha = 'PROMOCAO' | 'NOVIDADE' | 'CONVITE' | 'DATA_ESPECIAL' | 'RECUPERAR' | 'REPETIR_PEDIDO';
export type PublicoCampanha = 'TODOS' | 'AUSENTES' | 'FREQUENTES' | 'NO_CICLO' | 'SUMIDOS' | 'ANO_PASSADO';
export type StatusCampanha = 'ENVIANDO' | 'ENVIADA';
export type StatusEnvioCampanha = 'PENDENTE' | 'ENVIADO' | 'ENTREGUE' | 'LIDO' | 'FALHOU' | 'CONTROLE';
/** PRONTOS: já dá para enviar a qualquer cliente; EM_ANALISE: a Meta ainda analisa as mensagens (até 24 h). */
export type SituacaoModelos = 'PRONTOS' | 'EM_ANALISE' | 'RECUSADOS' | 'SEM_CONEXAO';

export interface TipoDisponivel {
  tipo: TipoCampanha;
  titulo: string;
  descricao: string;
  disponivel: boolean;
  motivo: string | null;
}

export interface DataEspecial {
  id: string;
  nome: string;
  dia: string;
  comArtigo: string;
  detalhe: string;
  diasAte: number;
}

export interface SituacaoCampanhas {
  conectado: boolean;
  servico: boolean;
  usaAgenda: boolean;
  pagamentoPendente: boolean;
  /** GREEN, YELLOW ou RED (a qualidade do número para a Meta); null sem a informação. */
  qualidade: string | null;
  clientes: number;
  aptos: number;
  minimo: number;
  liberada: boolean;
  modelos: SituacaoModelos;
  enviadasHoje: number;
  limiteDiario: number;
  tipos: TipoDisponivel[];
  datas: DataEspecial[];
}

export interface DiaLivre {
  data: string;
  rotulo: string;
  vagas: number;
  horarios: string;
}

export interface RascunhoCampanha {
  tipo: TipoCampanha;
  publico?: PublicoCampanha | null;
  diasAusencia?: number | null;
  item?: string | null;
  destaque?: string | null;
  detalhe?: string | null;
  dataReferencia?: string | null;
  dataEspecialId?: string | null;
  imagem?: string | null;
  oportunidadeChave?: string | null;
  clientes?: string[] | null;
  /** Convite dos serviços para a semana toda (sem um dia escolhido). */
  semana?: boolean | null;
}

export interface ClientePrevia {
  id: string;
  nome: string;
  numero: string;
  detalhe: string;
  semCusto: boolean;
}

export interface PreviaCampanha {
  titulo: string;
  texto: string;
  botao: string;
  versoes: number;
  clientes: ClientePrevia[];
  sairam: number;
  recentes: number;
  comHorario: number;
  gratis: number;
  pagos: number;
  custoEstimado: number;
  grupoComparacao: boolean;
  avisos: string[];
}

export interface ResumoCampanha {
  id: string;
  titulo: string;
  tipo: TipoCampanha;
  sugerida: boolean;
  status: StatusCampanha;
  criadaEm: string;
  enviadaEm: string | null;
  enviadas: number;
  responderam: number;
  converteram: number;
  faturamento: number;
  custo: number;
  medindo: boolean;
}

export interface ClienteResultado {
  nome: string;
  numero: string;
  status: StatusEnvioCampanha;
  respondeu: boolean;
  converteu: boolean;
  valor: number | null;
  erro: string | null;
}

export interface ComparacaoCampanha {
  clientes: number;
  converteram: number;
  taxaRecebeu: number;
  taxaNaoRecebeu: number;
}

export interface ResultadoCampanha {
  id: string;
  titulo: string;
  tipo: TipoCampanha;
  sugerida: boolean;
  servico: boolean;
  status: StatusCampanha;
  criadaEm: string;
  enviadaEm: string | null;
  medicaoAte: string;
  medindo: boolean;
  texto: string;
  imagem: string | null;
  total: number;
  enviadas: number;
  entregues: number;
  lidas: number;
  falharam: number;
  pendentes: number;
  responderam: number;
  converteram: number;
  faturamento: number;
  custo: number;
  comparacao: ComparacaoCampanha | null;
  clientes: ClienteResultado[];
}

export interface Oportunidade {
  chave: string;
  tipo: TipoCampanha;
  titulo: string;
  descricao: string;
  clientes: number;
  vagas: number | null;
  data: string | null;
  rascunho: RascunhoCampanha;
}

/** Uma cliente para chamar uma a uma, com a mensagem pronta (abre no WhatsApp do lojista, sem custo). */
export interface ContatoSugerido {
  id: string;
  /** A chave do "Agora não". */
  sugestao: string;
  nome: string;
  /** Só dígitos, para o link do WhatsApp. */
  numero: string;
  numeroExibicao: string;
  motivo: 'NA_HORA' | 'SUMIDO' | 'ANO_PASSADO';
  titulo: string;
  detalhe: string;
  mensagem: string;
}

export interface ContatoFeito {
  nome: string;
  motivo: string;
  quando: string;
  respondeu: boolean;
  converteu: boolean;
  valor: number | null;
}

export interface Individuais {
  sugeridos: ContatoSugerido[];
  recentes: ContatoFeito[];
}

/** O ícone de cada tipo (os mesmos nas listas, no histórico e no card do painel). */
export const ICONE_DO_TIPO: Record<TipoCampanha, 'brilho' | 'estrela' | 'calendario' | 'sino' | 'retorno' | 'sacola'> = {
  PROMOCAO: 'brilho',
  NOVIDADE: 'estrela',
  CONVITE: 'calendario',
  DATA_ESPECIAL: 'sino',
  RECUPERAR: 'retorno',
  REPETIR_PEDIDO: 'sacola',
};
