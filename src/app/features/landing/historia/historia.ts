import type { NomeIcone } from '../../../shared/components/icone/icones';
import type { TipoLanding } from '../conteudo-landing';

/**
 * A história da landing, contada com a rolagem: cada passo é um momento do atendimento e o palco ao lado mostra a
 * cena dele (a conversa, o resumo do pedido, o aviso, a agenda...). Tudo com exemplos de verdade de cada público.
 */
export type CenaHistoria =
  | { tipo: 'conversa'; mensagens: { de: 'cliente' | 'loja' | 'arquivo'; texto: string }[]; selo: string }
  | { tipo: 'resumo'; total: string; linhas: { rotulo: string; valor: string }[]; aviso: string }
  | { tipo: 'confirmar'; cliente: string; itens: string; valor: string }
  /** `depois`: a cena avança sozinha para a etapa seguinte com esta outra mensagem (ex.: pronto → entregue). */
  | { tipo: 'etapas'; etapas: string[]; atual: number; mensagem: string; depois?: string }
  | { tipo: 'numeros'; rotulo: string; valor: string; barras: number[]; insights: string[] }
  | { tipo: 'agenda'; dia: string; livres: string; blocos: { hora: string; texto: string; novo?: boolean }[]; aviso: string }
  | { tipo: 'lembrete'; quando: string; lembrete: string; resposta: string; selo: string }
  | { tipo: 'vaga'; aviso: string; mensagem: string };

export interface PassoHistoria {
  icone: NomeIcone;
  titulo: string;
  texto: string;
  cena: CenaHistoria;
}

export interface Historia {
  sobretitulo: string;
  titulo: [string, string];
  foto: string;
  /** Segunda foto, em leque atrás da primeira, só no 1º passo (computador). */
  fotoLeque?: string;
  passos: PassoHistoria[];
}

export const HISTORIAS: Record<TipoLanding, Historia> = {
  produtos: {
    sobretitulo: 'A solução',
    titulo: ['O seu assistente faz a triagem.', 'Você fecha a venda.'],
    foto: '/landing/galeria/bolos/02.webp',
    fotoLeque: '/landing/hub/salgados.webp',
    passos: [
      {
        icone: 'raio',
        titulo: 'Responde o seu cliente',
        texto: 'Tira dúvidas, faz o orçamento e te deixa produzir tranquilo.',
        cena: {
          tipo: 'conversa',
          selo: 'Respondido em 3 s',
          mensagens: [
            { de: 'cliente', texto: 'Oi! Quanto fica um bolo para 20 pessoas?' },
            { de: 'loja', texto: 'O Bolo M serve 20 pessoas e fica R$ 150,00. Te mando o cardápio de sabores aqui embaixo.' },
            { de: 'arquivo', texto: 'Cardápio de sabores.pdf' },
          ],
        },
      },
      {
        icone: 'prancheta',
        titulo: 'Faz o orçamento e anota o pedido',
        texto: 'Confere sabores, tamanhos e adicionais, calcula o prazo de preparo e pergunta só o que você precisa.',
        cena: {
          tipo: 'resumo',
          total: 'R$ 160,00',
          aviso: 'Prazo de preparo conferido',
          linhas: [
            { rotulo: 'Bolo M', valor: '20 pessoas' },
            { rotulo: 'Recheio', valor: 'Ninho e morango' },
            { rotulo: 'Adicional', valor: 'Crocante' },
            { rotulo: 'Retirada', valor: 'Sábado, 15:00' },
          ],
        },
      },
      {
        icone: 'check',
        titulo: 'Você confirma, do seu jeito',
        texto: 'O pedido chega anotado e quem decide é você: confirma, combina o pagamento e fala com o cliente.',
        cena: { tipo: 'confirmar', cliente: 'Ana Souza', itens: 'Bolo M · ninho e morango', valor: 'R$ 160,00' },
      },
      {
        icone: 'caixa',
        titulo: 'Acompanha cada pedido',
        texto: 'Confirmado, pronto, entregue: um toque muda o status e avisa o cliente com a mensagem pronta.',
        cena: {
          tipo: 'etapas',
          etapas: ['Confirmado', 'Pronto', 'Entregue'],
          atual: 1,
          mensagem: 'Ana, seu bolo está pronto para retirada! 🎂',
          depois: 'Muito obrigada pela confiança! Espero que goste 😊',
        },
      },
      {
        icone: 'grafico',
        titulo: 'Sabe quanto vendeu',
        texto: 'Faturamento, os dias que mais vendem e os clientes que mais voltam, sem planilha e sem caderno.',
        cena: {
          tipo: 'numeros',
          rotulo: 'Faturamento · últimos 30 dias',
          valor: 'R$ 4.820,00',
          barras: [38, 30, 52, 46, 74, 100, 22],
          insights: ['Sábado é o dia que mais vende', 'Melhor cliente: Ana, 6 pedidos'],
        },
      },
    ],
  },
  servicos: {
    sobretitulo: 'A solução',
    titulo: ['O seu assistente cuida da agenda.', 'Você cuida do cliente.'],
    foto: '/landing/galeria/unhas/01.webp',
    passos: [
      {
        icone: 'raio',
        titulo: 'Responde o seu cliente',
        texto: 'Tira dúvidas, oferece horários disponíveis e te deixa trabalhar tranquilo.',
        cena: {
          tipo: 'conversa',
          selo: 'Respondido em 3 s',
          mensagens: [
            { de: 'cliente', texto: 'Tem horário amanhã à tarde para pé e mão?' },
            { de: 'loja', texto: 'Tenho às 14:00, 15:30 e 17:00. Qual fica melhor para você?' },
            { de: 'cliente', texto: '14h, por favor' },
          ],
        },
      },
      {
        icone: 'calendario',
        titulo: 'Marca direto na sua agenda',
        texto: 'Marca, remarca e cancela pela conversa. O horário aparece na hora, sem você tocar no celular.',
        cena: {
          tipo: 'agenda',
          dia: 'Amanhã',
          livres: '2 livres',
          aviso: 'Novo horário na agenda',
          blocos: [
            { hora: '13:00', texto: 'Manicure · Ana' },
            { hora: '14:00', texto: 'Pé e mão · Maria', novo: true },
            { hora: '16:00', texto: 'Gel · Júlia' },
          ],
        },
      },
      {
        icone: 'sino',
        titulo: 'Lembra e confirma a presença',
        texto: 'O lembrete sai antes do horário e a resposta do cliente vira "Presença confirmada" na agenda.',
        cena: {
          tipo: 'lembrete',
          quando: '2 horas antes',
          lembrete: 'Oi, Maria! Lembrando do seu horário hoje às 14:00. Podemos confirmar?',
          resposta: 'Estarei lá! 😊',
          selo: 'Presença confirmada',
        },
      },
      {
        icone: 'retorno',
        titulo: 'Recupera o horário vago',
        texto: 'Desmarcou? A vaga vai para o primeiro da lista de espera, que responde com um toque.',
        cena: { tipo: 'vaga', aviso: 'Vaga liberada · hoje, 15:30', mensagem: 'Oi, Júlia! Abriu um horário hoje às 15:30. Quer ficar com ele?' },
      },
      {
        icone: 'grafico',
        titulo: 'Sabe quanto faturou',
        texto: 'Faturamento, ocupação, serviços mais feitos e os clientes que mais voltam, prontos.',
        cena: {
          tipo: 'numeros',
          rotulo: 'Faturamento · outubro',
          valor: 'R$ 6.340,00',
          barras: [44, 52, 48, 70, 100, 86, 20],
          insights: ['Sexta é o dia mais movimentado', '41 clientes voltaram este mês'],
        },
      },
    ],
  },
};
