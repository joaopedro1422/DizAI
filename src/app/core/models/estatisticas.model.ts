/** GET /api/perfis/{id}/estatisticas?dias=7|30|90 */
export interface Estatisticas {
  dias: number;
  /** Ramo de serviço (os textos falam em atendimento, não em pedido). */
  servico: boolean;
  /** Conversas em que o assistente respondeu. */
  atendimentos: number;
  /** Mensagens que o assistente mandou no lugar do lojista. */
  respostasDoAssistente: number;
  /** Clientes passados para o lojista prontos para fechar. */
  pedidosEncaminhados: number;
  /** Horários marcados pelo assistente; null fora dos ramos com agenda. */
  agendamentos: number | null;
  perguntasSemResposta: number;
  /** Estimativa: 1,5 min por resposta + 3 min por agendamento. */
  minutosEconomizados: number;
  /** Há quantos dias a conta foi criada (0 = hoje); null se não se sabe. */
  diasDeConta: number | null;
  /** Tempo economizado dividido pelos dias do período em que a conta já existia. */
  minutosPorDia: number;
  /** Quando os clientes mais chamam; null com menos de 10 mensagens no período. */
  horarioPico?: HorarioPico | null;
}

/** Pergunta que o assistente não soube responder: sugestão de pergunta frequente. */
export interface PerguntaSemResposta {
  id: string;
  pergunta: string;
  criadaEm: string;
}

/** A janela de 3 horas com mais mensagens de clientes ("19h às 22h") e quanto chega fora do horário de funcionamento. */
export interface HorarioPico {
  inicio: number;
  fim: number;
  percentualNoPico: number;
  /** null quando a loja atende "Sempre" ou não tem horário cadastrado. */
  percentualForaDoHorario: number | null;
  mensagens: number;
}
