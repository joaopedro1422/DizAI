import { DiaSemana, HorarioLoja } from '../../core/models/loja-publica.model';

/** Domingo = 0, como o Date.getDay(). */
const DIAS: DiaSemana[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const NOMES: Record<DiaSemana, string> = {
  MONDAY: 'Segunda', TUESDAY: 'Terça', WEDNESDAY: 'Quarta', THURSDAY: 'Quinta',
  FRIDAY: 'Sexta', SATURDAY: 'Sábado', SUNDAY: 'Domingo',
};
/** A semana na ordem do comércio: segunda primeiro. */
const ORDEM_DA_SEMANA: DiaSemana[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export interface SituacaoLoja {
  aberta: boolean;
  /** "Aberto agora · fecha às 19h" ou "Fechado · abre amanhã às 9h". */
  texto: string;
}

export interface DiaDaSemana {
  nome: string;
  /** "8h às 12h · 13h às 18h" ou "Fechado". */
  horario: string;
  hoje: boolean;
}

/** Selo do cartão do topo; null sem horários cadastrados. */
export function situacaoAgora(horarios: HorarioLoja[], agora = new Date()): SituacaoLoja | null {
  if (horarios.length === 0) {
    return null;
  }
  const minutos = agora.getHours() * 60 + agora.getMinutes();
  const deHoje = periodosDoDia(horarios, DIAS[agora.getDay()]);
  const atual = deHoje.find((p) => minutos >= p.inicio && minutos < p.fim);
  if (atual) {
    // períodos emendados (12:00–12:00) contam como um só
    let fim = atual.fim;
    for (const p of deHoje) {
      if (p.inicio === fim) {
        fim = p.fim;
      }
    }
    return { aberta: true, texto: `Aberto agora · fecha às ${hora(fim)}` };
  }
  for (let dias = 0; dias < 8; dias++) {
    const dia = DIAS[(agora.getDay() + dias) % 7];
    const proximo = periodosDoDia(horarios, dia).find((p) => dias > 0 || p.inicio > minutos);
    if (proximo) {
      return { aberta: false, texto: `Fechado · abre ${quando(dias, dia)} às ${hora(proximo.inicio)}` };
    }
  }
  return null;
}

/** As 7 linhas da seção Informações, com o dia de hoje marcado. */
export function semana(horarios: HorarioLoja[], agora = new Date()): DiaDaSemana[] {
  const hoje = DIAS[agora.getDay()];
  return ORDEM_DA_SEMANA.map((dia) => {
    const periodos = periodosDoDia(horarios, dia);
    return {
      nome: NOMES[dia],
      horario: periodos.length ? periodos.map((p) => `${hora(p.inicio)} às ${hora(p.fim)}`).join(' · ') : 'Fechado',
      hoje: dia === hoje,
    };
  });
}

function periodosDoDia(horarios: HorarioLoja[], dia: DiaSemana): { inicio: number; fim: number }[] {
  return horarios
    .filter((h) => h.diaSemana === dia)
    .map((h) => ({ inicio: emMinutos(h.inicio), fim: emMinutos(h.fim) }))
    .sort((a, b) => a.inicio - b.inicio);
}

function emMinutos(texto: string): number {
  const [h, m] = texto.split(':').map(Number);
  return h * 60 + (m || 0);
}

/** 540 -> "9h"; 1110 -> "18h30". */
function hora(minutos: number): string {
  const h = Math.floor(minutos / 60) % 24;
  const m = minutos % 60;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

function quando(dias: number, dia: DiaSemana): string {
  if (dias === 0) {
    return 'hoje';
  }
  if (dias === 1) {
    return 'amanhã';
  }
  return NOMES[dia].toLowerCase();
}
