import { deIso, hojeIso, infoDia, somarDias } from '../../core/utils/datas-agenda';
import { Pedido } from '../../core/models/pedido.model';

/** "17/11". */
export function diaMesCurto(iso: string): string {
  const [, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
}

/**
 * O nome do dia na tela Pedidos: "Hoje", "Amanhã, 17/11", "Ontem, 15/11" e, nos outros, o dia da semana com a data
 * ("Quarta, 18/11").
 */
export function rotuloDoDia(iso: string, hoje = hojeIso()): string {
  if (iso === hoje) return 'Hoje';
  if (iso === somarDias(hoje, 1)) return `Amanhã, ${diaMesCurto(iso)}`;
  if (iso === somarDias(hoje, -1)) return `Ontem, ${diaMesCurto(iso)}`;
  const nome = infoDia(iso).nome;
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)}, ${diaMesCurto(iso)}`;
}

/** "segunda, 16 de novembro" (embaixo do "Hoje"). */
export function diaPorExtensoLongo(iso: string): string {
  return deIso(iso).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** O dia do pedido ("AAAA-MM-DD"): o paraQuando ou, sem ele (exemplo do tour), o dia em que foi confirmado. */
export function diaDoPedido(pedido: Pedido): string {
  if (pedido.paraQuando) return pedido.paraQuando;
  const d = pedido.confirmadoEm;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Quantos pedidos por dia ("AAAA-MM-DD" → quantidade). */
export function contarPorDia(pedidos: Pedido[]): Map<string, number> {
  const mapa = new Map<string, number>();
  for (const pedido of pedidos) {
    const dia = diaDoPedido(pedido);
    mapa.set(dia, (mapa.get(dia) ?? 0) + 1);
  }
  return mapa;
}

/**
 * A hora escrita no resumo ("sábado, 21/11, às 10:00", "15h"), para ordenar os pedidos do dia; sem hora = no fim.
 * Só lê o item de data/horário (o nome ou os itens podem ter números).
 */
export function horaDoPedido(pedido: Pedido): number {
  const item = pedido.resumo.find((i) => /data|dia|hor|quando|retirada|entrega/i.test(i.campo));
  const hora = item?.valor.replace(/\d{1,2}\/\d{1,2}/g, '').match(/(\d{1,2})(?:[:h](\d{2})?)/);
  if (!hora) return 24 * 60;
  const h = Number(hora[1]);
  const m = Number(hora[2] ?? 0);
  return h < 24 && m < 60 ? h * 60 + m : 24 * 60;
}
