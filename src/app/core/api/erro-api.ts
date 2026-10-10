import { HttpErrorResponse } from '@angular/common/http';

/**
 * Corpo de erro do backend (ProblemDetail do Spring, RFC 9457).
 * `campos` vem nos erros de validação: { "whatsapp": "Informe um WhatsApp válido, com DDD." }
 */
interface ProblemaApi {
  title?: string;
  detail?: string;
  campos?: Record<string, string>;
}

/**
 * Extrai a mensagem amigável de um erro da API.
 * Sem resposta do servidor (status 0) o problema é de conexão.
 */
export function mensagemDoErro(erro: unknown, padrao = 'Não foi possível concluir. Tente de novo.'): string {
  if (!(erro instanceof HttpErrorResponse)) {
    return padrao;
  }
  if (erro.status === 0) {
    return 'Sem conexão com o servidor. Confira sua internet e tente de novo.';
  }
  const problema = typeof erro.error === 'object' ? (erro.error as ProblemaApi | null) : null;
  const primeiroErroDeCampo = problema?.campos ? Object.values(problema.campos)[0] : undefined;
  if (primeiroErroDeCampo) {
    return primeiroErroDeCampo;
  }
  // Erros 5xx genéricos não devem mostrar detalhes técnicos ao lojista.
  if (erro.status >= 500 && erro.status !== 502) {
    return padrao;
  }
  return problema?.detail || padrao;
}

/** Aviso padrão quando uma tela não consegue buscar os próprios dados. */
export const ERRO_AO_CARREGAR = 'Não foi possível carregar os dados. Confira sua internet e recarregue a página.';
