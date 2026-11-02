import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlDoPerfil } from '../api/api-url';
import { SessaoService } from '../auth/sessao.service';
import { NovoRetorno, RetornoCliente } from '../models/retorno-cliente.model';

/** Retornos dos clientes (agenda): /api/perfis/{perfilId}/agenda/retornos */
@Injectable({ providedIn: 'root' })
export class RetornoClienteService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);

  /** Os retornos da loja (os que já passaram há até 30 dias e os próximos), o mais próximo primeiro. */
  readonly retornos = signal<RetornoCliente[]>([]);

  async carregar(): Promise<void> {
    this.retornos.set(await firstValueFrom(this.http.get<RetornoCliente[]>(this.url())));
  }

  /** Marca o retorno; o cliente que já tinha um pendente fica com a data nova. */
  async salvar(novo: NovoRetorno): Promise<void> {
    const salvo = await firstValueFrom(this.http.put<RetornoCliente>(this.url(), novo));
    this.retornos.update((lista) =>
      [...lista.filter((r) => r.id !== salvo.id), salvo].sort((a, b) => a.data.localeCompare(b.data)),
    );
  }

  async excluir(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(this.url(`/${id}`)));
    this.retornos.update((lista) => lista.filter((r) => r.id !== id));
  }

  private url(caminho = ''): string {
    return urlDoPerfil(this.sessao.perfilIdObrigatorio(), `/agenda/retornos${caminho}`);
  }
}
