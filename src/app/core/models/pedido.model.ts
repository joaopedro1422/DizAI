import { ItemResumoPedido } from './conversa.model';

/** CONFIRMADO e PRONTO estão em andamento (o assistente fica fora da conversa); ENTREGUE entra no faturamento. */
export type StatusPedido = 'CONFIRMADO' | 'PRONTO' | 'ENTREGUE' | 'CANCELADO';

/** Pedido da tela "Pedidos" (lojas de produtos), criado a partir do resumo que o assistente montou na conversa. */
export interface Pedido {
  id: string;
  conversaId: string | null;
  nomeCliente: string;
  /** Formatado para exibição; vazio no pedido da conversa de teste. */
  whatsapp: string;
  resumo: ItemResumoPedido[];
  /** O valor que o lojista confirmou (é ele que entra no faturamento). */
  valor: number;
  status: StatusPedido;
  /** Veio da conversa de teste do painel: aparece na lista, mas não entra nos números. */
  teste: boolean;
  confirmadoEm: Date;
  prontoEm: Date | null;
  entregueEm: Date | null;
  /** Foto anexada ao confirmar (ex.: o modelo do bolo); referência no armazenamento, null = sem anexo. */
  anexo?: string | null;
}

/** Se o aviso ao cliente saiu: NAO_ENVIADO quase sempre é a janela de 24 h do WhatsApp. */
export type SituacaoAviso = 'ENVIADO' | 'NAO_PEDIDO' | 'NAO_ENVIADO';

/** Aba "Números": entregues nos últimos dias e o que está em andamento agora. */
export interface NumerosPedidos {
  dias: number;
  faturamento: number;
  entregues: number;
  valorMedio: number;
  emAndamento: number;
  valorEmAndamento: number;
  entreguesRecentes: Pedido[];
}

/** O que o cliente recebe pelo WhatsApp numa ação do pedido (vazio = não avisa). */
export interface AvisoCliente {
  enviar: boolean;
  texto: string;
}

/**
 * O total que o assistente calculou na conversa ("Total": "R$ 127,50"), para já vir preenchido na confirmação.
 * null quando o resumo não tem total (o lojista digita).
 */
export function totalDoResumo(resumo: ItemResumoPedido[]): number | null {
  const total = resumo.find((item) => item.campo.trim().toLowerCase().startsWith('total'));
  const numero = total?.valor.match(/\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:,\d{1,2})?/);
  if (!numero) {
    return null;
  }
  const valor = Number(numero[0].replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(valor) ? valor : null;
}

/** Primeiro nome do cliente, para as mensagens ("Oi, João!"). */
export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? '';
}
