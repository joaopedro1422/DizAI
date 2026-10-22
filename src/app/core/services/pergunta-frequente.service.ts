import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlDoPerfil } from '../api/api-url';
import { SessaoService } from '../auth/sessao.service';
import { NovaPerguntaFrequente, PerguntaFrequente } from '../models/pergunta-frequente.model';
import { CarregamentoUnico } from '../utils/carregamento-unico';

/** Perguntas frequentes da loja: /api/perfis/{perfilId}/perguntas */
@Injectable({ providedIn: 'root' })
export class PerguntaFrequenteService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);

  private readonly listaPerguntas = signal<PerguntaFrequente[]>([]);
  private readonly carregamento = new CarregamentoUnico();

  readonly perguntas = this.listaPerguntas.asReadonly();
  readonly carregando = this.carregamento.carregando;

  carregar(): Promise<void> {
    return this.carregamento.executar(async () => {
      this.listaPerguntas.set(await firstValueFrom(this.http.get<PerguntaFrequente[]>(this.url())));
    });
  }

  async adicionar(novaPergunta: NovaPerguntaFrequente): Promise<PerguntaFrequente> {
    const pergunta = await firstValueFrom(this.http.post<PerguntaFrequente>(this.url(), novaPergunta));
    this.listaPerguntas.update((perguntas) => [pergunta, ...perguntas]);
    return pergunta;
  }

  async atualizar(id: number, dados: NovaPerguntaFrequente): Promise<PerguntaFrequente> {
    const pergunta = await firstValueFrom(this.http.put<PerguntaFrequente>(`${this.url()}/${id}`, dados));
    this.listaPerguntas.update((perguntas) => perguntas.map((item) => (item.id === id ? pergunta : item)));
    return pergunta;
  }

  async remover(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.url()}/${id}`));
    this.listaPerguntas.update((perguntas) => perguntas.filter((item) => item.id !== id));
  }

  reiniciar(): void {
    this.carregamento.reiniciar();
    this.listaPerguntas.set([]);
  }

  private url(): string {
    return urlDoPerfil(this.sessao.perfilIdObrigatorio(), '/perguntas');
  }
}
