import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlApi } from '../api/api-url';
import { AgendaPublica, DiaHorarios } from '../models/agenda.model';
import { AlbumPublicoDetalhe, FotoCompartilhada, LojaPublica } from '../models/loja-publica.model';
import { Produto } from '../models/produto.model';

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
  /** profissionalId: com 2+ profissionais, só os horários de quem foi escolhido (sem ele, os de todos juntos). */
  buscarHorarios(slug: string, servicoIds: number[], profissionalId?: string | null): Promise<DiaHorarios[]> {
    const caminho =
      `/public/lojas/${encodeURIComponent(slug)}/agenda/horarios?servicos=${servicoIds.join(',')}` +
      (profissionalId ? `&profissional=${encodeURIComponent(profissionalId)}` : '');
    return firstValueFrom(this.http.get<DiaHorarios[]>(urlApi(caminho)));
  }

  /** Produtos disponíveis para o cliente montar o pedido na aba "Orçamento". */
  buscarOrcamento(slug: string): Promise<Produto[]> {
    return firstValueFrom(this.http.get<Produto[]>(urlApi(`/public/lojas/${encodeURIComponent(slug)}/orcamento`)));
  }

  /** Uma foto da galeria (página /l/{slug}/foto/{id}). */
  buscarFoto(slugLoja: string, fotoId: string): Promise<FotoCompartilhada> {
    const caminho = `/public/lojas/${encodeURIComponent(slugLoja)}/fotos/${encodeURIComponent(fotoId)}`;
    return firstValueFrom(this.http.get<FotoCompartilhada>(urlApi(caminho)));
  }

  /** Todas as fotos de um tópico (a página da loja traz só as primeiras). */
  buscarAlbum(slugLoja: string, slugAlbum: string): Promise<AlbumPublicoDetalhe> {
    const caminho = `/public/lojas/${encodeURIComponent(slugLoja)}/albuns/${encodeURIComponent(slugAlbum)}`;
    return firstValueFrom(this.http.get<AlbumPublicoDetalhe>(urlApi(caminho)));
  }
}
