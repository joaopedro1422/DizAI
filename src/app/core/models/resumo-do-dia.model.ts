/**
 * GET /api/perfis/{id}/resumo-do-dia: o fechamento do dia (modal do painel depois do expediente).
 * data = o dia resumido (hoje, se o expediente acabou; senão ontem). Valores em reais.
 */
export interface ResumoDoDia {
  data: string;
  /** O expediente desse dia acabou (com ?hoje=true pode vir false: os números até agora). */
  encerrado: boolean;
  /** Teve agendamento, pedido ou conversa no dia; sem nada o modal não abre. */
  comMovimento: boolean;
  /** "18:30": quando o dia fechou (fim do expediente ou do último horário); null sem horário. */
  fechouAs: string | null;
  conversas: number;
  mensagensAssistente: number;
  /** 2 minutos por mensagem do assistente. */
  minutosEconomizados: number;
  servicos: ResumoServicos | null;
  produtos: ResumoProdutos | null;
}

export interface ItemDoDia {
  nome: string;
  quantidade: number;
  valor: number | null;
}

export interface ResumoServicos {
  agendamentos: number;
  /** Os que já terminaram: só eles entram no faturamento. */
  atendidos: number;
  faturamento: number;
  ticketMedio: number;
  cancelados: number;
  marcadosPeloAssistente: number;
  clientesNovos: number;
  clientesQueVoltaram: number;
  /** % do expediente ocupado; null sem horários no dia. */
  ocupacao: number | null;
  /** Faturamento do mesmo dia da semana anterior. */
  semanaPassada: number;
  /** Vazio com um profissional só. */
  porProfissional: { nome: string; atendimentos: number; faturamento: number }[];
  servicosMaisFeitos: ItemDoDia[];
  faturamentoProdutos: number;
  produtosVendidos: number;
  amanha: number;
  amanhaPrimeiroHorario: string | null;
}

export interface ResumoProdutos {
  /** Pedidos confirmados no dia (sem os cancelados) e o valor deles. */
  vendas: number;
  valorVendido: number;
  /** Entregues no dia: o faturamento. */
  entregues: number;
  faturamento: number;
  ticketMedio: number;
  cancelados: number;
  emAndamento: number;
  valorEmAndamento: number;
  /** Minutos da confirmação ao "pronto"; null sem dado. */
  preparoMedio: number | null;
  semanaPassada: number;
  maisVendidos: ItemDoDia[];
}
