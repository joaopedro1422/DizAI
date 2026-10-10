/**
 * Dados de exemplo usados enquanto os endpoints do backend não estão ligados.
 * Representam a loja de teste "Bella Studio".
 */
import { ContatoIgnorado, ContatoWhatsapp } from '../models/contato.model';
import { Album } from '../models/galeria.model';
import { Conversa } from '../models/conversa.model';
import { Perfil } from '../models/perfil.model';
import { PerguntaFrequente } from '../models/pergunta-frequente.model';
import { Produto } from '../models/produto.model';

/** Imagem lisa em SVG, usada como foto de exemplo. */
export function fotoDeExemplo(cor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4"><rect width="4" height="4" fill="${cor}"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const TONS_FOTOS = [
  '#efe5e1', '#e4d3cd', '#f4eeeb', '#d9c4bd', '#ece2de', '#e1d0ca',
  '#e8ddd9', '#dccbc5', '#f2ebe8', '#e3d5d0', '#d6c3bc', '#f0e7e4',
];

function criarFotos(quantidade: number, idInicial: number) {
  return Array.from({ length: quantidade }, (_, indice) => ({
    id: idInicial + indice,
    url: fotoDeExemplo(TONS_FOTOS[indice % TONS_FOTOS.length]),
  }));
}

export const PERFIL_EXEMPLO: Perfil = {
  nomeResponsavel: 'Isabela Souza',
  nomeLoja: 'Bella Studio',
  descricao: 'Nail designer',
  whatsapp: '(83) 99999-0000',
  slug: 'bella-studio',
  fotoPerfilUrl: null,
  corMarca: 'ROSA_ESCURO',
  ramo: 'SERVICOS_PRESENCIAIS',
  formasPagamento: ['PIX', 'CARTAO_CREDITO', 'DINHEIRO'],
  formasRecebimento: ['ATENDIMENTO_LOCAL'],
  distanciaMaximaKm: '',
  taxaEntrega: '',
  prazoMinimo: 'HORAS_24',
  modoPedido: 'COLETAR_DADOS',
  camposPedido:
    'Serviço desejado, data e horário, se já tem alongamento para remover, foto de referência (opcional).',
  modoFotos: 'GALERIA',
  linkPortfolioExterno: '',
  saudacaoPersonalizada:
    'Bem-vinda à Bella Studio, o seu estúdio de unhas! Atendemos apenas com hora marcada.',
  instrucoesObrigatorias:
    'Nunca agende aos domingos.\nAntes de falar valor de nail art, peça uma foto de referência.\nManutenção só para alongamentos feitos aqui no estúdio.',
  assistenteAtivo: true,
  whatsappConectado: false,
  onboardingConcluido: true,
};

export const PRODUTOS_EXEMPLO: Produto[] = [
  {
    id: 1,
    categoria: 'Unhas em gel',
    nome: 'Esmaltação em gel',
    descricao: 'Mãos com acabamento brilhante e duração de até 21 dias.',
    preco: 70,
    precoAPartirDe: false,
    atributos: [
      { nome: 'Cor', opcoes: ['Nude', 'Vermelho', 'Rosa'] },
      { nome: 'Acabamento', opcoes: ['Brilho', 'Fosco'] },
    ],
    fotoUrl: fotoDeExemplo('#efe5e1'),
  },
  {
    id: 2,
    categoria: 'Alongamento',
    nome: 'Alongamento em fibra de vidro',
    descricao: 'Formatos amendoado, quadrado ou bailarina. Inclui esmaltação em gel.',
    preco: 150,
    precoAPartirDe: false,
    atributos: [
      { nome: 'Formato', opcoes: ['Amendoado', 'Quadrado', 'Bailarina'] },
      { nome: 'Comprimento', opcoes: ['Curto', 'Médio', 'Longo'] },
      { nome: 'Acabamento', opcoes: ['Brilho', 'Fosco'] },
    ],
    fotoUrl: fotoDeExemplo('#e4d3cd'),
  },
  {
    id: 3,
    categoria: 'Alongamento',
    nome: 'Manutenção de alongamento',
    descricao: 'Para alongamentos feitos no estúdio, a cada 15 a 21 dias.',
    preco: 90,
    precoAPartirDe: false,
    atributos: [{ nome: 'Formato', opcoes: ['Amendoado', 'Quadrado', 'Bailarina'] }],
    fotoUrl: fotoDeExemplo('#f1e9e6'),
  },
  {
    id: 4,
    categoria: 'Nail art',
    nome: 'Nail art por unha',
    descricao: 'Francesinha, encapsulada, pedrarias ou desenho à mão livre.',
    preco: 5,
    precoAPartirDe: true,
    atributos: [
      { nome: 'Estilo', opcoes: ['Francesinha', 'Encapsulada', 'Pedrarias', 'Mão livre'] },
    ],
    fotoUrl: fotoDeExemplo('#d9c4bd'),
  },
  {
    id: 5,
    categoria: 'Pé e mão',
    nome: 'Pé e mão tradicional',
    descricao: 'Cutilagem e esmaltação comum nas mãos e nos pés.',
    preco: 55,
    precoAPartirDe: false,
    atributos: [],
  },
  {
    id: 6,
    categoria: 'Unhas em gel',
    nome: 'Remoção de gel',
    descricao: 'Remoção segura com lixa e hidratação das unhas.',
    preco: 30,
    precoAPartirDe: false,
    atributos: [],
  },
];

export const PERGUNTAS_EXEMPLO: PerguntaFrequente[] = [
  { id: 1, pergunta: 'Vocês atendem aos domingos?', resposta: 'Não. Atendemos de segunda a sábado, das 8h às 18h.' },
  { id: 2, pergunta: 'Preciso agendar com antecedência?', resposta: 'Sim, com pelo menos 24 horas de antecedência.' },
  { id: 3, pergunta: 'Quanto tempo dura o gel?', resposta: 'Em média 21 dias, dependendo dos cuidados e do crescimento da unha.' },
  { id: 4, pergunta: 'Fazem remoção de alongamento feito em outro lugar?', resposta: 'Fazemos sim, com custo adicional de R$ 30.' },
  { id: 5, pergunta: 'Quais as formas de pagamento?', resposta: 'Pix, cartão de débito, cartão de crédito e dinheiro.' },
  { id: 6, pergunta: 'Posso levar uma foto de referência?', resposta: 'Pode e é até melhor! Assim conseguimos te passar o valor certinho da nail art.' },
];

export const ALBUNS_EXEMPLO: Album[] = [
  {
    id: 1,
    nome: 'Unhas em gel',
    slug: 'unhas-em-gel',
    descricao: 'Acabamento natural, duração de até 21 dias.',
    fotos: criarFotos(12, 100),
  },
  {
    id: 2,
    nome: 'Alongamento',
    slug: 'alongamento',
    descricao: 'Fibra de vidro e molde F1, formatos amendoado, quadrado e bailarina.',
    fotos: criarFotos(8, 200),
  },
  {
    id: 3,
    nome: 'Nail art',
    slug: 'nail-art',
    descricao: 'Francesinha, encapsulada, pedrarias e desenhos à mão livre.',
    fotos: criarFotos(15, 300),
  },
];

function minutosAtras(minutos: number): Date {
  return new Date(Date.now() - minutos * 60_000);
}

export const CONVERSAS_EXEMPLO: Conversa[] = [
  {
    id: 1,
    nomeCliente: 'Ana Clara',
    whatsapp: '(83) 98888-1111',
    ultimaMensagem: 'Pode confirmar, quero sim!',
    atualizadaEm: minutosAtras(5),
    status: 'AGUARDANDO_DONO',
    motivoEspera: 'PRONTO_PARA_FECHAR',
    resumoPedido: [
      { campo: 'Serviço', valor: 'Alongamento em fibra' },
      { campo: 'Formato', valor: 'Amendoado' },
      { campo: 'Data', valor: 'Sábado, 9h' },
    ],
  },
  {
    id: 2,
    nomeCliente: 'Marcos Lima',
    whatsapp: '(83) 98777-2222',
    ultimaMensagem: 'Queria falar com a Bella sobre um pacote para a minha noiva e as madrinhas.',
    atualizadaEm: minutosAtras(18),
    status: 'AGUARDANDO_DONO',
    motivoEspera: 'PEDIU_HUMANO',
    resumoPedido: [],
  },
  {
    id: 3,
    nomeCliente: '',
    whatsapp: '(83) 98666-3333',
    ultimaMensagem: 'Vocês fazem unha decorada para criança?',
    atualizadaEm: minutosAtras(62),
    status: 'AGUARDANDO_DONO',
    motivoEspera: 'IA_SEM_RESPOSTA',
    resumoPedido: [],
  },
  { id: 4, nomeCliente: 'Patrícia Gomes', whatsapp: '(83) 98555-4444', ultimaMensagem: 'Qual o valor da manutenção do alongamento?', atualizadaEm: minutosAtras(12), status: 'IA_ATIVA', resumoPedido: [] },
  { id: 5, nomeCliente: 'Renata Alves', whatsapp: '(83) 98444-5555', ultimaMensagem: 'Tem horário amanhã à tarde?', atualizadaEm: minutosAtras(34), status: 'IA_ATIVA', resumoPedido: [] },
  { id: 6, nomeCliente: 'Camila Duarte', whatsapp: '(83) 98333-6666', ultimaMensagem: 'Me manda fotos de nail art francesinha?', atualizadaEm: minutosAtras(57), status: 'IA_ATIVA', resumoPedido: [] },
  { id: 7, nomeCliente: 'Fernanda Melo', whatsapp: '(83) 98222-7777', ultimaMensagem: 'Vocês aceitam Pix?', atualizadaEm: minutosAtras(140), status: 'IA_ATIVA', resumoPedido: [] },
];

/** Contatos que a Bella Studio já marcou para o assistente não responder. */
export const CONTATOS_IGNORADOS_EXEMPLO: ContatoIgnorado[] = [
  { id: 1, nome: 'Mãe', whatsapp: '(83) 98811-2233', origem: 'WHATSAPP', adicionadoEm: new Date(2026, 8, 20) },
  { id: 2, nome: 'Rafa (marido)', whatsapp: '(83) 98722-4455', origem: 'WHATSAPP', adicionadoEm: new Date(2026, 8, 20) },
];

/**
 * Agenda do app WhatsApp Business da loja de exemplo (o que o backend recebe pelo webhook
 * `smb_app_state_sync`). Mistura família, fornecedores e clientes, como numa agenda de verdade.
 */
export const CONTATOS_WHATSAPP_EXEMPLO: ContatoWhatsapp[] = [
  { nome: 'Mãe', whatsapp: '(83) 98811-2233' },
  { nome: 'Rafa (marido)', whatsapp: '(83) 98722-4455' },
  { nome: 'Juliana Vizinha', whatsapp: '(83) 99634-1020' },
  { nome: 'Grupo Família - Tia Célia', whatsapp: '(83) 98101-7788' },
  { nome: 'Pedro Irmão', whatsapp: '(83) 99912-3344' },
  { nome: 'Fornecedor Esmaltes', whatsapp: '(83) 3321-4567' },
  { nome: 'Carla Souza', whatsapp: '(83) 98666-3333' },
  { nome: 'Marina Lopes', whatsapp: '(83) 99123-8800' },
  { nome: 'Dentista Dra. Ana', whatsapp: '(83) 3245-9090' },
  { nome: 'Bruna Cliente', whatsapp: '(83) 98555-1212' },
];
