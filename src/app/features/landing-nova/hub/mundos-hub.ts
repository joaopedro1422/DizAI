import { ROTA_LANDING, TipoLanding } from '../../landing/conteudo-landing';

/** Uma cena de um mundo do hub: a foto, a pergunta do cliente, o resultado (pedido ou agenda) e o aviso que chega. */
export interface CenaHub {
  id: string;
  foto: string;
  pergunta: string;
  pedido?: { total: string; linhas: { rotulo: string; valor: string }[] };
  agenda?: { dia: string; livres: string; blocos: { hora: string; texto: string; novo?: boolean }[] };
  aviso: { titulo: string; texto: string };
}

/** Um dos dois "mundos" da primeira dobra do hub. */
export interface MundoHub {
  tipo: TipoLanding;
  rota: string;
  sobretitulo: string;
  titulo: string;
  texto: string;
  negocios: string[];
  cenas: CenaHub[];
}

export const MUNDOS_HUB: MundoHub[] = [
  {
    tipo: 'produtos',
    rota: ROTA_LANDING.produtos,
    sobretitulo: 'Eu vendo por encomenda',
    titulo: 'Vendas',
    texto: 'Catálogo, orçamentos na hora e pedidos anotados. A confirmação e o pagamento continuam com você.',
    negocios: ['Confeitaria', 'Salgados', 'Cestas', 'Flores', 'Roupas'],
    cenas: [
      {
        id: 'bolo',
        foto: '/landing/galeria/bolos/02.webp',
        pergunta: 'Faz bolo para sábado? É para 20 pessoas',
        pedido: {
          total: 'R$ 150,00',
          linhas: [
            { rotulo: 'Bolo M', valor: '20 pessoas' },
            { rotulo: 'Recheio', valor: 'Ninho e morango' },
            { rotulo: 'Retirada', valor: 'Sábado, 15:00' },
          ],
        },
        aviso: { titulo: 'Pedido para fechar', texto: 'Você confirma com um toque' },
      },
      {
        id: 'salgados',
        foto: '/landing/hub/salgados.webp',
        pergunta: 'Quanto fica o cento de salgados? É para domingo',
        pedido: {
          total: 'R$ 90,00',
          linhas: [
            { rotulo: 'Salgados', valor: '100 unidades' },
            { rotulo: 'Sabores', valor: 'Coxinha e kibe' },
            { rotulo: 'Entrega', valor: 'Domingo, 11:00' },
          ],
        },
        aviso: { titulo: 'Pedido para fechar', texto: '100 salgados · você confirma' },
      },
      {
        id: 'flores',
        foto: '/landing/hub/flores.webp',
        pergunta: 'Vocês entregam um buquê de rosas hoje?',
        pedido: {
          total: 'R$ 129,90',
          linhas: [
            { rotulo: 'Buquê', valor: '12 rosas vermelhas' },
            { rotulo: 'Cartão', valor: 'Com mensagem' },
            { rotulo: 'Entrega', valor: 'Hoje, 18:00' },
          ],
        },
        aviso: { titulo: 'Pedido para fechar', texto: 'Entrega hoje · você confirma' },
      },
    ],
  },
  {
    tipo: 'servicos',
    rota: ROTA_LANDING.servicos,
    sobretitulo: 'Eu atendo com hora marcada',
    titulo: 'Agendamentos',
    texto: 'O assistente marca horários na sua agenda, lembra o cliente antes, confirma a presença e diminui as faltas.',
    negocios: ['Manicure', 'Barbearia', 'Salão', 'Estética', 'Pet'],
    cenas: [
      {
        id: 'manicure',
        foto: '/landing/galeria/unhas/01.webp',
        pergunta: 'Tem horário amanhã à tarde para pé e mão?',
        agenda: {
          dia: 'Amanhã',
          livres: '3 livres',
          blocos: [
            { hora: '13:00', texto: 'Manicure · Ana' },
            { hora: '14:00', texto: 'Pé e mão · Maria', novo: true },
            { hora: '16:00', texto: 'Gel · Júlia' },
          ],
        },
        aviso: { titulo: 'Novo horário na agenda', texto: 'Pé e mão · amanhã, 14:00' },
      },
      {
        id: 'barbearia',
        foto: '/landing/hub/barbearia.webp',
        pergunta: 'Tem horário hoje à noite para corte e barba?',
        agenda: {
          dia: 'Hoje',
          livres: '2 livres',
          blocos: [
            { hora: '18:00', texto: 'Corte · Lucas' },
            { hora: '19:00', texto: 'Corte + barba · Pedro', novo: true },
            { hora: '20:00', texto: 'Barba · Rafael' },
          ],
        },
        aviso: { titulo: 'Novo horário na agenda', texto: 'Corte + barba · hoje, 19:00' },
      },
      {
        id: 'estetica',
        foto: '/landing/hub/estetica.webp',
        pergunta: 'Quero marcar uma limpeza de pele no sábado',
        agenda: {
          dia: 'Sábado',
          livres: '4 livres',
          blocos: [
            { hora: '09:00', texto: 'Massagem · Carla' },
            { hora: '10:00', texto: 'Limpeza de pele · Júlia', novo: true },
            { hora: '11:30', texto: 'Sobrancelha · Bia' },
          ],
        },
        aviso: { titulo: 'Novo horário na agenda', texto: 'Limpeza de pele · sáb, 10:00' },
      },
    ],
  },
];

/** Ondas da nota de voz (altura em %). */
export const ONDAS_HUB = [28, 52, 78, 44, 92, 60, 34, 70, 48, 86, 40, 64, 30, 54, 74, 38, 24, 46, 66, 36];
