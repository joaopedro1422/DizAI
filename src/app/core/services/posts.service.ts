import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlDoPerfil } from '../api/api-url';
import { SessaoService } from '../auth/sessao.service';
import type { TextoPost } from '../../features/posts/motor/textos-post';
import type { TipoPost } from '../../features/posts/motor/tipos-post';

/**
 * Gerador de posts para redes sociais: os textos escritos pela IA (POST /api/perfis/{id}/posts/textos) e as fotos
 * da loja em data URL. As fotos passam pelo backend (GET .../arquivos/imagem?ref=) porque o Firebase Storage não
 * libera CORS e a arte precisa ler os pixels para virar PNG.
 */
@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);

  private readonly imagens = new Map<string, Promise<string | null>>();

  async escreverTextos(tipo: TipoPost, assunto: string, pedidoDoLojista: string): Promise<TextoPost[]> {
    const resposta = await firstValueFrom(
      this.http.post<{ opcoes: TextoPost[] }>(this.url('/posts/textos'), {
        tipo,
        assunto: assunto.slice(0, 1200),
        pedidoDoLojista: pedidoDoLojista.trim().slice(0, 300) || null,
      }),
    );
    return resposta.opcoes ?? [];
  }

  /** A foto da loja (referência "lojas/...") como data URL; null quando não foi possível baixar. Fica em cache. */
  imagem(referencia: string | null | undefined): Promise<string | null> {
    if (!referencia) {
      return Promise.resolve(null);
    }
    if (referencia.startsWith('data:')) {
      return Promise.resolve(referencia);
    }
    if (!this.imagens.has(referencia)) {
      const pedido = firstValueFrom(
        this.http.get(this.url('/arquivos/imagem'), { params: { ref: referencia }, responseType: 'blob', observe: 'response' }),
      )
        .then((resposta) => (resposta.status === 200 && resposta.body ? paraDataUrl(resposta.body) : null))
        .catch(() => null);
      this.imagens.set(referencia, pedido);
    }
    return this.imagens.get(referencia)!;
  }

  private url(caminho: string): string {
    return urlDoPerfil(this.sessao.perfilIdObrigatorio(), caminho);
  }
}

function paraDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolver, rejeitar) => {
    const leitor = new FileReader();
    leitor.onload = () => resolver(String(leitor.result));
    leitor.onerror = () => rejeitar(leitor.error);
    leitor.readAsDataURL(blob);
  });
}
