import { environment } from '../../../environments/environment';

/** Monta a URL completa de um endpoint do backend: urlApi('/api/auth/login'). */
export function urlApi(caminho: string): string {
  return `${environment.apiUrl}${caminho}`;
}

/**
 * Diz se a requisição vai para o backend do DizAI (e não para Meta, Firebase etc.),
 * para o token do lojista nunca sair para outro domínio.
 * Sem apiUrl (desenvolvimento com proxy), as chamadas do backend são caminhos relativos: "/api/...".
 */
export function ehRequisicaoDaApi(url: string): boolean {
  return environment.apiUrl ? url.startsWith(environment.apiUrl) : url.startsWith('/');
}

/** URL de um recurso da loja: urlDoPerfil(id, '/produtos') → {apiUrl}/api/perfis/{id}/produtos */
export function urlDoPerfil(perfilId: string, caminho = ''): string {
  return urlApi(`/api/perfis/${perfilId}${caminho}`);
}
