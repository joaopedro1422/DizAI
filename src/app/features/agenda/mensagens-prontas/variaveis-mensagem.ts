import { Agendamento, NovaMensagemPronta } from '../../../core/models/agenda.model';
import { diaPorExtenso } from '../../../core/utils/datas-agenda';

/** Pedaços que o lojista pode usar no texto; viram os dados do agendamento na hora de enviar. */
export const VARIAVEIS_MENSAGEM = [
  { chave: '{nome}', rotulo: 'Nome', exemplo: 'Maria' },
  { chave: '{data}', rotulo: 'Data', exemplo: 'quarta, 24/10' },
  { chave: '{horario}', rotulo: 'Horário', exemplo: '14:00' },
  { chave: '{servico}', rotulo: 'Serviço', exemplo: 'Manicure' },
];

/** Modelos oferecidos com um toque quando a loja ainda não tem nenhuma mensagem pronta. */
export const SUGESTOES_MENSAGEM: NovaMensagemPronta[] = [
  {
    titulo: 'Lembrete',
    texto: 'Olá, {nome}! Passando para lembrar do seu horário de {servico} {data} às {horario}. Podemos confirmar? 😊',
  },
  {
    titulo: 'Endereço',
    texto: 'Olá, {nome}! Nosso endereço é [rua, número e bairro]. Qualquer dúvida para chegar, é só chamar. Até {data} às {horario}!',
  },
  {
    titulo: 'Pós-atendimento',
    texto: 'Oi, {nome}! Obrigada pela visita 💚 Se puder, conta pra gente o que achou do atendimento.',
  },
];

/** Troca {nome}, {data}, {horario} e {servico} pelos dados do agendamento (nome: só o primeiro). */
export function preencherMensagem(texto: string, agendamento: Agendamento): string {
  const valores: Record<string, string> = {
    '{nome}': agendamento.nomeCliente.trim().split(/\s+/)[0] ?? '',
    '{data}': diaPorExtenso(agendamento.data),
    '{horario}': agendamento.inicio,
    '{servico}': agendamento.servicos,
  };
  return texto.replace(/\{(nome|data|horario|servico)\}/g, (chave) => valores[chave] ?? chave);
}
