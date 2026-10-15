import { AreaCorFundoVitrine, CorFundoVitrine, FonteVitrine } from './vitrine.model';

export type RamoNegocio =
  | 'SERVICOS_PRESENCIAIS'
  | 'SERVICOS_PERSONALIZADOS'
  | 'DOCES_SALGADOS'
  | 'PRODUTOS_PERSONALIZADOS'
  | 'PRODUTOS_GERAIS'
  | 'OUTRO';

/** O que o assistente faz quando o cliente quer fechar um pedido. */
export type ModoPedido = 'ENCAMINHAR_AO_DONO' | 'COLETAR_DADOS';

/** Qual link o assistente envia quando o cliente pede fotos. */
export type ModoFotos = 'GALERIA' | 'LINK_EXTERNO';

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

export type PrazoMinimo = 'SEM_ANTECEDENCIA' | 'HORAS_24' | 'HORAS_48' | 'DIAS_3';

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
  modoPedido: ModoPedido;
  camposPedido: string;
  modoFotos: ModoFotos;
  linkPortfolioExterno: string;
  saudacaoPersonalizada: string;
  instrucoesObrigatorias: string;
  /** Liga e desliga as respostas automáticas. O lojista controla no painel. */
  iaAtiva: boolean;
  /** O número já foi vinculado à API oficial do WhatsApp (Meta). Sem isso o assistente não responde. */
  whatsappConectado: boolean;
  onboardingConcluido: boolean;
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
>;

/** Dados editados no modal "Dados da loja" do painel. */
export interface DadosLoja {
  dadosNegocio: Pick<Perfil, 'nomeResponsavel' | 'nomeLoja' | 'descricao' | 'whatsapp'>;
  ramo: RamoNegocio;
  pagamentoEntrega: Pick<
    Perfil,
    'formasPagamento' | 'formasRecebimento' | 'distanciaMaximaKm' | 'taxaEntrega' | 'prazoMinimo'
  >;
}
