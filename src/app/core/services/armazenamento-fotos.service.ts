import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlDoPerfil } from '../api/api-url';
import { SessaoService } from '../auth/sessao.service';

/**
 * Pasta da loja onde as imagens vão ficar no Firebase Storage:
 * lojas/{slug}/perfil, lojas/{slug}/galeria/{tópico} ou lojas/{slug}/produtos.
 */
export type DestinoImagem =
  | { tipo: 'PERFIL' }
  | { tipo: 'CAPA' }
  | { tipo: 'GALERIA'; albumId: number }
  | { tipo: 'PRODUTOS' };

/**
 * Envia as imagens ao backend (POST /api/perfis/{perfilId}/arquivos, multipart), que grava no Firebase Storage
 * e devolve as referências. São essas referências (não URLs) que vão para o perfil, a galeria e os produtos.
 * Para exibir, use o pipe `urlImagem`.
 */
@Injectable({ providedIn: 'root' })
export class ArmazenamentoFotosService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);

  async enviar(arquivos: File[], destino: DestinoImagem): Promise<string[]> {
    const formulario = new FormData();
    arquivos.forEach((arquivo) => formulario.append('arquivos', arquivo, arquivo.name));

    let parametros = new HttpParams().set('destino', destino.tipo);
    if (destino.tipo === 'GALERIA') {
      parametros = parametros.set('albumId', destino.albumId);
    }

    const url = urlDoPerfil(this.sessao.perfilIdObrigatorio(), '/arquivos');
    const resposta = await firstValueFrom(
      this.http.post<{ referencias: string[] }>(url, formulario, { params: parametros }),
    );
    return resposta.referencias;
  }
}
