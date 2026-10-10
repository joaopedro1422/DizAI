import { NomeIcone } from '../../shared/components/icone/icones';

/** Ponto de partida do lojista: já tem o app WhatsApp Business ou ainda não. */
export type SituacaoWhatsapp = 'JA_USA_BUSINESS' | 'NAO_USA_BUSINESS';

export interface OpcaoSituacao {
  situacao: SituacaoWhatsapp;
  icone: NomeIcone;
  titulo: string;
  descricao: string;
}

/** Primeira pergunta do assistente: define quais etapas aparecem. */
export const OPCOES_SITUACAO: OpcaoSituacao[] = [
  {
    situacao: 'JA_USA_BUSINESS',
    icone: 'check',
    titulo: 'Sim, já uso o WhatsApp Business',
    descricao: 'O app com a maleta no ícone, feito para empresas.',
  },
  {
    situacao: 'NAO_USA_BUSINESS',
    icone: 'conversa',
    titulo: 'Não, uso o WhatsApp comum',
    descricao: 'Ou ainda não tenho WhatsApp nesse número. A gente te ajuda a trocar, sem perder as conversas.',
  },
];

export interface ItemChecklist {
  icone: NomeIcone;
  texto: string;
}

/** Uma etapa do assistente: só texto, a lista "tenha em mãos" ou o botão da Meta. */
export type EtapaConexao =
  | { tipo: 'INSTRUCAO'; titulo: string; texto: string; atencao?: string; botaoAvancar: string }
  | { tipo: 'CHECKLIST'; titulo: string; texto: string; itens: ItemChecklist[]; botaoAvancar: string }
  | { tipo: 'CONECTAR'; titulo: string; texto: string };

/** Quem ainda usa o WhatsApp comum passa primeiro para o WhatsApp Business. */
const ETAPAS_PREPARAR_BUSINESS: EtapaConexao[] = [
  {
    tipo: 'INSTRUCAO',
    titulo: 'Faça o backup das suas conversas',
    texto: 'No WhatsApp que você usa hoje, abra Configurações › Conversas › Backup de conversas e toque em "Fazer backup".',
    atencao: 'Espere terminar antes de seguir. Assim nenhuma conversa se perde.',
    botaoAvancar: 'Backup feito',
  },
  {
    tipo: 'INSTRUCAO',
    titulo: 'Baixe o WhatsApp Business',
    texto: 'No celular da loja, instale o app "WhatsApp Business" pela Play Store ou App Store. É gratuito e feito pela própria Meta.',
    botaoAvancar: 'Já instalei',
  },
  {
    tipo: 'INSTRUCAO',
    titulo: 'Entre com o número da loja',
    texto: 'Abra o WhatsApp Business e use o mesmo número que seus clientes já conhecem. Quando o app perguntar, aceite usar esse número e trazer suas conversas.',
    botaoAvancar: 'Entrei com o meu número',
  },
  {
    tipo: 'INSTRUCAO',
    titulo: 'Preencha o perfil da loja',
    texto: 'Coloque o nome da loja, a categoria e uma foto. Pronto: daqui pra frente você usa o WhatsApp Business no lugar do comum.',
    botaoAvancar: 'Perfil preenchido',
  },
];

/** Etapas de todo mundo: preparar e conectar pela janela oficial da Meta. */
const ETAPAS_CONECTAR: EtapaConexao[] = [
  {
    tipo: 'CHECKLIST',
    titulo: 'Antes de conectar, tenha em mãos',
    texto: 'Leva uns 10 minutos.',
    itens: [
      { icone: 'celular', texto: 'O celular com o WhatsApp Business da loja, atualizado.' },
      { icone: 'pessoa', texto: 'O seu Facebook. Pode ser o pessoal: ele só confirma que é você.' },
      { icone: 'relogio', texto: 'De preferência, use o computador: fica mais fácil ler o QR code com o celular.' },
    ],
    botaoAvancar: 'Tenho tudo',
  },
  {
    tipo: 'CONECTAR',
    titulo: 'Agora, clique no botão abaixo',
    texto: 'Vai abrir a janela oficial da Meta, a empresa dona do WhatsApp. O DizAI não vê a sua senha.',
  },
];

/** O que o lojista vai fazer dentro da janela da Meta (mostrado junto do botão). */
export const PASSOS_JANELA_META: { titulo: string; texto: string }[] = [
  { titulo: 'Entre com o seu Facebook', texto: 'E confirme que quer continuar.' },
  { titulo: 'Informe os dados da empresa', texto: 'Nome da loja, e-mail e endereço. Confira com calma.' },
  {
    titulo: 'Escolha "conectar o app WhatsApp Business"',
    texto: 'E digite o número da loja. Se pedirem código por SMS, volte: essa é a opção de número novo.',
  },
  {
    titulo: 'Leia o QR code com o celular',
    texto: 'Abra o WhatsApp Business: chega uma mensagem do próprio WhatsApp. Toque nela e aponte a câmera para a tela.',
  },
  { titulo: 'Confirme até o fim', texto: 'Trazer o histórico e os contatos é opcional. Depois, a janela fecha sozinha.' },
];

export function etapasDaSituacao(situacao: SituacaoWhatsapp): EtapaConexao[] {
  return situacao === 'NAO_USA_BUSINESS' ? [...ETAPAS_PREPARAR_BUSINESS, ...ETAPAS_CONECTAR] : ETAPAS_CONECTAR;
}

/** Problemas mais comuns e como resolver. */
export const PROBLEMAS_COMUNS: string[] = [
  'A janela da Meta não abriu? Libere as janelas pop-up no navegador e tente de novo.',
  'O número já esteve ligado a outro chatbot ou plataforma? Desconecte por lá antes de começar.',
  'Apareceu um erro que você não entendeu? Tire um print e mande para a gente.',
];
