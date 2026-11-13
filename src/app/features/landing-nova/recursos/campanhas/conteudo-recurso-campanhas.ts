import type { TipoLanding } from '../../../landing/conteudo-landing';
import { ConteudoPost, EstiloPost, MarcaPost } from '../../../posts/motor/tipos-post';
import { conteudoDeExemplo, estiloDeExemplo, marcaDeExemplo } from '../../landing/artes-landing';
import { ConteudoRecurso } from '../conteudo-recurso';

/**
 * As cenas do mock: a oportunidade no painel, os 3 passos da nova campanha (mensagem, quem recebe, enviar), o cliente
 * recebendo e respondendo no WhatsApp e o resultado em reais.
 */
export type CenaCampanhas = 'oportunidade' | 'mensagem' | 'publico' | 'enviar' | 'cliente' | 'resultado';

export interface OpcaoCampanha {
  titulo: string;
  detalhe: string;
}

/** A loja do exemplo e a campanha (a mesma do começo ao fim). */
export interface ExemploCampanhas {
  marca: MarcaPost;
  arte: { conteudo: ConteudoPost; estilo: EstiloPost };
  oportunidade: { titulo: string; descricao: string; icone: string };
  pergunta: string;
  opcoes: OpcaoCampanha[];
  /** A opção tocada no passo 1. */
  escolha: number;
  /** Produtos: a frase de apoio digitada no passo 1. */
  frase: string | null;
  publico: OpcaoCampanha[];
  escolhaPublico: number;
  clientes: OpcaoCampanha[];
  totalClientes: number;
  /** O texto que chega para o cliente (o modelo real, com o nome e os detalhes preenchidos). */
  mensagem: string;
  botao: string;
  custo: string;
  cliente: { nome: string; respostas: { de: 'cliente' | 'loja'; texto: string }[] };
  resultado: {
    enviadaEm: string;
    valor: string;
    frase: string;
    custo: string;
    funil: [string, number][];
    comparacao: string | null;
    /** "Cliente por cliente": nome, situação e a etiqueta ("Agendou · R$ 80", "Respondeu" ou vazio). */
    clientes: [string, string, string][];
  };
}

export interface ConteudoRecursoCampanhas extends ConteudoRecurso {
  exemplo: ExemploCampanhas;
}

const GALERIA = '/landing/galeria';
const LOGOS = `${GALERIA}/logos`;

const PERGUNTAS_COMUNS: [string, string][] = [
  ['Quanto custa enviar?', 'A Meta cobra cerca de R$ 0,35 por mensagem para quem não falou com você nas últimas 24 horas, no cartão da sua conta do WhatsApp Business. Para quem falou, é grátis. Antes de enviar, você vê o custo estimado.'],
  ['Meus clientes vão receber mensagem demais?', 'Não. Cada cliente recebe no máximo uma campanha a cada 15 dias, e quem toca em "Não quero receber" nunca mais recebe.'],
  ['Preciso escrever a mensagem?', 'Não. O texto vem pronto, com o nome do cliente e os detalhes da campanha. Você escolhe o tipo, quem recebe e envia.'],
  ['Quem responde os clientes?', 'O assistente. Ele vê a campanha na conversa e atende quem responder, do mesmo jeito que atende qualquer cliente.'],
  ['Como sei se funcionou?', 'Cada campanha tem o relatório: quantos leram, responderam e voltaram, e quanto isso trouxe em reais.'],
];

const FINAL = {
  titulo: 'A sua próxima campanha pronta hoje.',
  texto: 'Conecte o seu WhatsApp e deixe o DizAI mostrar quando e para quem vale a pena enviar.',
  botao: 'Começar grátis',
};

export const RECURSO_CAMPANHAS: Record<TipoLanding, ConteudoRecursoCampanhas> = {
  servicos: {
    tipo: 'servicos',
    landing: { rota: '/agendamentos', rotulo: 'Para quem agenda' },
    tituloPagina: 'Campanhas no WhatsApp para encher a agenda | DizAI',
    rotulo: 'Campanhas no WhatsApp',
    hero: {
      titulo: 'Horário vago e cliente sumido',
      grifo: 'viram agendamento.',
      apoio: 'O DizAI percebe quem está na hora de voltar e os horários que sobraram na agenda, e monta a mensagem com a arte '
        + 'da sua loja. Você confere, envia e vê quanto a campanha trouxe.',
      botao: 'Começar grátis',
    },
    fatos: ['A mensagem vem pronta', 'O assistente atende quem responder', 'Resultado em reais'],
    cenas: [
      { cena: 'oportunidade', legenda: 'O DizAI encontra a oportunidade' },
      { cena: 'mensagem', legenda: 'Os horários livres saem da sua agenda' },
      { cena: 'publico', legenda: 'Você escolhe quem recebe' },
      { cena: 'enviar', legenda: 'Confira a mensagem e envie' },
      { cena: 'cliente', legenda: 'O cliente responde e o assistente agenda', ms: 8000 },
      { cena: 'resultado', legenda: 'Você vê quanto a campanha trouxe', ms: 8000 },
    ],
    motivos: {
      rotulo: 'Por que fazer campanhas',
      titulo: ['A cliente que já veio', 'é a mais fácil de trazer de volta.'],
      apoio: 'Quem já conhece o seu trabalho volta com um lembrete na hora certa. O difícil é saber quem chamar e quando: o '
        + 'DizAI acompanha isso por você.',
      itens: [
        ['Ninguém some sem você perceber', 'O DizAI conhece o tempo de cada cliente entre uma visita e outra e avisa quando alguém passou da hora.'],
        ['Horário vago vira convite', 'Sobrou horário amanhã? A mensagem sai com os horários livres de verdade da sua agenda.'],
        ['Sem parecer mensagem em massa', 'Cada cliente recebe pelo nome, no máximo uma campanha a cada 15 dias, com a opção de sair.'],
      ],
    },
    recursos: {
      rotulo: 'O que as campanhas fazem',
      titulo: ['Do convite ao horário marcado,', 'sem você digitar nada.'],
      itens: [
        { icone: 'sino', titulo: 'Oportunidades no painel', texto: 'Horários livres amanhã, clientes na hora de voltar, datas especiais: o DizAI avisa e já sugere a campanha.' },
        { icone: 'calendario', titulo: 'Convite com a agenda', texto: 'Ofereça um dia ou a semana inteira, com os horários livres do jeito que estão agora.' },
        { icone: 'retorno', titulo: 'Recuperar quem sumiu', texto: 'Uma mensagem carinhosa para quem não vem há um tempo, com um motivo para voltar se você quiser.' },
        { icone: 'brilho', titulo: 'Datas especiais', texto: 'Carnaval, Páscoa, São João, Natal e Réveillon, com a mensagem pronta na época certa.' },
        { icone: 'imagem', titulo: 'Arte da sua loja', texto: 'A mensagem chega com uma arte com a sua logo, cores e fotos, ou com uma foto sua.' },
        { icone: 'pessoas', titulo: 'Você escolhe quem recebe', texto: 'Todos os clientes, quem não vem há um tempo ou os frequentes, e quem já fez um serviço.' },
        { icone: 'conversa', titulo: 'O assistente continua', texto: 'Quem toca em "Quero agendar" cai na conversa, e o assistente marca na sua agenda.' },
        { icone: 'grafico', titulo: 'Resultado em reais', texto: 'Quantos leram, responderam e agendaram, e quanto a campanha trouxe.' },
      ],
    },
    perguntas: { titulo: 'Sobre as campanhas', apoio: 'O que todo dono de negócio pergunta antes de enviar a primeira.', itens: PERGUNTAS_COMUNS },
    final: FINAL,
    exemplo: {
      marca: marcaDeExemplo('Studio Bella', 'studio-bella', 'ROSA_ESCURO', 'METALICO', 'Dancing Script', `${LOGOS}/studio-bella.webp`),
      arte: {
        conteudo: conteudoDeExemplo({
          tipo: 'AGENDA',
          selo: 'Horários livres',
          titulo: 'Ainda dá tempo',
          apoio: 'Amanhã, sexta',
          chamada: 'Agende já',
          horarios: [{ dia: 'Amanhã', horas: ['09:00', '10:30', '14:00', '16:30'] }],
        }),
        estilo: estiloDeExemplo({ layout: 'calendario', paleta: 'clara', decor: 'organico', alinhamento: 'esquerda', fonteApoio: 'Poppins', fundo: 'grao', cartao: 'sombra-dura' }),
      },
      oportunidade: {
        titulo: 'Amanhã você tem 6 horários livres',
        descricao: '8 clientes estão na hora de voltar. Um convite agora pode encher a sua agenda.',
        icone: 'calendario',
      },
      pergunta: 'Qual dia você quer oferecer?',
      opcoes: [
        { titulo: 'Esta semana', detalhe: 'Os dias com horários livres: amanhã, sábado e segunda' },
        { titulo: 'Amanhã, sexta (14/11)', detalhe: '6 horários livres · 09:00, 10:30, 14:00…' },
        { titulo: 'Sábado (15/11)', detalhe: '3 horários livres · 08:00, 13:30, 16:00' },
      ],
      escolha: 1,
      frase: null,
      publico: [
        { titulo: 'Todos os clientes', detalhe: 'Quem já agendou ou conversou com você' },
        { titulo: 'Quem não vem há um tempo', detalhe: 'Há mais de 30 dias' },
        { titulo: 'Clientes frequentes', detalhe: '3 atendimentos ou mais' },
      ],
      escolhaPublico: 1,
      clientes: [
        { titulo: 'Camila Rocha', detalhe: 'Última visita há 34 dias' },
        { titulo: 'Juliana Lima', detalhe: 'Última visita há 41 dias' },
        { titulo: 'Fernanda Alves', detalhe: 'Última visita há 38 dias' },
        { titulo: 'Patrícia Gomes', detalhe: 'Última visita há 52 dias' },
        { titulo: 'Renata Souza', detalhe: 'Última visita há 45 dias' },
      ],
      totalClientes: 8,
      mensagem: 'Olá, Camila! Abriram horários para amanhã: 09:00, 10:30 e 14:00. Quer garantir o seu? É só responder esta mensagem.',
      botao: 'Quero agendar',
      custo: 'R$ 2,80',
      cliente: {
        nome: 'Camila',
        respostas: [
          { de: 'cliente', texto: 'Quero agendar' },
          { de: 'loja', texto: 'Que bom, Camila! Amanhã tenho às 09:00, 10:30 e 14:00. Qual fica melhor para você?' },
          { de: 'cliente', texto: '14:00' },
          { de: 'loja', texto: 'Agendado! ✅\n🛠️ Serviço: Esmaltação em gel\n📅 Data: sexta, 14/11\n⏰ Horário: 14:00' },
        ],
      },
      resultado: {
        enviadaEm: 'Enviada em 13/11 às 10:02',
        valor: 'R$ 400,00',
        frase: '5 clientes agendaram depois da mensagem',
        custo: 'Custo na Meta: R$ 2,80 · cada R$ 1 virou R$ 143',
        funil: [['Enviadas', 8], ['Entregues', 8], ['Lidas', 7], ['Responderam', 6], ['Agendaram', 5]],
        comparacao: null,
        clientes: [
          ['Camila Rocha', 'Leu', 'Agendou · R$ 80'],
          ['Juliana Lima', 'Leu', 'Agendou · R$ 80'],
          ['Fernanda Alves', 'Leu', 'Respondeu'],
          ['Patrícia Gomes', 'Entregue', ''],
        ],
      },
    },
  },
  produtos: {
    tipo: 'produtos',
    landing: { rota: '/vendas', rotulo: 'Para quem vende' },
    tituloPagina: 'Campanhas no WhatsApp para vender mais | DizAI',
    rotulo: 'Campanhas no WhatsApp',
    hero: {
      titulo: 'Cada data especial',
      grifo: 'vira encomenda.',
      apoio: 'O DizAI sabe a época de vender e avisa os seus clientes no WhatsApp, com a mensagem pronta e a arte da sua loja. '
        + 'Você confere, envia e vê quanto a campanha trouxe.',
      botao: 'Começar grátis',
    },
    fatos: ['A mensagem vem pronta', 'O assistente atende quem responder', 'Resultado em reais'],
    cenas: [
      { cena: 'oportunidade', legenda: 'O DizAI avisa que a data está chegando' },
      { cena: 'mensagem', legenda: 'A mensagem vem pronta, com a arte' },
      { cena: 'publico', legenda: 'Você escolhe quem recebe' },
      { cena: 'enviar', legenda: 'Confira a mensagem e envie' },
      { cena: 'cliente', legenda: 'O cliente responde e o assistente anota o pedido', ms: 8000 },
      { cena: 'resultado', legenda: 'Você vê quanto a campanha trouxe', ms: 8000 },
    ],
    motivos: {
      rotulo: 'Por que fazer campanhas',
      titulo: ['Quem já comprou com você', 'compra de novo.'],
      apoio: 'Dia das Mães, Páscoa, Natal: o cliente vai comprar de alguém. Quem lembra primeiro, fica com a encomenda. O '
        + 'DizAI avisa a época certa e prepara a mensagem.',
      itens: [
        ['Você não perde a época', 'O DizAI conhece as datas que vendem no seu segmento e avisa com antecedência para dar tempo de produzir.'],
        ['A encomenda chega cedo', 'Quem recebe a mensagem primeiro encomenda primeiro. A sua produção fica organizada.'],
        ['Sem parecer mensagem em massa', 'Cada cliente recebe pelo nome, no máximo uma campanha a cada 15 dias, com a opção de sair.'],
      ],
    },
    recursos: {
      rotulo: 'O que as campanhas fazem',
      titulo: ['Da data especial ao pedido,', 'sem você digitar nada.'],
      itens: [
        { icone: 'sino', titulo: 'Oportunidades no painel', texto: 'A data chegando e os clientes que costumam comprar nesta época: o DizAI avisa e já sugere a campanha.' },
        { icone: 'brilho', titulo: 'Datas especiais', texto: 'Páscoa, Dia das Mães, Dia dos Pais, Natal e Réveillon, com a mensagem pronta na época certa.' },
        { icone: 'caixa', titulo: 'Encomendas abertas', texto: 'Avise que está aceitando encomendas para o fim de semana ou para uma data.' },
        { icone: 'estrela', titulo: 'Promoção e novidade', texto: 'Um sabor novo ou uma condição especial, escritos por você, com a mensagem pronta.' },
        { icone: 'imagem', titulo: 'Arte da sua loja', texto: 'A mensagem chega com uma arte com a sua logo, cores e fotos, ou com uma foto sua.' },
        { icone: 'pessoas', titulo: 'Você escolhe quem recebe', texto: 'Todos os clientes, quem não compra há um tempo ou os frequentes, e quem já comprou um produto.' },
        { icone: 'conversa', titulo: 'O assistente continua', texto: 'Quem toca em "Tenho interesse" cai na conversa, e o assistente anota o pedido para você confirmar.' },
        { icone: 'grafico', titulo: 'Resultado em reais', texto: 'Quantos leram, responderam e compraram, e quanto a campanha trouxe.' },
      ],
    },
    perguntas: { titulo: 'Sobre as campanhas', apoio: 'O que todo dono de negócio pergunta antes de enviar a primeira.', itens: PERGUNTAS_COMUNS },
    final: FINAL,
    exemplo: {
      marca: marcaDeExemplo('Pedacinho do Céu', 'pedacinho-do-ceu', 'ROSA_ESCURO', 'DEGRADE', 'Dancing Script', `${LOGOS}/pedacinho-do-ceu.jpg`),
      arte: {
        conteudo: conteudoDeExemplo({
          tipo: 'DESTAQUE',
          selo: 'Dia das Mães',
          titulo: 'Encomendas abertas',
          apoio: 'Bolos decorados com flores',
          chamada: 'Encomende pelo WhatsApp',
          fotos: [`${GALERIA}/bolos/02.webp`],
        }),
        estilo: estiloDeExemplo({ layout: 'cartao', paleta: 'creme', decor: 'brilhos', fonteApoio: 'DM Sans', cartao: 'flutuante', fundo: 'luz' }),
      },
      oportunidade: {
        titulo: 'O Dia das Mães é daqui a 12 dias',
        descricao: 'É uma das épocas que mais vendem. Uma campanha agora garante as encomendas com antecedência.',
        icone: 'brilho',
      },
      pergunta: 'Qual data?',
      opcoes: [
        { titulo: 'Dia das Mães', detalhe: '10/05 · em 12 dias' },
        { titulo: 'Dia dos Namorados', detalhe: '12/06 · em 45 dias' },
        { titulo: 'Outra data', detalhe: 'Aniversário da loja, uma data da sua cidade…' },
      ],
      escolha: 0,
      frase: 'Bolos decorados com flores e cartão escrito à mão.',
      publico: [
        { titulo: 'Todos os clientes', detalhe: 'Quem já comprou ou conversou com você' },
        { titulo: 'Quem não compra há um tempo', detalhe: 'Há mais de 60 dias' },
        { titulo: 'Clientes frequentes', detalhe: '3 pedidos ou mais' },
      ],
      escolhaPublico: 0,
      clientes: [
        { titulo: 'Fernanda Rocha', detalhe: '3 pedidos' },
        { titulo: 'Ana Souza', detalhe: '2 pedidos' },
        { titulo: 'Carla Mendes', detalhe: '1 pedido' },
        { titulo: 'Juliana Prado', detalhe: '4 pedidos' },
        { titulo: 'Beatriz Lima', detalhe: 'Conversou em abril' },
      ],
      totalClientes: 23,
      mensagem: 'Olá, Fernanda! Estamos nos preparando para o Dia das Mães e já estamos aceitando encomendas. Bolos decorados com '
        + 'flores e cartão escrito à mão. Quer garantir a sua? É só responder esta mensagem.',
      botao: 'Tenho interesse',
      custo: 'R$ 8,05',
      cliente: {
        nome: 'Fernanda',
        respostas: [
          { de: 'cliente', texto: 'Tenho interesse' },
          { de: 'loja', texto: 'Que bom, Fernanda! Para o Dia das Mães temos o Bolo de morango (R$ 120) e o Bolo floral (R$ 150). Qual você prefere?' },
          { de: 'cliente', texto: 'O floral, para retirar no sábado' },
          { de: 'loja', texto: 'Anotei o seu pedido! Aguarde a confirmação.' },
        ],
      },
      resultado: {
        enviadaEm: 'Enviada em 28/04 às 10:15',
        valor: 'R$ 1.230,00',
        frase: '9 clientes compraram depois da mensagem',
        custo: 'Custo na Meta: R$ 8,05 · cada R$ 1 virou R$ 153',
        funil: [['Enviadas', 23], ['Entregues', 22], ['Lidas', 19], ['Responderam', 12], ['Compraram', 9]],
        comparacao: 'A campanha trouxe 31 de cada 100 clientes que não viriam sozinhos.',
        clientes: [
          ['Fernanda Rocha', 'Leu', 'Comprou · R$ 150'],
          ['Ana Souza', 'Leu', 'Comprou · R$ 120'],
          ['Carla Mendes', 'Leu', 'Respondeu'],
        ],
      },
    },
  },
};
