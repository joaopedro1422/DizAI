import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlApi } from '../api/api-url';
import { AlbumPublicoDetalhe, LojaPublica } from '../models/loja-publica.model';

/** Página pública da loja (sem login): /public/lojas/{slug} */
@Injectable({ providedIn: 'root' })
export class LojaPublicaService {
  private readonly http = inject(HttpClient);

  buscarLoja(slug: string): Promise<LojaPublica> {
    return firstValueFrom(this.http.get<LojaPublica>(urlApi(`/public/lojas/${encodeURIComponent(slug)}`)));
  }

  /** Todas as fotos de um tópico (a página da loja traz só as primeiras). */
  buscarAlbum(slugLoja: string, slugAlbum: string): Promise<AlbumPublicoDetalhe> {
    const caminho = `/public/lojas/${encodeURIComponent(slugLoja)}/albuns/${encodeURIComponent(slugAlbum)}`;
    return firstValueFrom(this.http.get<AlbumPublicoDetalhe>(urlApi(caminho)));
  }
}
