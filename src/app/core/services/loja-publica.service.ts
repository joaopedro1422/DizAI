import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlApi } from '../api/api-url';
import { AgendaPublica, DiaHorarios } from '../models/agenda.model';
import { AlbumPublicoDetalhe, LojaPublica } from '../models/loja-publica.model';

/** Página pública da loja (sem login): /public/lojas/{slug} */
@Injectable({ providedIn: 'root' })
export class LojaPublicaService {
  private readonly http = inject(HttpClient);

  buscarLoja(slug: string): Promise<LojaPublica> {
    return firstValueFrom(this.http.get<LojaPublica>(urlApi(`/public/lojas/${encodeURIComponent(slug)}`)));
  }

  /** Conta uma visita à galeria. Falhar aqui não pode atrapalhar a página do cliente. */
  async registrarVisita(slug: string): Promise<void> {
    try {
      await firstValueFrom(this.http.post<void>(urlApi(`/public/lojas/${encodeURIComponent(slug)}/visitas`), null));
    } catch {
      // só um contador: sem aviso para o cliente
    }
  }

  /** Serviços que o cliente pode marcar pela agenda online. */
  buscarAgenda(slug: string): Promise<AgendaPublica> {
    return firstValueFrom(this.http.get<AgendaPublica>(urlApi(`/public/lojas/${encodeURIComponent(slug)}/agenda`)));
  }

  /** Horários livres de cada dia para os serviços escolhidos (a soma das durações). */
  buscarHorarios(slug: string, servicoIds: number[]): Promise<DiaHorarios[]> {
    const caminho = `/public/lojas/${encodeURIComponent(slug)}/agenda/horarios?servicos=${servicoIds.join(',')}`;
    return firstValueFrom(this.http.get<DiaHorarios[]>(urlApi(caminho)));
  }

  /** Todas as fotos de um tópico (a página da loja traz só as primeiras). */
  buscarAlbum(slugLoja: string, slugAlbum: string): Promise<AlbumPublicoDetalhe> {
    const caminho = `/public/lojas/${encodeURIComponent(slugLoja)}/albuns/${encodeURIComponent(slugAlbum)}`;
    return firstValueFrom(this.http.get<AlbumPublicoDetalhe>(urlApi(caminho)));
  }
}
