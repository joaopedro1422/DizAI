/**
 * IA_ATIVA: o assistente está respondendo.
 * HUMANO_ATIVO: o dono respondeu pelo celular e o assistente ficou quieto nessa conversa.
 * AGUARDANDO_DONO: o assistente passou a conversa para o dono.
 * EM_PEDIDO: o pedido foi confirmado e está em preparo (tela Pedidos); o assistente volta quando ele for entregue.
 */
export type StatusConversa = 'IA_ATIVA' | 'HUMANO_ATIVO' | 'AGUARDANDO_DONO' | 'EM_PEDIDO';

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
