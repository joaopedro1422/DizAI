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
}

/** Pergunta que o assistente não soube responder: sugestão de pergunta frequente. */
export interface PerguntaSemResposta {
  id: string;
  pergunta: string;
  criadaEm: string;
}
