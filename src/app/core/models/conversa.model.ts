/**
 * IA_ATIVA: o assistente está respondendo.
 * HUMANO_ATIVO: o dono respondeu pelo celular e o assistente ficou quieto nessa conversa.
 * AGUARDANDO_DONO: o assistente passou a conversa para o dono.
 */
export type StatusConversa = 'IA_ATIVA' | 'HUMANO_ATIVO' | 'AGUARDANDO_DONO';

/** Por que a conversa está esperando o dono da loja. */
export type MotivoEspera = 'PRONTO_PARA_FECHAR' | 'PEDIU_HUMANO' | 'IA_SEM_RESPOSTA';

export interface ItemResumoPedido {
  campo: string;
  valor: string;
}

export interface Conversa {
  /** UUID da conversa no backend. */
  id: string;
  /** Nome do perfil do WhatsApp do cliente (pode vir vazio). */
  nomeCliente: string;
  whatsapp: string;
  ultimaMensagem: string;
  atualizadaEm: Date;
  status: StatusConversa;
  motivoEspera?: MotivoEspera;
  resumoPedido: ItemResumoPedido[];
}
