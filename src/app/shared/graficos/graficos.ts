/**
 * Ajudantes dos gráficos dos Números (agenda e pedidos): datas dos pontos, o topo "redondo" do eixo e os meses do
 * seletor. Os gráficos são HTML/CSS (sem biblioteca); o estilo comum fica em numeros-agenda.component.css.
 */

/** Quantos meses o seletor mostra (o atual e os anteriores). */
const MESES_NO_SELETOR = 12;
/** O primeiro ano do seletor de ano (o DizAI começou em 2026). */
const PRIMEIRO_ANO = 2026;
/** O "passo" de uma série por mês (filtro por ano): os pontos ficam a 28–31 dias um do outro. */
export const PASSO_MES = 30;

/** O filtro dos Números: últimos dias, um mês do calendário ("2026-10") ou um ano inteiro ("2026"). */
export type FiltroNumeros = { dias: number } | { mes: string } | { ano: string };

/** O ano atual e os anteriores, até o primeiro: ["2027", "2026"]. */
export function anosDisponiveis(): string[] {
  const atual = new Date().getFullYear();
  return Array.from({ length: Math.max(1, atual - PRIMEIRO_ANO + 1) }, (_, i) => String(atual - i));
}

/** Período por extenso, para as notas: "dos últimos 30 dias", "de outubro de 2026" ou "de 2026". */
export function textoDoPeriodo(n: { dias: number; mes: string | null; ano?: string | null }): string {
  if (n.ano) return `de ${n.ano}`;
  return n.mes ? `de ${nomeDoMes(n.mes).toLowerCase()}` : `dos últimos ${n.dias} dias`;
}

/** "por mês", "por semana" ou "por dia", pelo passo da série. */
export function nomeDaSerie(passo: number): string {
  return passo === PASSO_MES ? 'por mês' : passo === 7 ? 'por semana' : 'por dia';
}

/** Rótulo embaixo da coluna: "jan" na série por mês; "23/10" nas outras. */
export function rotuloDoPonto(inicio: string, passo: number): string {
  const data = deIso(inicio);
  return passo === PASSO_MES ? data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '') : diaMes(data);
}

/** O mês atual e os anteriores: { valor: "2026-10", rotulo: "Outubro de 2026" }. */
export function mesesRecentes(): { valor: string; rotulo: string }[] {
  const hoje = new Date();
  return Array.from({ length: MESES_NO_SELETOR }, (_, i) => {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const valor = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
    return { valor, rotulo: nomeDoMes(valor) };
  });
}

/** "2026-10" -> "Outubro de 2026". */
export function nomeDoMes(valor: string): string {
  const [ano, mes] = valor.split('-').map(Number);
  const nome = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} de ${ano}`;
}

/** "2026-10-23" -> Date local (sem fuso). */
export function deIso(data: string): Date {
  const [ano, mes, dia] = data.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

/** "23/10". */
export function diaMes(data: Date): string {
  return `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}`;
}

/** Topo "redondo" do eixo: 137 -> 150, 820 -> 1000 (1, 2, 2,5 ou 5 vezes uma potência de 10). */
export function topoDoEixo(maximo: number): number {
  if (maximo <= 0) return 0;
  const potencia = 10 ** Math.floor(Math.log10(maximo));
  const passo = [1, 2, 2.5, 5, 10].find((p) => p * potencia >= maximo) ?? 10;
  return passo * potencia;
}

/** Dias entre dois pontos da série (1 = por dia, 7 = por semana, PASSO_MES = por mês). */
export function passoDaSerie(serie: { inicio: string }[]): number {
  if (serie.length < 2) return 1;
  const dias = Math.round((deIso(serie[1].inicio).getTime() - deIso(serie[0].inicio).getTime()) / 86_400_000);
  return dias >= 28 ? PASSO_MES : dias;
}

/** Título da dica de um ponto: "Qui, 23/10", "Semana de 06/10" ou "Outubro de 2026". */
export function tituloDoPonto(inicio: string, passo: number): string {
  const data = deIso(inicio);
  if (passo === PASSO_MES) {
    return nomeDoMes(inicio.slice(0, 7));
  }
  if (passo === 7) {
    return `Semana de ${diaMes(data)}`;
  }
  const semana = data.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  return `${semana.charAt(0).toUpperCase()}${semana.slice(1)}, ${diaMes(data)}`;
}

/** "12%", "4,5%". */
export function porcento(valor: number): string {
  return `${valor >= 10 || valor === 0 ? Math.round(valor) : valor.toFixed(1).replace('.', ',')}%`;
}

/** O que a dica (tooltip) mostra e onde, relativo ao gráfico (.grafico). */
export interface Dica {
  grafico: string;
  x: number;
  y: number;
  titulo: string;
  detalhe: string;
}

/** Posição da dica sobre a marca tocada/apontada, sem sair das bordas do gráfico. */
export function dicaSobre(evento: Event, grafico: string, titulo: string, detalhe: string): Dica | null {
  const marca = evento.currentTarget as HTMLElement;
  const area = marca.closest('.grafico') as HTMLElement | null;
  if (!area) return null;
  const caixa = marca.getBoundingClientRect();
  const fundo = area.getBoundingClientRect();
  const meia = 70;   // metade da largura da dica
  const x = Math.min(Math.max(caixa.left + caixa.width / 2 - fundo.left, meia), fundo.width - meia);
  return { grafico, x, y: caixa.top - fundo.top, titulo, detalhe };
}
