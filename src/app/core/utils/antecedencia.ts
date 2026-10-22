import { UnidadeAntecedencia } from '../models/perfil.model';
import { DIAS_SEMANA } from './datas-agenda';

const MINUTOS_POR_UNIDADE: Record<UnidadeAntecedencia, number> = { MINUTOS: 1, HORAS: 60, DIAS: 24 * 60 };
const MINUTOS_POR_DIA = 24 * 60;

/** Número + unidade do formulário -> minutos para o backend. */
export function antecedenciaEmMinutos(valor: number | string, unidade: UnidadeAntecedencia): number {
  return Math.max(0, Math.round(Number(valor) || 0)) * MINUTOS_POR_UNIDADE[unidade];
}

/** Minutos salvos -> o jeito mais natural de mostrar: dias, horas cheias ou minutos. */
export function antecedenciaNaTela(minutos: number): { valor: number; unidade: UnidadeAntecedencia } {
  if (minutos > 0 && minutos % MINUTOS_POR_DIA === 0) {
    return { valor: minutos / MINUTOS_POR_DIA, unidade: 'DIAS' };
  }
  if (minutos % 60 === 0) {
    return { valor: minutos / 60, unidade: 'HORAS' };
  }
  return { valor: minutos, unidade: 'MINUTOS' };
}

/**
 * A mesma conta do backend (JanelaPedido): a partir de 24 h, 1 hora de folga a cada 24 h; arredonda para cima nos
 * 5 minutos. Mostra ao lojista o que o assistente vai dizer, com um pedido feito numa quarta às 16:30.
 */
export function exemploAntecedencia(minutos: number): string {
  if (minutos <= 0) {
    return 'Pronta entrega: o pedido pode sair na hora, dentro do horário de funcionamento.';
  }
  const efetivo = minutos < MINUTOS_POR_DIA ? minutos : minutos - Math.floor(minutos / 24);
  const pedido = new Date(2026, 9, 21, 16, 30); // uma quarta-feira
  const pronto = new Date(pedido.getTime() + efetivo * 60_000);
  const resto = pronto.getMinutes() % 5;
  if (resto > 0) {
    pronto.setMinutes(pronto.getMinutes() + 5 - resto);
  }
  const dias = Math.round((inicioDoDia(pronto) - inicioDoDia(pedido)) / 86_400_000);
  const dia = dias === 0 ? 'na própria quarta' : `${dias > 6 ? 'em ' + dias + ' dias, na ' : ''}${nomeDoDia(pronto)}`;
  const hora = `${String(pronto.getHours()).padStart(2, '0')}:${String(pronto.getMinutes()).padStart(2, '0')}`;
  return `Ex.: pedido feito na quarta às 16:30 pode sair a partir de ${dia} às ${hora} (dentro do horário de funcionamento).`;
}

function inicioDoDia(data: Date): number {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate()).getTime();
}

function nomeDoDia(data: Date): string {
  return DIAS_SEMANA[(data.getDay() + 6) % 7].nome;
}
