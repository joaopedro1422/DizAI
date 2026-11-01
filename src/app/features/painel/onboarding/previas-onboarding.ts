import { ConteudoRamo } from '../../../core/constants/conteudo-por-ramo';
import { ExemplosNegocio } from '../../../core/constants/segmentos';
import { RamoNegocio, ramoDeServico } from '../../../core/models/perfil.model';
import { AlvoTour } from './onboarding-tour.service';

/** Uma linha da prévia do WhatsApp: mensagem do cliente, resposta do assistente ou o aviso que chega no celular. */
export interface LinhaPrevia {
  de: 'cliente' | 'assistente' | 'aviso';
  texto: string;
}

export interface PassoTour {
  alvo: AlvoTour;
  titulo: string;
  texto: string;
  /** O efeito daquele card no WhatsApp (o lojista vê para que serve antes de cadastrar). */
  previa: LinhaPrevia[];
  /** Prepara a tela antes do destaque (ex.: abrir o menu da agenda, trocar de página). */
  antes?: () => void;
  /** Quanto esperar depois do "antes" para a tela terminar de mudar (ex.: a gaveta abrindo). */
  esperaMs?: number;
  /**
   * Passo interativo: em vez do "Próximo", a dica (ex.: 'Toque em "Pedido pronto"') e o destaque fica tocável.
   * Quem avança é a tela, com OnboardingTourComponent.proximoPasso(), quando o lojista faz o que foi pedido.
   */
  aguardar?: string;
}

const conversa = ([cliente, resposta]: [string, string]): LinhaPrevia[] => [
  { de: 'cliente', texto: cliente },
  { de: 'assistente', texto: resposta },
];

/**
 * Os passos do tour na ordem do que mais importa para o assistente começar a responder. Cada um tem uma prévia do
 * WhatsApp com os exemplos do segmento da loja. Agenda/Pedidos só entra quando o card existe (o tour pula alvos que
 * não estão na tela).
 */
export function passosDoTour(
  ramo: RamoNegocio,
  conteudo: ConteudoRamo,
  exemplos: ExemplosNegocio,
  linkVitrine: string,
): PassoTour[] {
  const servico = ramoDeServico(ramo);
  // a primeira pergunta sugerida, sem os colchetes que marcam o que o lojista ajusta
  const sugerida = conteudo.perguntasSugeridas[0];
  const semColchetes = (texto: string) => texto.replace(/[[\]]/g, '');
  const [pedido, resposta] = exemplos.fechamento.mensagens;
  return [
    {
      alvo: 'produtos',
      titulo: `Seus ${conteudo.tituloItens.toLowerCase()}`,
      texto: `Cadastre o que você ${servico ? 'faz' : 'vende'}, com preço e opções. O assistente responde com isso.`,
      previa: conversa(exemplos.conversaPreco),
    },
    {
      alvo: 'perguntas',
      titulo: 'Perguntas frequentes',
      texto: 'As dúvidas de sempre, respondidas do seu jeito.',
      previa: sugerida ? conversa([sugerida.pergunta, semColchetes(sugerida.resposta)]) : [],
    },
    {
      alvo: 'modo-pedido',
      titulo: 'Como ele atende',
      texto: `A saudação, o catálogo em PDF ou imagem e as fotos que ele envia na conversa, e o que fazer quando o cliente quer ${
        servico ? 'marcar um horário' : 'fechar o pedido'
      }.`,
      previa: pedido && resposta ? conversa([pedido.texto, resposta.texto]) : [],
    },
    {
      alvo: 'chats',
      titulo: 'Chats',
      texto: servico
        ? 'Quando o cliente precisa de você, a conversa chega aqui, e você recebe o aviso no celular.'
        : 'Pedido pronto para fechar chega aqui, com o resumo, e você recebe o aviso no celular.',
      previa: [{ de: 'aviso', texto: exemplos.avisoChats }],
    },
    {
      alvo: 'agenda-pedidos',
      titulo: servico ? 'Sua agenda' : 'Pedidos',
      texto: servico
        ? 'Os horários que o assistente marca aparecem aqui, com lembrete e confirmação de presença.'
        : 'Confirmou com o cliente? Acompanhe o preparo e a entrega por aqui.',
      previa: [{ de: 'aviso', texto: servico ? 'Hoje · 7 clientes · próximo às 14h' : 'Em preparo 3 · Prontos para entregar 2' }],
    },
    servico
      ? {
          alvo: 'galeria',
          titulo: 'Vitrine e agenda online',
          texto:
            'Sua página com fotos e feedbacks e a sua agenda online: lá o cliente vê os serviços, os horários e as datas livres.',
          previa: conversa([
            'Tem horário essa semana?',
            `Você também pode conferir horários e disponibilidade por aqui: ${linkVitrine}/agenda`,
          ]),
        }
      : {
          alvo: 'galeria',
          titulo: 'Vitrine',
          texto: 'Sua página com fotos, feedbacks e endereço. O assistente manda o link quando o cliente pede.',
          previa: conversa([exemplos.galeria.pedidoFotos, `Tenho sim! Veja aqui: ${linkVitrine}`]),
        },
    {
      alvo: 'redes-sociais',
      titulo: 'Posts para o Instagram',
      texto: 'Artes prontas com a sua logo, cores, fotos e preços, e a legenda escrita. Escolha, ajuste e poste.',
      previa: [
        {
          de: 'aviso',
          texto: servico
            ? 'Agenda aberta: amanhã ainda tem horário das 09:00 às 11:30. A arte sai pronta para postar.'
            : 'O seu destaque com foto e preço, e a legenda escrita. A arte sai pronta para postar.',
        },
      ],
    },
  ];
}
