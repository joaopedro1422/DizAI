import { NomeIcone } from '../../shared/components/icone/icones';

/** As páginas da tela Pedidos, escolhidas no menu lateral. */
export type SecaoPedidos = 'pedidos' | 'numeros' | 'mensagens' | 'restringir';

export interface InfoSecaoPedidos {
  valor: SecaoPedidos;
  titulo: string;
  /** Uma linha sobre o que a página tem (no topo do computador). */
  descricao: string;
  icone: NomeIcone;
}

export const SECOES_DOS_PEDIDOS: InfoSecaoPedidos[] = [
  { valor: 'pedidos', titulo: 'Pedidos', descricao: 'Os pedidos confirmados, do preparo à entrega', icone: 'caixa' },
  { valor: 'numeros', titulo: 'Números', descricao: 'Faturamento, entregas e os melhores clientes', icone: 'grafico' },
  { valor: 'mensagens', titulo: 'Mensagens', descricao: 'O que o cliente recebe pelo WhatsApp em cada etapa', icone: 'conversa' },
  { valor: 'restringir', titulo: 'Restringir agenda', descricao: 'As datas em que você não aceita mais pedidos', icone: 'calendarioFolga' },
];

export function infoDaSecaoDosPedidos(secao: SecaoPedidos): InfoSecaoPedidos {
  return SECOES_DOS_PEDIDOS.find((info) => info.valor === secao)!;
}
