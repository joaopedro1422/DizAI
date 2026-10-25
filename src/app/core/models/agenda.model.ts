/** Dias da semana como o backend manda (java.time.DayOfWeek). */
export type DiaSemana = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

/** Um período em que o negócio atende num dia da semana. Horas em "HH:mm". */
export interface PeriodoAtendimento {
  diaSemana: DiaSemana;
  inicio: string;
  fim: string;
}

/** Tela "Horários de atendimento": GET/PUT /api/perfis/{id}/agenda/configuracao */
export interface ConfiguracaoAgenda {
  /** Só leitura: ativa quando "Agendamento automático" está escolhido em "Quando o cliente quiser fechar". */
  agendaAtiva: boolean;
  /** De quantos em quantos minutos os horários começam (15, 30 ou 60). */
  intervaloMinutos: number;
  /** Antecedência mínima para o cliente marcar (0 = sem). */
  antecedenciaMinutos: number;
  /** Quanto tempo antes do horário o cliente recebe o lembrete pedindo a confirmação (0 = não envia). */
  lembreteMinutos: number;
  periodos: PeriodoAtendimento[];
  /** Folgas ("não vou atender neste dia") de hoje em diante, em "AAAA-MM-DD". */
  diasBloqueados: string[];
  /** Confirmação que o cliente recebe ao marcar, com {servico}, {data}, {horario} e {nome} (vazia = a padrão). */
  mensagemConfirmacao?: string;
  /** Só leitura: a mensagem padrão. */
  mensagemConfirmacaoPadrao?: string;
  /** Agradecimento 15 min depois do fim do horário, só para quem confirmou a presença pelo lembrete. */
  agradecimentoAtivo?: boolean;
  /** Texto do agradecimento, com {nome} e {servico} (vazio = o padrão). */
  mensagemAgradecimento?: string;
  /** Só leitura: o agradecimento padrão. */
  mensagemAgradecimentoPadrao?: string;
  /** Texto do lembrete: {nome}, {data} ("hoje", "amanhã", "sexta, 24/10"), {horario} (só o início) e {servico}. */
  mensagemLembrete?: string;
  /** Só leitura: o lembrete padrão. */
  mensagemLembretePadrao?: string;
  /** Lista de espera: o assistente oferece nos dias sem horário e avisa quando vaga. */
  listaEsperaAtiva?: boolean;
  /** Quanto tempo quem recebe a vaga tem para responder: 10, 15 ou 30 minutos. */
  listaEsperaMinutos?: number;
}

/** AGUARDANDO: na fila. OFERECIDA: recebeu uma vaga e o prazo para responder está correndo. */
export type StatusListaEspera = 'AGUARDANDO' | 'OFERECIDA';

/** Um cliente na lista de espera de um dia: GET /api/perfis/{id}/agenda/lista-espera?de=&ate= */
export interface ClienteListaEspera {
  id: string;
  /** "AAAA-MM-DD" */
  data: string;
  /** 1 = o primeiro da fila do dia. */
  posicao: number;
  nomeCliente: string;
  /** Formato de exibição, ex.: "(83) 99999-0000". */
  whatsapp: string;
  servicos: string;
  /** Com quem ele quer (2+ profissionais); null = qualquer um. */
  profissional: string | null;
  status: StatusListaEspera;
  /** Só com a vaga oferecida: o horário ("14:00"), com quem e até quando ele pode responder (ISO). */
  ofertaHorario: string | null;
  ofertaProfissional: string | null;
  ofertaExpiraEm: string | null;
}

export type StatusAgendamento = 'CONFIRMADO' | 'CANCELADO';

/** WHATSAPP: marcado pelo assistente na conversa. PAINEL: cadastrado pelo lojista. */
export type OrigemAgendamento = 'WHATSAPP' | 'PAINEL';

export interface Agendamento {
  id: string;
  /** "AAAA-MM-DD" */
  data: string;
  inicio: string;
  fim: string;
  duracaoMinutos: number;
  /** "Manicure + Pedicure" */
  servicos: string;
  nomeCliente: string;
  /** Formato de exibição, ex.: "(83) 99999-0000"; vazio no manual sem número. */
  whatsapp: string;
  status: StatusAgendamento;
  origem: OrigemAgendamento;
  /** O cliente já recebeu o lembrete do horário. */
  lembreteEnviado: boolean;
  /** O cliente respondeu ao lembrete confirmando que vem. */
  presencaConfirmada: boolean;
  /** Quem atende (com um profissional só, sempre o dono). */
  profissionalId: string;
  profissionalNome: string;
  /** Quanto custa: a soma dos preços dos serviços ao marcar (o lojista pode ajustar). null = sem valor. */
  valor: number | null;
  /** Produtos à venda que o cliente reservou pela agenda online ("Também temos"); vazio = nenhum. */
  produtos: ProdutoReservado[];
}

/** Produto reservado no agendamento, com a foto e o preço do cadastro (o que saiu do cadastro vem só com o nome). */
export interface ProdutoReservado {
  nome: string;
  preco: number | null;
  precoAPartirDe: boolean;
  fotoUrl: string | null;
}

/** "Quem está livre?": a situação de um profissional num horário (agenda com 2+). */
export interface DisponibilidadeProfissional {
  profissionalId: string;
  nome: string;
  fotoUrl: string | null;
  situacao: 'LIVRE' | 'OCUPADO' | 'FOLGA' | 'FORA_DO_EXPEDIENTE';
  /** OCUPADO: o cliente do horário que bate e até que horas ("15:00"). */
  ocupadoCom: string | null;
  ocupadoAte: string | null;
}

/** Quem atende na agenda. principal: o dono, criado sozinho; não pode ser removido. */
export interface Profissional {
  id: string;
  nome: string;
  principal: boolean;
  /** Foto (referência lojas/{slug}/profissionais/...); null = iniciais. Aparece no "Com quem?" da agenda online. */
  fotoUrl: string | null;
}

/** Aba "Números" da agenda: GET /api/perfis/{id}/agenda/numeros?dias= */
export interface NumerosAgenda {
  dias: number;
  /** Soma dos valores dos atendimentos que já aconteceram no período. */
  faturamento: number;
  realizados: number;
  valorMedio: number;
  cancelados: number;
  /** Confirmados para os próximos dias (o mesmo número de dias do período). */
  previstos: number;
  valorPrevisto: number;
  /** Só com 2+ profissionais. */
  porProfissional: { nome: string; realizados: number; faturamento: number }[];
  servicosMaisAgendados: { nome: string; quantidade: number }[];
  /** "2026-10" quando o filtro é um mês do calendário (previstos = o que falta do mês); null nos 7/30/90 dias. */
  mes: string | null;
  /** "2026" quando o filtro é um ano inteiro (previstos = o que falta do ano; série por mês); null nos outros. */
  ano: string | null;
  /** Vendas do "Registrar venda" no período, à parte do faturamento dos atendimentos. */
  faturamentoProdutos: number;
  produtosVendidos: number;
  produtosMaisVendidos: ItemFaturamento[];
  /** Gráfico do período: um ponto por dia (7/30 dias e mês) ou por semana (90 dias). */
  serie: PontoSerie[];
  /** Quanto cada serviço faturou (as 5 maiores + "Outros"). */
  faturamentoPorServico: ItemFaturamento[];
  /** Os 5 clientes que mais gastaram (quantidade = atendimentos). */
  melhoresClientes: ItemFaturamento[];
  clientes: number;
  /** Quantos vieram 2 ou mais vezes no período. */
  clientesRecorrentes: number;
  /** "Dias mais movimentados": SEG..DOM. */
  porDiaDaSemana: { dia: string; valor: number; atendimentos: number }[];
}

export interface PontoSerie {
  /** "AAAA-MM-DD" do dia (ou do começo da semana). */
  inicio: string;
  valor: number;
  atendimentos: number;
}

export interface ItemFaturamento {
  nome: string;
  valor: number;
  quantidade: number;
}

/** "Registrar venda": produto à venda e quantos foram vendidos (o preço vem do cadastro). */
export interface ItemNovaVenda {
  produtoId: number;
  quantidade: number;
}

export interface VendaProduto {
  id: string;
  total: number;
  criadoEm: string;
  itens: { nome: string; quantidade: number; precoUnitario: number }[];
}

export interface NovoAgendamento {
  nomeCliente: string;
  whatsapp: string;
  servicos: string;
  data: string;
  hora: string;
  duracaoMinutos: number;
  /** Com 2+ profissionais; vazio = o principal. */
  profissionalId?: string | null;
  valor?: number | null;
}

/** Serviço que o cliente pode marcar pela página pública. preco null = sob consulta. */
export interface ServicoAgenda {
  id: number;
  nome: string;
  categoria: string;
  duracaoMinutos: number;
  descricao?: string | null;
  preco?: number | null;
  precoAPartirDe?: boolean;
}

/** GET /public/lojas/{slug}/agenda */
export interface AgendaPublica {
  intervaloMinutos: number;
  diasAbertos: number;
  servicos: ServicoAgenda[];
  /** Só quando a loja tem 2 ou mais: a página mostra o passo "Com quem?". */
  profissionais?: { id: string; nome: string; fotoUrl?: string | null }[];
  /** Produtos à venda disponíveis: passo opcional "Também temos" (vazio = o passo não aparece). */
  produtos?: ProdutoAgendaPublica[];
  /** Dia sem horário para o serviço: a página oferece "Entrar na lista de espera". */
  listaEsperaAtiva?: boolean;
  /** Quanto tempo quem recebe a vaga tem para responder (10, 15 ou 30 minutos). */
  listaEsperaMinutos?: number;
}

export interface ProdutoAgendaPublica {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number | null;
  precoAPartirDe: boolean;
  fotoUrl: string | null;
}

/** GET /public/lojas/{slug}/agenda/horarios?servicos=1,2 — um item por dia. */
export interface DiaHorarios {
  data: string;
  /** false: o negócio não atende nesse dia (dia da semana fechado ou folga). */
  aberto: boolean;
  horarios: string[];
  /** Sem horário para o serviço, mas com lista de espera (a loja usa e o expediente do dia ainda comporta o serviço). */
  listaEspera?: boolean;
}

/**
 * Mensagem pronta da agenda (lembrete, endereço...). O texto aceita {nome}, {data}, {horario} e {servico},
 * trocados pelos dados do agendamento quando o lojista escolhe a mensagem.
 */
export interface MensagemPronta {
  id: string;
  titulo: string;
  texto: string;
}

export type NovaMensagemPronta = Omit<MensagemPronta, 'id'>;
