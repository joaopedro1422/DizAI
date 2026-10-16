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
  /** A IA consulta a agenda e marca os horários sozinha. */
  agendaAtiva: boolean;
  /** De quantos em quantos minutos os horários começam (15, 30 ou 60). */
  intervaloMinutos: number;
  /** Antecedência mínima para o cliente marcar (0 = sem). */
  antecedenciaMinutos: number;
  periodos: PeriodoAtendimento[];
  /** Folgas ("não vou atender neste dia") de hoje em diante, em "AAAA-MM-DD". */
  diasBloqueados: string[];
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
}

export interface NovoAgendamento {
  nomeCliente: string;
  whatsapp: string;
  servicos: string;
  data: string;
  hora: string;
  duracaoMinutos: number;
}

/** Serviço que o cliente pode marcar pela página pública (sem preço). */
export interface ServicoAgenda {
  id: number;
  nome: string;
  categoria: string;
  duracaoMinutos: number;
}

/** GET /public/lojas/{slug}/agenda */
export interface AgendaPublica {
  intervaloMinutos: number;
  diasAbertos: number;
  servicos: ServicoAgenda[];
}

/** GET /public/lojas/{slug}/agenda/horarios?servicos=1,2 — um item por dia. */
export interface DiaHorarios {
  data: string;
  /** false: o negócio não atende nesse dia (dia da semana fechado ou folga). */
  aberto: boolean;
  horarios: string[];
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
