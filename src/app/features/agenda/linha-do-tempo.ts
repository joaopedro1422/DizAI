import { Agendamento } from '../../core/models/agenda.model';
import { minutosDoDia } from '../../core/utils/datas-agenda';

/** A grade da linha do tempo: 30 minutos ocupam 48 px. */
export const MINUTOS_POR_LINHA = 30;
export const PIXELS_POR_MINUTO = 1.6;

/**
 * agendamento: um cliente marcado. livre: dentro do expediente e sem ninguém (dá para agendar).
 * passou: livre, mas o horário já passou (hoje; a tela deixa só o espaço). fechado: fora do expediente (almoço, antes de abrir...).
 */
export type TipoBloco = 'agendamento' | 'livre' | 'passou' | 'fechado';

export interface BlocoLinhaDoTempo {
  tipo: TipoBloco;
  /** Minutos desde 00:00. */
  inicio: number;
  fim: number;
  topo: number;
  altura: number;
  /** "09:30" e "10:30", para mostrar no bloco. */
  textoInicio: string;
  textoFim: string;
  agendamento?: Agendamento;
  /** Agendamento acontecendo agora (a linha do agora passa por cima dele). */
  emAndamento: boolean;
}

export interface MarcaLinhaDoTempo {
  topo: number;
  texto: string;
  /** Hora cheia (linha contínua) ou meia hora (linha tracejada). */
  cheia: boolean;
  /** Algum atendimento começa aqui: o horário fica em destaque na lateral. */
  destaque: boolean;
}

export interface LinhaDoTempo {
  altura: number;
  /** Horas cheias e as meias horas em que algum agendamento começa ou termina. */
  marcas: MarcaLinhaDoTempo[];
  /** Começos e fins fora da grade de 30 min (ex.: 09:45): marcados na lateral, à parte. */
  marcasExtras: { topo: number; texto: string }[];
  blocos: BlocoLinhaDoTempo[];
  /** Linha do "agora" (só hoje e dentro do dia mostrado). */
  agora: { topo: number; texto: string } | null;
}

interface Intervalo {
  inicio: number;
  fim: number;
}

/**
 * Monta a linha do tempo de um dia: do primeiro ao último horário (expediente ou agendamento), arredondado para
 * a meia hora. Todo minuto desse trecho cai em exatamente um bloco: agendamento, livre, passou ou fechado.
 * agoraMinutos: só para hoje (o livre que já passou vira "passou" e aparece a linha do agora).
 */
export function montarLinhaDoTempo(
  periodos: { inicio: string; fim: string }[],
  agendamentos: Agendamento[],
  agoraMinutos: number | null,
): LinhaDoTempo | null {
  const expediente = unir(periodos.map((p) => ({ inicio: minutosDoDia(p.inicio), fim: minutosDoDia(p.fim) })));
  const marcados = [...agendamentos]
    .map((a) => ({ agendamento: a, inicio: minutosDoDia(a.inicio), fim: fimDoAgendamento(a) }))
    .sort((a, b) => a.inicio - b.inicio);
  if (expediente.length === 0 && marcados.length === 0) {
    return null;
  }

  const todos = [...expediente, ...marcados];
  const inicioDia = Math.floor(Math.min(...todos.map((t) => t.inicio)) / MINUTOS_POR_LINHA) * MINUTOS_POR_LINHA;
  const fimDia = Math.ceil(Math.max(...todos.map((t) => t.fim)) / MINUTOS_POR_LINHA) * MINUTOS_POR_LINHA;
  const topo = (minutos: number) => (minutos - inicioDia) * PIXELS_POR_MINUTO;
  const bloco = (tipo: TipoBloco, inicio: number, fim: number, agendamento?: Agendamento): BlocoLinhaDoTempo => ({
    tipo,
    inicio,
    fim,
    topo: topo(inicio),
    altura: (fim - inicio) * PIXELS_POR_MINUTO,
    textoInicio: formatarMinutos(inicio),
    textoFim: formatarMinutos(fim),
    agendamento,
    emAndamento: tipo === 'agendamento' && agoraMinutos !== null && inicio <= agoraMinutos && agoraMinutos < fim,
  });

  const blocos: BlocoLinhaDoTempo[] = marcados.map((m) => bloco('agendamento', m.inicio, m.fim, m.agendamento));

  // o que sobra do dia sem agendamento: livre (ou passou) dentro do expediente, fechado fora dele
  const ocupado = unir(marcados);
  for (const vazio of subtrair([{ inicio: inicioDia, fim: fimDia }], ocupado)) {
    for (const trecho of dividirPorExpediente(vazio, expediente)) {
      if (!trecho.aberto) {
        blocos.push(bloco('fechado', trecho.inicio, trecho.fim));
      } else if (agoraMinutos === null || trecho.inicio >= agoraMinutos) {
        blocos.push(bloco('livre', trecho.inicio, trecho.fim));
      } else if (trecho.fim <= agoraMinutos) {
        blocos.push(bloco('passou', trecho.inicio, trecho.fim));
      } else {
        blocos.push(bloco('passou', trecho.inicio, agoraMinutos), bloco('livre', agoraMinutos, trecho.fim));
      }
    }
  }
  blocos.sort((a, b) => a.inicio - b.inicio);

  // horas cheias sempre; meia hora só quando um agendamento começa ou termina nela (14:00–15:00 não mostra 14:30)
  const comecos = new Set(marcados.map((m) => m.inicio));
  const bordas = new Set(marcados.flatMap((m) => [m.inicio, m.fim]));
  const marcas: MarcaLinhaDoTempo[] = [];
  for (let minutos = inicioDia; minutos <= fimDia; minutos += MINUTOS_POR_LINHA) {
    const cheia = minutos % 60 === 0;
    if (!cheia && !bordas.has(minutos)) {
      continue;
    }
    marcas.push({ topo: topo(minutos), texto: formatarMinutos(minutos), cheia, destaque: comecos.has(minutos) });
  }
  const marcasExtras = [...bordas]
    .filter((minutos) => minutos % MINUTOS_POR_LINHA !== 0)
    .sort((a, b) => a - b)
    .map((minutos) => ({ topo: topo(minutos), texto: formatarMinutos(minutos) }));

  const agora =
    agoraMinutos !== null && agoraMinutos >= inicioDia && agoraMinutos <= fimDia
      ? { topo: topo(agoraMinutos), texto: formatarMinutos(agoraMinutos) }
      : null;

  return { altura: topo(fimDia), marcas, marcasExtras, blocos, agora };
}

/** 570 → "09:30" */
export function formatarMinutos(minutos: number): string {
  return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
}

/** O fim que vem do backend; se faltar (ou passar da meia-noite), o início + a duração. */
function fimDoAgendamento(agendamento: Agendamento): number {
  const inicio = minutosDoDia(agendamento.inicio);
  const fim = agendamento.fim ? minutosDoDia(agendamento.fim) : inicio + agendamento.duracaoMinutos;
  return fim <= inicio ? inicio + agendamento.duracaoMinutos : fim;
}

/** Junta intervalos que se encostam ou se cruzam, em ordem. */
function unir(intervalos: Intervalo[]): Intervalo[] {
  const ordenados = intervalos.filter((i) => i.fim > i.inicio).sort((a, b) => a.inicio - b.inicio);
  const unidos: Intervalo[] = [];
  for (const atual of ordenados) {
    const ultimo = unidos[unidos.length - 1];
    if (ultimo && atual.inicio <= ultimo.fim) {
      ultimo.fim = Math.max(ultimo.fim, atual.fim);
    } else {
      unidos.push({ inicio: atual.inicio, fim: atual.fim });
    }
  }
  return unidos;
}

/** Os pedaços de "base" que não caem em nenhum de "tirar" (os dois em ordem e sem sobreposição). */
function subtrair(base: Intervalo[], tirar: Intervalo[]): Intervalo[] {
  const resultado: Intervalo[] = [];
  for (const b of base) {
    let inicio = b.inicio;
    for (const t of tirar) {
      if (t.fim <= inicio || t.inicio >= b.fim) {
        continue;
      }
      if (t.inicio > inicio) {
        resultado.push({ inicio, fim: t.inicio });
      }
      inicio = Math.max(inicio, t.fim);
    }
    if (inicio < b.fim) {
      resultado.push({ inicio, fim: b.fim });
    }
  }
  return resultado;
}

/** Corta um trecho vazio nas bordas do expediente: o que está dentro fica aberto; o resto, fechado. */
function dividirPorExpediente(trecho: Intervalo, expediente: Intervalo[]): (Intervalo & { aberto: boolean })[] {
  const abertos = expediente
    .map((e) => ({ inicio: Math.max(e.inicio, trecho.inicio), fim: Math.min(e.fim, trecho.fim) }))
    .filter((e) => e.fim > e.inicio);
  const fechados = subtrair([trecho], abertos);
  return [...abertos.map((a) => ({ ...a, aberto: true })), ...fechados.map((f) => ({ ...f, aberto: false }))];
}
