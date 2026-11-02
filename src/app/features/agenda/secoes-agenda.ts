import { NomeIcone } from '../../shared/components/icone/icones';

/** As páginas da agenda, escolhidas no menu lateral. */
export type SecaoAgenda =
  | 'agendamentos'
  | 'numeros'
  | 'retornos'
  | 'horarios'
  | 'equipe'
  | 'mensagens'
  | 'lista-espera';

/** As páginas de configuração: um único formulário (HorariosAtendimentoComponent), cada uma com a sua parte. */
export type SecaoConfiguracao = Extract<SecaoAgenda, 'horarios' | 'equipe' | 'mensagens' | 'lista-espera'>;

export interface InfoSecaoAgenda {
  valor: SecaoAgenda;
  titulo: string;
  /** Uma linha sobre o que a página tem (no topo do computador); vazia = sem a linha. */
  descricao: string;
  icone: NomeIcone;
}

export const SECOES_DA_AGENDA: InfoSecaoAgenda[] = [
  { valor: 'agendamentos', titulo: 'Agendamentos', descricao: '', icone: 'calendario' },
  { valor: 'numeros', titulo: 'Números', descricao: 'Faturamento, atendimentos e clientes', icone: 'grafico' },
  { valor: 'retornos', titulo: 'Retornos', descricao: 'O dia em que o cliente deve voltar e o lembrete para agendar', icone: 'retorno' },
];

export const SECOES_DE_CONFIGURACAO: InfoSecaoAgenda[] = [
  { valor: 'horarios', titulo: 'Horários', descricao: 'Dias e horários de atendimento, intervalo e antecedência', icone: 'relogio' },
  { valor: 'equipe', titulo: 'Equipe', descricao: 'Quem atende os clientes na agenda', icone: 'pessoas' },
  { valor: 'mensagens', titulo: 'Lembretes e mensagens', descricao: 'Confirmação, lembrete e agradecimento pelo WhatsApp', icone: 'sino' },
  { valor: 'lista-espera', titulo: 'Lista de espera', descricao: 'Quem espera uma vaga nos dias lotados', icone: 'listaRepetida' },
];

export function infoDaSecao(secao: SecaoAgenda): InfoSecaoAgenda {
  return [...SECOES_DA_AGENDA, ...SECOES_DE_CONFIGURACAO].find((info) => info.valor === secao)!;
}

export function ehConfiguracao(secao: SecaoAgenda): secao is SecaoConfiguracao {
  return SECOES_DE_CONFIGURACAO.some((info) => info.valor === secao);
}
