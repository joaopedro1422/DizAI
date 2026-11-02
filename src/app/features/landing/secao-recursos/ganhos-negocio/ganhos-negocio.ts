import { NomeIcone } from '../../../../shared/components/icone/icones';
import type { TipoNegocio } from '../secao-recursos.component';

/**
 * "O que muda no seu negócio": não a lista de funcionalidades, e sim o problema do dia a dia que cada uma resolve.
 * Curto e direto: desafio = a dor numa frase; titulo = o ganho; texto = uma linha; antes/depois = o contraste.
 */
export interface GanhoNegocio {
  icone: NomeIcone;
  desafio: string;
  titulo: string;
  texto: string;
  antes: string;
  depois: string;
}

export const GANHOS_NEGOCIO: Record<TipoNegocio, GanhoNegocio[]> = {
  produtos: [
    {
      icone: 'raio',
      desafio: 'Cliente esperando 30 minutos pelo catálogo.',
      titulo: 'Seu negócio apresentado em segundos.',
      texto: 'Preços e catálogo na hora, com o interesse ainda quente.',
      antes: '30 min',
      depois: 'Segundos',
    },
    {
      icone: 'estrela',
      desafio: 'Na correria, a resposta sai seca ou fica para depois.',
      titulo: 'Atendimento impecável, 24 horas.',
      texto: 'Cordial e profissional, de madrugada ou no pico do movimento.',
      antes: 'Depende do dia',
      depois: 'Sempre no mesmo nível',
    },
    {
      icone: 'pessoa',
      desafio: 'Parar a produção a cada "quanto custa?".',
      titulo: 'Você só entra para fechar.',
      texto: 'O assistente cuida das dúvidas. Você confirma o pedido e o pagamento.',
      antes: 'Celular na mão o dia todo',
      depois: 'Só na hora de fechar',
    },
    {
      icone: 'caixa',
      desafio: 'Pedido no papel, no print, na memória.',
      titulo: 'Pedidos organizados em uma tela.',
      texto: 'Do confirmado ao entregue, com aviso ao cliente em um toque.',
      antes: 'Pedido perdido',
      depois: 'Tudo à vista',
    },
    {
      icone: 'grafico',
      desafio: 'Fechar o mês sem saber quanto vendeu.',
      titulo: 'Seus números na palma da mão.',
      texto: 'Faturamento, dias que mais vendem e melhores clientes, prontos.',
      antes: 'Caderno e planilha',
      depois: 'Painel pronto',
    },
    {
      icone: 'brilho',
      desafio: 'Instagram parado por falta de tempo.',
      titulo: 'Posts profissionais em 3 toques.',
      texto: 'Com a sua logo, as suas cores e os seus preços.',
      antes: 'Horas no Canva',
      depois: 'Menos de 1 minuto',
    },
  ],
  servicos: [
    {
      icone: 'calendario',
      desafio: 'Parar o atendimento para responder "tem horário?".',
      titulo: 'Agenda cheia sem pegar no celular.',
      texto: 'O assistente marca, remarca e cancela direto na sua agenda.',
      antes: 'Interromper o cliente',
      depois: 'Marcado sozinho',
    },
    {
      icone: 'sino',
      desafio: 'Cliente que esquece e deixa a cadeira vazia.',
      titulo: 'Menos faltas, nenhum horário perdido.',
      texto: 'Lembrete, confirmação de presença e lista de espera.',
      antes: 'Horário vazio',
      depois: 'Vaga preenchida',
    },
    {
      icone: 'retorno',
      desafio: 'A manutenção passa da data e o cliente some.',
      titulo: 'Clientes que voltam no tempo certo.',
      texto: 'Lembrete de retorno na véspera e agradecimento depois.',
      antes: 'Cliente esquecido',
      depois: 'Cliente de volta',
    },
    {
      icone: 'estrela',
      desafio: 'Mensagem das 23h respondida só no dia seguinte.',
      titulo: 'Atendimento impecável, 24 horas.',
      texto: 'Quem chama à noite já sai com o horário marcado.',
      antes: 'Responde amanhã',
      depois: 'Agendado na hora',
    },
    {
      icone: 'grafico',
      desafio: 'Não saber quanto cada serviço rende.',
      titulo: 'Seus números na palma da mão.',
      texto: 'Faturamento, ocupação e valor por profissional, prontos.',
      antes: 'Conta de cabeça',
      depois: 'Painel pronto',
    },
    {
      icone: 'brilho',
      desafio: 'Horários livres que ninguém fica sabendo.',
      titulo: 'Posts profissionais em 3 toques.',
      texto: 'Divulgue a agenda da semana com a sua cara.',
      antes: 'Horas no Canva',
      depois: 'Menos de 1 minuto',
    },
  ],
};
