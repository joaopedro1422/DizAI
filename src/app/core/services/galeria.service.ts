import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlDoPerfil } from '../api/api-url';
import { SessaoService } from '../auth/sessao.service';
import { Album, Feedback, Foto, NovoAlbum, NovoFeedback, TipoTopico } from '../models/galeria.model';
import { VisitasGaleria } from '../models/visitas.model';
import { CarregamentoUnico } from '../utils/carregamento-unico';

/** Resposta de GET /albuns: cada tópico traz a contagem e a prévia das primeiras fotos. */
interface GaleriaApi {
  totalAlbuns: number;
  totalFotos: number;
  albuns: AlbumApi[];
}

interface AlbumApi {
  id: number;
  nome: string;
  slug: string;
  descricao: string | null;
  quantidadeFotos: number;
  previa?: Foto[];
  tipo?: TipoTopico | null;
  feedbacks?: Feedback[];
  endereco?: string | null;
}

interface ExclusaoAlbumApi {
  fotosRemovidas: string[];
}

/**
 * Tópicos (álbuns) e fotos da galeria: /api/perfis/{perfilId}/albuns
 * Regra: toda foto pertence a um álbum, por isso só existe `adicionarFotos(albumId, ...)`.
 */
@Injectable({ providedIn: 'root' })
export class GaleriaService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);

  private readonly listaAlbuns = signal<Album[]>([]);
  private readonly carregamento = new CarregamentoUnico();

  readonly albuns = this.listaAlbuns.asReadonly();
  readonly carregando = this.carregamento.carregando;

  readonly totalFotos = computed(() =>
    this.listaAlbuns().reduce((total, album) => total + album.quantidadeFotos, 0),
  );

  carregar(): Promise<void> {
    return this.carregamento.executar(() => this.buscar());
  }

  async criarAlbum(novoAlbum: NovoAlbum): Promise<Album> {
    const album = paraAlbum(await firstValueFrom(this.http.post<AlbumApi>(this.url('/albuns'), novoAlbum)));
    this.listaAlbuns.update((albuns) => [...albuns, album]);
    return album;
  }

  /**
   * Registra as referências das fotos já enviadas pelo ArmazenamentoFotosService.
   * Depois busca a galeria de novo para a prévia e as contagens virem do backend.
   */
  /** "Como chegar": troca o endereço do mapa (nome e descrição continuam os mesmos). */
  async atualizarEndereco(album: Album, endereco: string): Promise<void> {
    await firstValueFrom(
      this.http.put<unknown>(this.url(`/albuns/${album.id}`), { nome: album.nome, descricao: album.descricao, endereco }),
    );
    await this.buscar();
  }

  /** Tópico de feedbacks: cadastra, edita ou exclui um depoimento e busca a galeria de novo. */
  async salvarFeedback(albumId: number, feedback: NovoFeedback, feedbackId: number | null = null): Promise<void> {
    const url = this.url(`/albuns/${albumId}/feedbacks${feedbackId ? '/' + feedbackId : ''}`);
    await firstValueFrom(feedbackId ? this.http.put<unknown>(url, feedback) : this.http.post<unknown>(url, feedback));
    await this.buscar();
  }

  async excluirFeedback(albumId: number, feedbackId: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(this.url(`/albuns/${albumId}/feedbacks/${feedbackId}`)));
    await this.buscar();
  }

  async adicionarFotos(albumId: number, urls: string[]): Promise<void> {
    await firstValueFrom(this.http.post<unknown>(this.url(`/albuns/${albumId}/fotos`), { urls }));
    await this.buscar();
  }

  /**
   * Atualiza a ordem dos tópicos como parte do recurso da galeria.
   * PUT /albuns/ordem recebe todos os IDs na ordem desejada; em seguida o GET
   * confirma e sincroniza a ordem persistida pelo backend.
   */
  async atualizarOrdem(albumIds: number[]): Promise<void> {
    await firstValueFrom(
      this.http.put<void>(this.url('/albuns/ordem'), { albumIds }),
    );
    await this.buscar();
  }

  async excluirAlbum(albumId: number): Promise<void> {
    await firstValueFrom(
      this.http.delete<ExclusaoAlbumApi>(this.url(`/albuns/${albumId}`)),
    );
    this.listaAlbuns.update((albuns) => albuns.filter((album) => album.id !== albumId));
  }

  /** Quantas vezes a galeria pública foi aberta (GET /albuns/visitas). Sempre busca de novo. */
  buscarVisitas(): Promise<VisitasGaleria> {
    return firstValueFrom(this.http.get<VisitasGaleria>(this.url('/albuns/visitas')));
  }

  buscarAlbum(albumId: number): Album | undefined {
    return this.listaAlbuns().find((album) => album.id === albumId);
  }

  reiniciar(): void {
    this.carregamento.reiniciar();
    this.listaAlbuns.set([]);
  }

  private async buscar(): Promise<void> {
    const galeria = await firstValueFrom(this.http.get<GaleriaApi>(this.url('/albuns')));
    this.listaAlbuns.set(galeria.albuns.map(paraAlbum));
  }

  private url(caminho: string): string {
    return urlDoPerfil(this.sessao.perfilIdObrigatorio(), caminho);
  }
}

function paraAlbum({ previa, descricao, tipo, feedbacks, ...album }: AlbumApi): Album {
  return {
    ...album,
    descricao: descricao ?? '',
    fotos: previa ?? [],
    tipo: tipo ?? 'FOTOS',
    feedbacks: feedbacks ?? [],
    endereco: album.endereco ?? null,
  };
}
