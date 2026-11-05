import type { NomeIcone } from '../../shared/components/icone/icones';
import type { TipoNegocio } from '../demonstracao/conversas-demonstracao';

/**
 * Uma landing por tipo de negócio, sem abas: `/vendas` (produtos: encomendas, pedidos, orçamentos) e `/agendamentos`
 * (serviços com hora marcada). As seções são as mesmas; o que muda são os textos, os exemplos e as conversas, para
 * cada visitante se reconhecer na página. A raiz (`/`) é o hub que leva a uma das duas.
 */
export type TipoLanding = TipoNegocio;

/** Onde cada landing mora (o hub, o cadastro e a demonstração usam). */
export const ROTA_LANDING: Record<TipoLanding, string> = {
  produtos: '/vendas',
  servicos: '/agendamentos',
};

/** O último tipo que o visitante abriu: o hub destaca o cartão dele. */
export const CHAVE_TIPO_VISTO = 'dizai:landing:tipo';

export interface DorLanding {
  icone: NomeIcone;
  titulo: string;
  texto: string;
  /** Uma mensagem de cliente de verdade, para o lojista se reconhecer. */
  citacao: string;
}

/** Uma mensagem de cliente que chegou e ficou sem resposta (a pilha de notificações do "Problema"). */
export interface AvisoSemResposta {
  nome: string;
  cor: string;
  texto: string;
  quando: string;
}

export interface ConteudoLanding {
  tituloPagina: string;
  hero: {
    etiqueta: string;
    /** O título em três partes: antes, a palavra destacada (sublinhada em verde) e depois. */
    titulo: [string, string, string];
    /** A descrição com o trecho em negrito na frente. */
    descricaoForte: string;
    descricao: string;
    garantias: string[];
  };
  dores: { sobretitulo: string; titulo: string; itens: DorLanding[] };
  negocios: string[];
  /** A pilha de mensagens sem resposta ao lado das dores. */
  problema: { contador: string; avisos: AvisoSemResposta[] };
  chamadaFinal: { titulo: string; texto: string; demonstracao: string };
}

export const CONTEUDO_LANDING: Record<TipoLanding, ConteudoLanding> = {
  produtos: {
    tituloPagina: 'DizAI para quem vende pelo WhatsApp: orçamentos e pedidos anotados',
    hero: {
      etiqueta: 'Assistente de IA para WhatsApp',
      titulo: ['Pare de perder clientes por', 'demora', 'no WhatsApp.'],
      descricaoForte: 'Enquanto você produz, o seu assistente atende',
      descricao:
        ': envia o catálogo, tira dúvidas, faz orçamentos e anota o pedido com tudo o que você precisa. Você apenas confirma.',
      garantias: [
        'No seu número de sempre',
        'Você confirma cada pedido',
        'O pagamento continua com você',
        'Pronto em poucos minutos',
      ],
    },
    dores: {
      sobretitulo: 'A rotina de quem atende',
      titulo: 'Você produz. O WhatsApp não espera.',
      itens: [
        {
          icone: 'relogio',
          titulo: 'Encomenda que espera vai para outra loja',
          texto: 'Com a mão na massa ou entregando um pedido, a mensagem fica sem resposta e o cliente compra no concorrente.',
          citacao: '"Faz bolo para sábado?" · enviada há 2 h',
        },
        {
          icone: 'listaRepetida',
          titulo: 'As mesmas perguntas, o dia inteiro',
          texto: 'Preço, sabores, tamanhos, prazo e entrega: horas respondendo o que já está decidido.',
          citacao: '"Quanto fica o cento?" "Tem de ninho?" "Entrega no meu bairro?"',
        },
        {
          icone: 'dispersao',
          titulo: 'Produzir ou responder?',
          texto: 'Parar a produção a cada notificação atrasa as entregas. Ignorar o celular perde venda.',
          citacao: '"Ainda dá para encomendar?" · chegou no meio da produção',
        },
      ],
    },
    negocios: [
      'Confeitaria',
      'Bolos e tortas',
      'Doces finos',
      'Salgados para festa',
      'Lanches',
      'Cestas e presentes',
      'Floricultura',
      'Papelaria personalizada',
      'Camisetas e estampas',
      'Encomendas em geral',
    ],
    problema: {
      contador: '12 mensagens esperando',
      avisos: [
        { nome: 'Ana Souza', cor: '#B4466A', texto: 'Faz bolo para sábado? É para 20 pessoas', quando: 'há 2 h' },
        { nome: 'Carlos Lima', cor: '#D9822B', texto: 'Quanto fica o cento de coxinha?', quando: 'há 1 h' },
        { nome: 'Júlia Reis', cor: '#3F7D58', texto: 'Tem de ninho com morango?', quando: 'há 40 min' },
        { nome: 'Pedro Alves', cor: '#2F5FA8', texto: 'Vocês entregam no Centro?', quando: 'há 15 min' },
        { nome: 'Marina Costa', cor: '#7A4FB5', texto: 'Oi? Ainda dá para encomendar?', quando: 'agora' },
      ],
    },
    chamadaFinal: {
      titulo: 'Deixe o DizAI atender enquanto você produz.',
      texto:
        'Cadastre os seus produtos em poucos minutos e veja o assistente fazendo um orçamento e anotando um pedido de verdade. A confirmação é sempre sua.',
      demonstracao: 'Ver uma conversa de pedido',
    },
  },
  servicos: {
    tituloPagina: 'DizAI para quem atende com hora marcada: agenda automática no WhatsApp',
    hero: {
      etiqueta: 'Assistente de IA para WhatsApp',
      titulo: ['Pare de perder clientes por', 'demora', 'no WhatsApp.'],
      descricaoForte: 'Enquanto você atende, o seu assistente agenda',
      descricao:
        ': mostra os horários livres, marca, remarca e lembra o cliente antes, direto na sua agenda.',
      garantias: [
        'No seu número de sempre',
        'Agenda online inclusa',
        'Lembrete antes do horário',
        'Pronto em poucos minutos',
      ],
    },
    dores: {
      sobretitulo: 'A rotina de quem atende',
      titulo: 'Você atende. O WhatsApp não espera.',
      itens: [
        {
          icone: 'relogio',
          titulo: 'Cliente sem resposta marca em outro lugar',
          texto: 'Com uma cliente na cadeira, a mensagem fica sem resposta e o horário vai para o concorrente.',
          citacao: '"Oi? Ainda tem horário hoje?" · enviada há 2 h',
        },
        {
          icone: 'listaRepetida',
          titulo: '"Tem horário?" o dia inteiro',
          texto: 'Parar para olhar a agenda, responder valores, endereço e horários livres, uma cliente por vez.',
          citacao: '"Quanto é pé e mão?" "Tem para amanhã?" "Onde fica?"',
        },
        {
          icone: 'calendario',
          titulo: 'Faltas e horários vazios',
          texto: 'Cliente que esquece, cadeira vazia no meio do dia e o faturamento que não fecha.',
          citacao: '"Esqueci completamente, desculpa!" · 15 min depois do horário',
        },
      ],
    },
    negocios: [
      'Barbearia',
      'Studio de manicure',
      'Salão de beleza',
      'Esteticista',
      'Design de sobrancelhas',
      'Studio de tatuagem',
      'Massoterapia',
      'Banho e tosa',
      'Personal trainer',
      'Aulas particulares',
    ],
    problema: {
      contador: '9 mensagens esperando',
      avisos: [
        { nome: 'Maria Souza', cor: '#B4466A', texto: 'Oi! Tem horário hoje à tarde?', quando: 'há 2 h' },
        { nome: 'Lucas Prado', cor: '#2B2B2B', texto: 'Quanto fica corte e barba?', quando: 'há 1 h' },
        { nome: 'Bia Martins', cor: '#3F7D58', texto: 'Pode ser às 15h?', quando: 'há 40 min' },
        { nome: 'Rafael Dias', cor: '#2F5FA8', texto: 'Onde fica o studio?', quando: 'há 15 min' },
        { nome: 'Júlia Reis', cor: '#7A4FB5', texto: 'Oi?? Ainda tem vaga amanhã?', quando: 'agora' },
      ],
    },
    chamadaFinal: {
      titulo: 'Deixe o DizAI cuidar da sua agenda.',
      texto:
        'Cadastre os seus serviços e horários em poucos minutos e veja o assistente marcando um horário de verdade na sua agenda.',
      demonstracao: 'Ver uma conversa de agendamento',
    },
  },
};
