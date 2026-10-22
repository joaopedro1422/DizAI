import { PeriodoAtendimento } from './agenda.model';
import { AreaCorFundoVitrine, CorFundoVitrine, FonteVitrine } from './vitrine.model';

export type RamoNegocio =
  | 'SERVICOS_PRESENCIAIS'
  | 'SERVICOS_PERSONALIZADOS'
  | 'DOCES_SALGADOS'
  | 'PRODUTOS_PERSONALIZADOS'
  | 'PRODUTOS_GERAIS'
  | 'OUTRO';

/**
 * O que o assistente faz quando o cliente quer fechar um pedido.
 * AGENDAMENTO_AUTOMATICO: só serviços presenciais; o único modo em que o assistente marca horários sozinho.
 */
export type ModoPedido = 'ENCAMINHAR_AO_DONO' | 'COLETAR_DADOS' | 'AGENDAMENTO_AUTOMATICO';

/** Qual link o assistente envia quando o cliente pede fotos. */
export type ModoFotos = 'GALERIA' | 'LINK_EXTERNO';

/** Quando o assistente envia o catálogo (1 PDF ou até 2 imagens) na conversa. Sempre no máximo 1 vez por conversa. */
export type ModoCatalogo = 'SAUDACAO' | 'AO_PERGUNTAR' | 'NAO';

export type FormaPagamento = 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'DINHEIRO' | 'LINK_PAGAMENTO';

export type FormaRecebimento = 'ENTREGA' | 'RETIRADA' | 'ATENDIMENTO_LOCAL';


/** Cor da página pública da loja (sempre um tom escuro, ver CORES_MARCA). */
export type CorMarca =
  | 'PRETO'
  | 'GRAFITE'
  | 'AZUL_MARINHO'
  | 'AZUL_PETROLEO'
  | 'VERDE_ESCURO'
  | 'VERDE_OLIVA'
  | 'MOSTARDA'
  | 'TERRACOTA'
  | 'VINHO'
  | 'ROSA_ESCURO'
  | 'ROXO'
  | 'MARROM';

/** Ramos com agenda automática e duração obrigatória nos serviços (mesma regra do RamoNegocio.usaAgenda no backend). */
export function ramoUsaAgenda(ramo: RamoNegocio): boolean {
  return ramo === 'SERVICOS_PRESENCIAIS';
}

/** Serviços (presenciais e personalizados): textos de "atendimento" em vez de "pedido". */
export function ramoDeServico(ramo: RamoNegocio): boolean {
  return ramo === 'SERVICOS_PRESENCIAIS' || ramo === 'SERVICOS_PERSONALIZADOS';
}

/** A antecedência é digitada em minutos ou em horas; vai para o backend sempre em minutos. */
export type UnidadeAntecedencia = 'MINUTOS' | 'HORAS' | 'DIAS';

export type PrazoMinimo =
  | 'SEM_ANTECEDENCIA'
  | 'HORAS_1'
  | 'HORAS_2'
  | 'HORAS_4'
  | 'HORAS_12'
  | 'HORAS_24'
  | 'HORAS_48'
  | 'DIAS_3';

export interface Perfil {
  /** UUID do perfil: identifica a loja na URL do painel (/painel/{id}). */
  id: string;
  nomeResponsavel: string;
  nomeLoja: string;
  descricao: string;
  whatsapp: string;
  slug: string;
  /** Referência do logotipo no Storage (lojas/{slug}/perfil/...). `null` mostra a inicial do nome. Exiba com o pipe urlImagem. */
  fotoPerfilUrl: string | null;
  corMarca: CorMarca;
  fonteGaleria?: FonteVitrine;
  corFundoGaleria?: CorFundoVitrine;
  areaCorFundoGaleria?: AreaCorFundoVitrine;
  /** Referência da imagem de capa no Storage. */
  capaUrl?: string | null;
  ramo: RamoNegocio;
  formasPagamento: FormaPagamento[];
  formasRecebimento: FormaRecebimento[];
  distanciaMaximaKm: string;
  taxaEntrega: string;
  prazoMinimo: PrazoMinimo;
  /** Antecedência mínima dos pedidos (= tempo mínimo de preparo), em minutos (0 = sem). Substitui o prazoMinimo. */
  antecedenciaMinutos?: number;
  modoPedido: ModoPedido;
  camposPedido: string;
  modoFotos: ModoFotos;
  linkPortfolioExterno: string;
  saudacaoPersonalizada: string;
  instrucoesObrigatorias: string;
  modoCatalogo: ModoCatalogo;
  /** Referências de lojas/{slug}/catalogo: 1 PDF ou até 2 imagens. Exiba com o pipe urlImagem. */
  catalogoArquivos: string[];
  /** Liga e desliga as respostas automáticas. O lojista controla no painel. */
  iaAtiva: boolean;
  /** O número já foi vinculado à API oficial do WhatsApp (Meta). Sem isso o assistente não responde. */
  whatsappConectado: boolean;
  onboardingConcluido: boolean;
  /** Já viu a apresentação da galeria (abre uma vez, na primeira visita à tela). */
  introGaleriaVista?: boolean;
  /** Agenda automática ligada (só serviços presenciais): o assistente marca horários sozinho. */
  agendaAtiva?: boolean;
  /** Conta com acesso ao gerenciamento da plataforma (/painel/{id}/admin). Definido no backend por DIZAI_ADMIN_NUMEROS. */
  admin?: boolean;
  /** Confirma os pedidos a qualquer momento; false = só no horário de funcionamento (Dados da loja). */
  confirmaQualquerHora: boolean;
  /** Horário de funcionamento (Dados da loja): limita os pedidos e a confirmação. Um ou mais períodos por dia aberto. */
  horariosFuncionamento: PeriodoAtendimento[];
  /** "Sempre": a loja não tem horário fixo (o dono atende a qualquer hora). */
  horarioLivre?: boolean;
  /** "Facilitador de orçamentos" ligado: a aba Orçamento aparece na página pública (só produtos). */
  orcamentoAtivo?: boolean;
  /** Entrou com a senha temporária do "Esqueci minha senha": o painel pede para criar a senha nova. */
  senhaTemporaria?: boolean;
}

/** Campos que o lojista altera na tela inicial do painel. */
export type ConfiguracoesAtendimento = Pick<
  Perfil,
  | 'modoPedido'
  | 'camposPedido'
  | 'modoFotos'
  | 'linkPortfolioExterno'
  | 'saudacaoPersonalizada'
  | 'instrucoesObrigatorias'
  | 'modoCatalogo'
  | 'catalogoArquivos'
  | 'confirmaQualquerHora'
>;

/** Dados editados no modal "Dados da loja" do painel. */
export interface DadosLoja {
  dadosNegocio: Pick<Perfil, 'nomeResponsavel' | 'nomeLoja' | 'descricao' | 'whatsapp'>;
  ramo: RamoNegocio;
  pagamentoEntrega: Pick<
    Perfil,
    'formasPagamento' | 'formasRecebimento' | 'distanciaMaximaKm' | 'taxaEntrega'
  > & { antecedenciaMinutos: number };
  /** Dias e horários em que a loja funciona: limitam os pedidos e a confirmação. */
  horariosFuncionamento?: PeriodoAtendimento[];
  /** "Sempre": sem horário fixo. */
  horarioLivre?: boolean;
}
