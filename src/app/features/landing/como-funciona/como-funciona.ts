import { NomeIcone } from '../../../shared/components/icone/icones';

export type TipoComoFunciona = 'servicos' | 'produtos';

/** Um passo do "Como funciona": o texto à esquerda, quanto tempo fica na tela e o selo que aparece ao lado do celular. */
export interface PassoComoFunciona {
  titulo: string;
  texto: string;
  duracaoMs: number;
  selo: { icone: NomeIcone; texto: string };
}

/** Uma mensagem da conversa relâmpago do passo 3. */
export interface MensagemComoFunciona {
  de: 'cliente' | 'loja';
  texto: string;
  hora: string;
}

/** O que cada tipo mostra no celular: o cadastro (passo 1) e a conversa que usa esse cadastro (passo 3). */
export interface RoteiroComoFunciona {
  loja: string;
  inicial: string;
  cor: string;
  numero: string;
  /** "Novo serviço" / "Novo produto" e os campos já preenchidos. */
  tituloCadastro: string;
  campos: { rotulo: string; valor: string; destaque?: boolean }[];
  /** Os chips de opções (tamanhos, sabores) no fim do formulário. */
  opcoes: { rotulo: string; valores: string[] } | null;
  /**
   * A segunda tela do passo 1, que desliza por cima do cadastro: os dias de atendimento (serviços) ou uma pergunta
   * frequente (produtos), que a conversa do passo 3 usa.
   */
  extra:
    | { tipo: 'agenda'; titulo: string; dias: { dia: string; horario: string; aberto: boolean }[] }
    | { tipo: 'pergunta'; titulo: string; pergunta: string; resposta: string };
  conversa: MensagemComoFunciona[];
  /** O aviso que desce no topo do celular no fim da conversa. */
  aviso: { titulo: string; texto: string };
}

export const PASSOS_COMO_FUNCIONA: Record<TipoComoFunciona, PassoComoFunciona[]> = {
  servicos: [
    {
      titulo: 'Cadastre os seus serviços e configure a agenda',
      texto: 'Nome, preço, duração e os dias em que você atende. Em poucos minutos o assistente conhece o seu negócio.',
      duracaoMs: 8200,
      selo: { icone: 'relogio', texto: 'Pronto em minutos' },
    },
    {
      titulo: 'Conecte o seu WhatsApp',
      texto: 'O mesmo número de sempre. Contatos pessoais ficam de fora.',
      duracaoMs: 3400,
      selo: { icone: 'celular', texto: 'Seu número de sempre' },
    },
    {
      titulo: 'Ele atende e agenda sozinho',
      texto: 'Responde com o que você cadastrou e marca o horário direto na sua agenda.',
      duracaoMs: 6200,
      selo: { icone: 'calendario', texto: 'Agendado sem você tocar no celular' },
    },
  ],
  produtos: [
    {
      titulo: 'Cadastre os seus produtos',
      texto: 'Preço, tamanhos e as perguntas frequentes. Em poucos minutos o assistente conhece o seu negócio.',
      duracaoMs: 8200,
      selo: { icone: 'relogio', texto: 'Pronto em minutos' },
    },
    {
      titulo: 'Conecte o seu WhatsApp',
      texto: 'O mesmo número de sempre. Contatos pessoais ficam de fora.',
      duracaoMs: 3400,
      selo: { icone: 'celular', texto: 'Seu número de sempre' },
    },
    {
      titulo: 'Ele atende e anota o pedido',
      texto: 'Responde com o que você cadastrou, anota o pedido e te chama só para confirmar.',
      duracaoMs: 8400,
      selo: { icone: 'caixa', texto: 'Pedido anotado sem você tocar no celular' },
    },
  ],
};

export const ROTEIROS_COMO_FUNCIONA: Record<TipoComoFunciona, RoteiroComoFunciona> = {
  servicos: {
    loja: 'Studio Bella',
    inicial: 'B',
    cor: '#B4466A',
    numero: '(83) 99812-0000',
    tituloCadastro: 'Novo serviço',
    campos: [
      { rotulo: 'Nome', valor: 'Esmaltação em gel' },
      { rotulo: 'Preço', valor: 'R$ 60,00', destaque: true },
      { rotulo: 'Duração', valor: '1h15', destaque: true },
    ],
    opcoes: null,
    extra: {
      tipo: 'agenda',
      titulo: 'Horários de atendimento',
      dias: [
        { dia: 'Segunda', horario: '09:00 – 18:00', aberto: true },
        { dia: 'Terça', horario: '09:00 – 18:00', aberto: true },
        { dia: 'Quarta', horario: '09:00 – 18:00', aberto: true },
        { dia: 'Quinta', horario: '09:00 – 18:00', aberto: true },
        { dia: 'Sexta', horario: '09:00 – 18:00', aberto: true },
        { dia: 'Sábado', horario: '08:00 – 13:00', aberto: true },
        { dia: 'Domingo', horario: 'Fechado', aberto: false },
      ],
    },
    conversa: [
      { de: 'cliente', texto: 'Oi! Quanto custa a esmaltação em gel?', hora: '21:42' },
      { de: 'loja', texto: 'Custa R$ 60,00 e leva 1h15. Tenho amanhã às 14:00 ou às 16:30. Qual prefere?', hora: '21:42' },
      { de: 'cliente', texto: '16:30! Fernanda', hora: '21:43' },
      { de: 'loja', texto: 'Agendado! ✅\n📅 Amanhã, 16:30\n👤 Fernanda', hora: '21:43' },
    ],
    aviso: { titulo: 'Novo horário na agenda', texto: 'Fernanda · amanhã às 16:30' },
  },
  produtos: {
    loja: 'Doce Encanto',
    inicial: 'D',
    cor: '#B4466A',
    numero: '(83) 99812-0000',
    tituloCadastro: 'Novo produto',
    campos: [
      { rotulo: 'Nome', valor: 'Bolo festivo' },
      { rotulo: 'Preço', valor: 'a partir de R$ 90,00', destaque: true },
    ],
    opcoes: { rotulo: 'Tamanhos', valores: ['P · R$ 90', 'M · R$ 150', 'G · R$ 210'] },
    extra: {
      tipo: 'pergunta',
      titulo: 'Nova pergunta frequente',
      pergunta: 'Quais as formas de pagamento?',
      resposta: 'Pix, cartão ou dinheiro. No Pix, 5% de desconto.',
    },
    conversa: [
      { de: 'cliente', texto: 'Oi! Tem bolo festivo para 20 pessoas no sábado?', hora: '22:08' },
      { de: 'loja', texto: 'Temos sim! O M serve 20 pessoas e custa R$ 150,00. Entrega ou retirada?', hora: '22:08' },
      { de: 'cliente', texto: 'Retirada às 15h. Quais as formas de pagamento?', hora: '22:09' },
      { de: 'loja', texto: 'Pix, cartão ou dinheiro. No Pix, 5% de desconto.', hora: '22:09' },
      { de: 'cliente', texto: 'Pix então!', hora: '22:09' },
      { de: 'loja', texto: 'Anotei o seu pedido! Aguarde a confirmação.', hora: '22:10' },
    ],
    aviso: { titulo: 'Pedido para fechar', texto: 'Bolo festivo M · sábado às 15:00' },
  },
};
