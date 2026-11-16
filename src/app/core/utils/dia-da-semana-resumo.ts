import { ItemResumoPedido } from '../models/conversa.model';

const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const CAMPO_DE_DATA = /data|dia|quando|prazo|entrega|retirada/i;
/** O texto já diz o dia (ou é relativo): não mexe. */
const JA_TEM_DIA = /segunda|ter[cç]a|quarta|quinta|sexta|s[aá]bado|domingo|hoje|amanh/i;
const DIA_MES = /(?<!\d)(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?(?!\d)/;

/**
 * A data do resumo com o dia da semana: o assistente grava "18/11" e a tela mostra "Quarta, 18/11" (no meio do texto,
 * "Retirada às 15h, quarta, 18/11"). O ano é o deste ano ou, se a data já passou faz mais de uma semana, o próximo
 * (pedido de dezembro para janeiro), a mesma conta do backend (DataDoPedido).
 */
export function comDiaDaSemana(valor: string, hoje = new Date()): string {
  if (JA_TEM_DIA.test(valor)) return valor;
  const m = valor.match(DIA_MES);
  if (!m || m.index === undefined) return valor;
  const dia = Number(m[1]);
  const mes = Number(m[2]) - 1;
  let ano = m[3] ? Number(m[3]) + (m[3].length === 2 ? 2000 : 0) : hoje.getFullYear();
  let data = new Date(ano, mes, dia, 12);
  if (data.getMonth() !== mes) return valor;
  if (!m[3]) {
    const umaSemanaAtras = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 7, 12);
    if (data < umaSemanaAtras) {
      ano += 1;
      data = new Date(ano, mes, dia, 12);
    }
  }
  const nome = DIAS[data.getDay()];
  const noComeco = m.index === 0;
  const prefixo = noComeco ? nome.charAt(0).toUpperCase() + nome.slice(1) : nome;
  return `${valor.slice(0, m.index)}${prefixo}, ${valor.slice(m.index)}`;
}

/** Os itens do resumo com o dia da semana nos campos de data. */
export function resumoComDiaDaSemana(itens: ItemResumoPedido[]): ItemResumoPedido[] {
  return itens.map((item) => (CAMPO_DE_DATA.test(item.campo) ? { ...item, valor: comDiaDaSemana(item.valor) } : item));
}
