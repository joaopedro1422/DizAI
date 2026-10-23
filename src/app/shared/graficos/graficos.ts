/**
 * Ajudantes dos gráficos dos Números (agenda e pedidos): datas dos pontos, o topo "redondo" do eixo e os meses do
 * seletor. Os gráficos são HTML/CSS (sem biblioteca); o estilo comum fica em numeros-agenda.component.css.
 */

/** Quantos meses o seletor mostra (o atual e os anteriores). */
const MESES_NO_SELETOR = 12;

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

/** Dias entre dois pontos da série (1 = por dia, 7 = por semana). */
export function passoDaSerie(serie: { inicio: string }[]): number {
  if (serie.length < 2) return 1;
  return Math.round((deIso(serie[1].inicio).getTime() - deIso(serie[0].inicio).getTime()) / 86_400_000);
}

/** Título da dica de um ponto: "Qui, 23/10" ou "Semana de 06/10". */
export function tituloDoPonto(inicio: string, passo: number): string {
  const data = deIso(inicio);
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
