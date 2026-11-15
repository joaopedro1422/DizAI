import { ExemplosNegocio } from '../../core/constants/segmentos';
import { Pedido, totalDoResumo } from '../../core/models/pedido.model';
import { PassoTour } from '../painel/onboarding/previas-onboarding';
import { SecaoPedidos } from './secoes-pedidos';

/** O pedido de exemplo do tour: só existe na tela, nunca vai ao servidor. */
export const ID_PEDIDO_EXEMPLO = 'exemplo-do-tour';

/** O que o tour faz na tela de Pedidos entre um passo e outro. */
export interface AcoesTourPedidos {
  abrirMenu: () => void;
  fecharMenu: () => void;
  irPara: (secao: SecaoPedidos) => void;
  /** Põe o pedido de exemplo na lista (em preparo). */
  mostrarExemplo: () => void;
  /** Tira da tela a mensagem que "saiu" para o cliente. */
  esconderEnvio: () => void;
}

const ESPERA_MENU_MS = 320;
const ESPERA_PAGINA_MS = 250;

/** O pedido do exemplo dos Chats do segmento (cliente, itens e total), confirmado há 12 minutos. */
export function pedidoDeExemplo(exemplos: ExemplosNegocio): Pedido {
  const { cliente, resumo } = exemplos.chats;
  return {
    id: ID_PEDIDO_EXEMPLO,
    conversaId: null,
    nomeCliente: cliente,
    whatsapp: '',
    resumo,
    valor: totalDoResumo(resumo) ?? 120,
    status: 'CONFIRMADO',
    teste: false,
    confirmadoEm: new Date(Date.now() - 12 * 60_000),
    prontoEm: null,
    entregueEm: null,
  };
}

/**
 * Tour dos Pedidos (primeira visita e "Como usar os pedidos" no menu): o menu, o caminho do pedido (Chats → aqui) e
 * um pedido de exemplo do segmento em que o próprio lojista toca em "Pedido pronto" e "Entregue" e vê a mensagem
 * saindo para o cliente. Os passos interativos (aguardar) são avançados pela tela, depois do toque.
 */
export function passosDoTourDosPedidos(acoes: AcoesTourPedidos): PassoTour[] {
  return [
    {
      alvo: 'pedidos-menu',
      titulo: 'Tudo dos pedidos fica neste menu',
      texto: 'Toque aqui para abrir as páginas dos pedidos. Vamos abrir para você.',
      previa: [],
      antes: () => {
        acoes.fecharMenu();
        acoes.irPara('pedidos');
      },
      esperaMs: ESPERA_PAGINA_MS,
    },
    {
      alvo: 'pedidos-secoes',
      titulo: 'Pedidos, Números e Mensagens',
      texto:
        'Em Pedidos, o que está em preparo e o que já está pronto. Em Números, o faturamento e os melhores clientes. Em Mensagens, o que o cliente recebe em cada etapa.',
      previa: [],
      antes: acoes.abrirMenu,
      esperaMs: ESPERA_MENU_MS,
    },
    {
      alvo: 'pedidos-chats',
      titulo: 'Os pedidos chegam pelo Chats',
      texto:
        'O assistente anota o pedido e passa para você no Chats. Lá, depois de combinar com o cliente, toque em "Pedido confirmado" e ele vem para cá.',
      previa: [],
      antes: acoes.abrirMenu,
    },
    {
      alvo: 'pedidos-exemplo',
      titulo: 'Um pedido de exemplo',
      texto: 'Assim aparece um pedido confirmado: o cliente, o que ele pediu e o valor. Vamos levá-lo até a entrega.',
      previa: [],
      antes: () => {
        acoes.fecharMenu();
        acoes.irPara('pedidos');
        acoes.mostrarExemplo();
      },
      esperaMs: ESPERA_MENU_MS,
    },
    {
      alvo: 'pedidos-exemplo',
      titulo: 'Ficou pronto?',
      texto: 'Toque em "Pedido pronto". No dia a dia, você confere a mensagem antes de enviar.',
      previa: [],
      aguardar: 'Toque em "Pedido pronto"',
    },
    {
      alvo: 'pedidos-envio',
      titulo: 'O cliente recebe na hora',
      texto: 'O aviso sai pelo WhatsApp da loja, como uma mensagem sua. O pedido passou para "Prontos".',
      previa: [],
    },
    {
      alvo: 'pedidos-exemplo',
      titulo: 'Agora, a entrega',
      texto: 'Quando o cliente receber ou retirar, toque em "Entregue".',
      previa: [],
      aguardar: 'Toque em "Entregue"',
    },
    {
      alvo: 'pedidos-envio',
      titulo: 'Entregue e agradecido',
      texto:
        'Sai o agradecimento, o pedido entra no faturamento dos Números e o assistente volta a atender esse cliente só no dia seguinte.',
      previa: [],
    },
    {
      alvo: 'pedidos-registrar',
      titulo: 'Pedido fora do WhatsApp?',
      texto: 'Venda no balcão, ligação ou Instagram: toque no "+" para registrar o pedido e ele também entrar nos Números.',
      previa: [],
      antes: acoes.esconderEnvio,
    },
    {
      alvo: 'pedidos-registrar-pc',
      titulo: 'Pedido fora do WhatsApp?',
      texto: 'Venda no balcão, ligação ou Instagram: use "Registrar pedido" para ela também entrar nos Números.',
      previa: [],
      antes: acoes.esconderEnvio,
    },
    {
      alvo: 'pedidos-mensagens',
      titulo: 'Suas mensagens',
      texto: 'Os avisos de pronto e entregue, e as mensagens prontas que viram atalhos na hora de avisar.',
      previa: [],
      antes: () => acoes.irPara('mensagens'),
      esperaMs: ESPERA_PAGINA_MS,
    },
    {
      alvo: 'pedidos-restringir',
      titulo: 'Agenda lotada?',
      texto:
        'Em Restringir agenda, marque os dias ou o mês em que você não aceita mais pedidos. O assistente continua atendendo e só avisa que a agenda está lotada quando o cliente pedir uma dessas datas.',
      previa: [],
      antes: () => acoes.irPara('restringir'),
      esperaMs: ESPERA_PAGINA_MS + 400,
    },
  ];
}
