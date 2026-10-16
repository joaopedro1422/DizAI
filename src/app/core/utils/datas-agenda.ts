import { DiaSemana } from '../models/agenda.model';

/** Os dias da semana na ordem da tela (segunda primeiro), com os rótulos usados na agenda. */
export const DIAS_SEMANA: { valor: DiaSemana; letra: string; curto: string; nome: string }[] = [
  { valor: 'MONDAY', letra: 'S', curto: 'Seg', nome: 'segunda' },
  { valor: 'TUESDAY', letra: 'T', curto: 'Ter', nome: 'terça' },
  { valor: 'WEDNESDAY', letra: 'Q', curto: 'Qua', nome: 'quarta' },
  { valor: 'THURSDAY', letra: 'Q', curto: 'Qui', nome: 'quinta' },
  { valor: 'FRIDAY', letra: 'S', curto: 'Sex', nome: 'sexta' },
  { valor: 'SATURDAY', letra: 'S', curto: 'Sáb', nome: 'sábado' },
  { valor: 'SUNDAY', letra: 'D', curto: 'Dom', nome: 'domingo' },
];

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** Data local de hoje em "AAAA-MM-DD". */
export function hojeIso(): string {
  return paraIso(new Date());
}

export function paraIso(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

/** "AAAA-MM-DD" vira Date ao meio-dia local (sem risco de virar o dia por fuso). */
export function deIso(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia, 12);
}

export function somarDias(iso: string, dias: number): string {
  const data = deIso(iso);
  data.setDate(data.getDate() + dias);
  return paraIso(data);
}

/** Lista de datas a partir de "inicio", inclusive. */
export function proximosDias(inicio: string, quantidade: number): string[] {
  return Array.from({ length: quantidade }, (_, i) => somarDias(inicio, i));
}

/** Rótulos do dia (segunda primeiro: getDay() do JS começa no domingo). */
export function infoDia(iso: string): (typeof DIAS_SEMANA)[number] {
  return DIAS_SEMANA[(deIso(iso).getDay() + 6) % 7];
}

/** { semana: "Qua", numero: "24", mes: "out" } para os chips da faixa de dias. */
export function partesDoDia(iso: string): { semana: string; numero: string; mes: string } {
  const data = deIso(iso);
  return { semana: infoDia(iso).curto, numero: String(data.getDate()), mes: MESES[data.getMonth()] };
}

/** "quarta, 24/10" (o mesmo formato que a mensagem do WhatsApp e a IA usam). */
export function diaPorExtenso(iso: string): string {
  const [, mes, dia] = iso.split('-');
  return `${infoDia(iso).nome}, ${dia}/${mes}`;
}

/** 90 → "1h30", 60 → "1h", 45 → "45 min". */
export function formatarDuracao(minutos: number): string {
  if (minutos < 60) {
    return `${minutos} min`;
  }
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas}h` : `${horas}h${String(resto).padStart(2, '0')}`;
}

/** "08:30" → 510 */
export function minutosDoDia(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}
