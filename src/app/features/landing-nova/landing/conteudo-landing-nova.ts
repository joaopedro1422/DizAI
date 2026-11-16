import type { TipoLanding } from '../../landing/conteudo-landing';

/**
 * O formato do conteúdo das duas landings da marca nova (vendas e agendamentos): a página e as seções comuns
 * recebem um destes; os textos de cada tipo ficam em conteudo-vendas.ts e conteudo-agendamentos.ts.
 * Mensagens: 'c' = cliente (verde, à direita), 'l' = loja (branca), 'a' = arquivo (PDF) da loja.
 */
/** c = cliente, l = assistente, a = arquivo (PDF), i = catálogo em imagem ("Título|sabor · sabor|preço"), d = o dono respondendo pelo celular (com o nome dele em cima),
 * m = mensagem automática (pronto/entregue), t = a etiqueta flutuante ("Título|detalhe"), x = o separador de dia
 * do WhatsApp ("Sábado"), como na página de demonstração; depois dele os horários recomeçam à tarde. */
export type DeMensagem = 'c' | 'l' | 'a' | 'i' | 'd' | 'm' | 't' | 'x';

/** Uma conversa do celular do topo (um segmento embaixo do celular). */
export interface ConversaHero {
  chave: string;
  rotulo: string;
  loja: string;
  logo: string;
  aviso: [string, string];
  /** O primeiro nome de quem responde pelo celular (mensagens 'd'). */
  dono?: string;
  msgs: [DeMensagem, string][];
}

/** Um exemplo do "Como funciona": o cadastro no passo 1 e a pergunta respondida no passo 3. */
export interface SlideComo {
  produto: string;
  preco: string;
  opcao: string;
  regra: string;
  valores: string[];
  extra: [string, string];
  pergunta: string;
  resposta: string;
}

/** Uma mensagem automática (etapa do pedido ou da agenda) e o nome da etapa. */
export interface EtapaAviso {
  nome: string;
  mensagem: string;
}

export type VisualDia = 'conversa' | 'audio' | 'arquivo' | 'chama' | 'chave' | 'jeito';

/** Um cartão de "Um funcionário, sem férias". `detalhe`: o arquivo ou a pergunta difícil do visual. */
export interface ItemDia {
  momento: string;
  titulo: string;
  texto: string;
  visual: VisualDia;
  detalhe?: string;
  conversa?: [string, string];
}

/** Um negócio da prova (MIT): a conversa sem o assistente e com ele. */
export interface ExemploProva {
  loja: string;
  logo: string;
  /** c = cliente, l = loja, t = a etiqueta amarela de tempo ("De madrugada", "No outro dia de manhã"). */
  sem: ['c' | 'l' | 't', string, string][];
  com: ['c' | 'l' | 't', string, string][];
  fimSem: string;
  fimCom: string;
}

export interface ConteudoLandingNova {
  tipo: TipoLanding;
  tituloPagina: string;
  rota: string;
  outra: { rota: string; rotulo: string };
  /** "Recursos" ou "Recursos da agenda" (topo e seção). */
  rotuloRecursos: string;
  hero: { descricao: string; garantias: string[]; conversas: ConversaHero[] };
  dores: { titulo: [string, string]; itens: { titulo: string; texto: string; citacao: string }[] };
  bloqueio: { contador: string; avisos: { nome: string; cor: string; texto: string; quando: string }[] };
  prova: {
    loja: string;
    logo: string;
    /** "fechar a venda" / "o cliente marcar com você" (a frase do estudo). */
    objetivo: string;
    sem: ['c' | 't', string, string][];
    com: ['c' | 'l', string, string][];
    fimSem: string;
    fimCom: string;
    /** Vários negócios, um depois do outro (cada um: sem → com); sem a lista, vale o exemplo único acima. */
    exemplos?: ExemploProva[];
    /**
     * Com este campo a seção vira "A solução" (no lugar do estudo do MIT): o título (a 2ª parte em amarelo), a
     * descrição e, depois da conversa, as cenas dos pedidos e do financeiro (sem → com o DizAI).
     */
    solucao?: { titulo: [string, string]; descricao: string };
  };
  como: { cadastro: [string, string]; atende: [string, string]; selo: string; slides: SlideComo[] };
  /** "Um funcionário, sem férias": as habilidades do assistente de IA (6 cartões). */
  dia: ItemDia[];
  /** A resposta de "E se eu não quiser usar o assistente?", o gancho para os Recursos. */
  semAssistente: string;
  vitrine: {
    texto: string;
    itens: string[];
    textoPosts: string;
    diferenciais: [string, string][];
  };
  /** A faixa azul-noite antes de "Para quem é": o rótulo, o título (a 2ª parte em amarelo) e os 6 cartões. */
  confiancaCabeca: { rotulo: string; titulo: [string, string] };
  confianca: [string, string][];
  ramos: { titulo: string; quem: string; fotos: string[]; faz: string[] }[];
  perguntas: [string, string][];
  final: { titulo: string; texto: string };
}

/** As perguntas que valem para os dois tipos (depois das de cada um). */
export const PERGUNTAS_COMUNS: [string, string][] = [
  ['Preciso trocar de número?', 'Não. O DizAI funciona no seu WhatsApp Business de sempre e você continua usando o aplicativo normalmente.'],
  ['Preciso entender de tecnologia?', 'Não. Você responde algumas perguntas sobre o seu negócio, como preços e horários, e conecta o seu WhatsApp. Leva poucos minutos.'],
  ['E se o assistente não souber responder?', 'Ele não inventa: responde "vou confirmar, 1 minuto", te avisa no celular e você responde. Depois, a resposta vira pergunta frequente e ele passa a saber.'],
  ['Uso o mesmo número para a vida pessoal. E agora?', 'Sem problema. Você escolhe os contatos pessoais, como família e amigos, e o assistente não responde essas conversas.'],
  ['Para ter uma vitrine do meu negócio preciso usar o assistente?', 'Não. Você pode montar a sua página de graça, apenas para ter o link e usar nas redes sociais, sem ligar o assistente.'],
];

export const ONDAS_AUDIO = [40, 70, 35, 90, 55, 100, 45, 75, 30, 85, 60, 40, 95, 50, 70, 35, 80, 45];
