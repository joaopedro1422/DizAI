import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlDoPerfil } from '../api/api-url';
import { SessaoService } from '../auth/sessao.service';
import { Estatisticas, PerguntaSemResposta } from '../models/estatisticas.model';

/** Estatísticas do assistente e perguntas que ele não soube responder: /api/perfis/{perfilId}/... */
@Injectable({ providedIn: 'root' })
export class EstatisticasService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);

  /** Sugestões de pergunta frequente (o que os clientes perguntaram e ficou sem resposta). */
  readonly perguntasSemResposta = signal<PerguntaSemResposta[]>([]);

  buscar(dias: number): Promise<Estatisticas> {
    const params = new HttpParams().set('dias', dias);
    return firstValueFrom(this.http.get<Estatisticas>(this.url('/estatisticas'), { params }));
  }

  async carregarPerguntasSemResposta(): Promise<void> {
    this.perguntasSemResposta.set(
      await firstValueFrom(this.http.get<PerguntaSemResposta[]>(this.url('/perguntas-sem-resposta'))),
    );
  }

  /** Respondida (virou pergunta frequente) ou descartada. */
  async resolverPerguntaSemResposta(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(this.url(`/perguntas-sem-resposta/${id}`)));
    this.perguntasSemResposta.update((lista) => lista.filter((p) => p.id !== id));
  }

  reiniciar(): void {
    this.perguntasSemResposta.set([]);
  }

  private url(caminho: string): string {
    return urlDoPerfil(this.sessao.perfilIdObrigatorio(), caminho);
  }
}
