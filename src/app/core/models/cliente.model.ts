/**
 * Cliente da loja (tela "Clientes", aberta pelo Chats). Montado das conversas, dos agendamentos (serviços) e dos
 * pedidos (produtos), juntados pelo número do WhatsApp. Datas como Date na tela.
 */
export interface Cliente {
  id: string;
  nome: string;
  /** Formato de exibição, ex.: "(83) 99999-0000"; vazio no agendamento manual sem número. */
  whatsapp: string;
  /** Só dígitos, para o link do WhatsApp; vazio = sem número. */
  numero: string;
  /** Agendamentos confirmados (serviços) ou pedidos não cancelados (produtos). */
  total: number;
  /** O que já gastou: atendimentos que aconteceram / pedidos entregues. */
  valor: number;
  ultimaVez: Date | null;
  /** Próximo horário marcado (serviços). */
  proximo: Date | null;
  ultimaConversa: Date | null;
  clienteDesde: Date | null;
}

export interface HistoricoCliente {
  quando: Date;
  descricao: string;
  valor: number | null;
  /** "Agendado", "Atendido", "Cancelado", "Entregue", "Pronto", "Em andamento". */
  situacao: string;
}

export interface DetalheCliente {
  cliente: Cliente;
  tipo: 'servicos' | 'produtos';
  ticketMedio: number;
  /** Serviço mais feito / item mais pedido; null sem dados. */
  favorito: string | null;
  historico: HistoricoCliente[];
}
