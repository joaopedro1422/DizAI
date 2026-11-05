import { minutosDoDia } from '../../../core/utils/datas-agenda';

export interface Trecho {
  inicio: string;
  fim: string;
}

/** Quem liga o dia ganha o horário mais comum: manhã e tarde com pausa para o almoço. */
export const DIA_PADRAO: Trecho[] = [
  { inicio: '08:00', fim: '12:00' },
  { inicio: '13:00', fim: '18:00' },
];

export const MAXIMO_PERIODOS_POR_DIA = 4;

export function validarDia(trechos: Trecho[]): string | null {
  if (trechos.some((t) => minutosDoDia(t.inicio) >= minutosDoDia(t.fim))) {
    return 'O fim de cada período precisa ser depois do início.';
  }
  const ordenados = [...trechos].sort((a, b) => minutosDoDia(a.inicio) - minutosDoDia(b.inicio));
  for (let i = 1; i < ordenados.length; i++) {
    if (minutosDoDia(ordenados[i].inicio) < minutosDoDia(ordenados[i - 1].fim)) {
      return 'Os períodos deste dia estão se sobrepondo.';
    }
  }
  return null;
}

export function paraHora(minutos: number): string {
  return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
}
