/**
 * O que o onboarding guarda no navegador (por loja): se o lojista já testou o assistente e se escondeu o card
 * "Primeiros passos". O navegador pode recusar (aba anônima): aí tudo continua funcionando, só não lembra.
 */
const CHAVE_TESTOU = 'dizai:onboarding:testou:';
const CHAVE_OCULTOU = 'dizai:onboarding:primeiros-passos-oculto:';

function ler(chave: string): boolean {
  try {
    return localStorage.getItem(chave) === 'sim';
  } catch {
    return false;
  }
}

function gravar(chave: string): void {
  try {
    localStorage.setItem(chave, 'sim');
  } catch {
    // sem armazenamento: o card volta a conferir na próxima vez
  }
}

export const testeFeito = (perfilId: string) => ler(CHAVE_TESTOU + perfilId);
export const marcarTesteFeito = (perfilId: string) => gravar(CHAVE_TESTOU + perfilId);
export const primeirosPassosOcultos = (perfilId: string) => ler(CHAVE_OCULTOU + perfilId);
export const ocultarPrimeirosPassos = (perfilId: string) => gravar(CHAVE_OCULTOU + perfilId);

/**
 * A mensagem já escrita no primeiro teste: nos serviços, o cliente quer agendar (a agenda automática responde com os
 * horários); nos produtos, pergunta o preço. Sem item, uma pergunta genérica.
 */
export function perguntaDoPrimeiroTeste(servico: boolean, nomeItem: string | null | undefined): string {
  const nome = nomeItem?.trim();
  if (!nome) {
    return servico ? 'Oi, gostaria de agendar um horário para amanhã' : 'Oi! Quais produtos vocês têm?';
  }
  const item = nome.charAt(0).toLowerCase() + nome.slice(1);
  return servico ? `Oi, gostaria de agendar ${item} para amanhã` : `Oi! Quanto custa ${item}?`;
}
