/** Números gerais da plataforma. "Mês" = desde o dia 1; o custo em US$ é estimado pelos tokens gastos. */
export interface ResumoAdmin {
  totalLojas: number;
  whatsappConectado: number;
  iaAtiva: number;
  onboardingConcluido: number;
  lojasNovas7Dias: number;
  lojasNovas30Dias: number;
  /** Lojas com alguma mensagem nos últimos 7 dias. */
  lojasAtivas7Dias: number;
  mensagensClientes7Dias: number;
  mensagensAssistente7Dias: number;
  conversasAguardandoDono: number;
  chamadasIaMes: number;
  custoIaMesUsd: number;
}

/** "Esqueci minha senha" aberto (GET /api/admin/solicitacoes-senha). Sem conta = ninguém usa o número. */
export interface SolicitacaoSenha {
  id: string;
  whatsapp: string;
  nomeInformado: string;
  criadoEm: string;
  contaEncontrada: boolean;
  nomeLoja: string;
  nomeDono: string;
}

/** A senha temporária só aparece nesta resposta. */
export interface SenhaTemporaria {
  senha: string;
  whatsapp: string;
  numeroWhatsapp: string;
}

export type StatusWhatsappLoja = 'CONECTADO' | 'DESCONECTADO';

/** Uma loja na tela de gerenciamento (GET /api/admin/painel). */
export interface LojaAdmin {
  id: string;
  nomeLoja: string;
  nomeDono: string;
  /** Para exibir: "(83) 99999-0000". */
  whatsapp: string;
  /** Só dígitos, com 55, para o link do wa.me. */
  numeroWhatsapp: string;
  slug: string | null;
  ramo: string | null;
  /** Data/hora local do servidor, sem fuso (ex.: "2026-10-15T03:20:11"). */
  criadoEm: string;
  /** `null`: a loja nunca conectou o WhatsApp. */
  whatsappStatus: StatusWhatsappLoja | null;
  whatsappConectadoEm: string | null;
  iaAtiva: boolean;
  onboardingConcluido: boolean;
  produtos: number;
  perguntas: number;
  fotos: number;
  /** Conversas com alguma mensagem nos últimos 30 dias. */
  conversas30Dias: number;
  ultimaMensagemEm: string | null;
  chamadasIaMes: number;
  custoIaMesUsd: number;
}

export interface PainelAdmin {
  resumo: ResumoAdmin;
  /** Mais novas primeiro. */
  lojas: LojaAdmin[];
  geradoEm: string;
}
