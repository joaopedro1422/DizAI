import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlDoPerfil } from '../api/api-url';
import { SessaoService } from '../auth/sessao.service';
import { Cliente, DetalheCliente, HistoricoCliente } from '../models/cliente.model';

type Datas<T, K extends keyof T> = Omit<T, K> & { [P in K]: string | null };
type ClienteApi = Datas<Cliente, 'ultimaVez' | 'proximo' | 'ultimaConversa' | 'clienteDesde'>;
type HistoricoApi = Datas<HistoricoCliente, 'quando'>;
type DetalheApi = Omit<DetalheCliente, 'cliente' | 'historico'> & { cliente: ClienteApi; historico: HistoricoApi[] };

/** Clientes da loja: /api/perfis/{perfilId}/clientes (a lista e o cliente aberto no modal). */
@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);

  readonly clientes = signal<Cliente[]>([]);

  async carregar(): Promise<void> {
    const lista = await firstValueFrom(this.http.get<ClienteApi[]>(this.url()));
    this.clientes.set(lista.map(paraCliente));
  }

  async detalhe(id: string): Promise<DetalheCliente> {
    const detalhe = await firstValueFrom(this.http.get<DetalheApi>(this.url(`/${encodeURIComponent(id)}`)));
    return {
      ...detalhe,
      cliente: paraCliente(detalhe.cliente),
      historico: detalhe.historico.map((h) => ({ ...h, quando: new Date(h.quando ?? 0) })),
    };
  }

  reiniciar(): void {
    this.clientes.set([]);
  }

  private url(caminho = ''): string {
    return urlDoPerfil(this.sessao.perfilIdObrigatorio(), `/clientes${caminho}`);
  }
}

function data(valor: string | null): Date | null {
  return valor ? new Date(valor) : null;
}

function paraCliente(c: ClienteApi): Cliente {
  return {
    ...c,
    valor: Number(c.valor),
    ultimaVez: data(c.ultimaVez),
    proximo: data(c.proximo),
    ultimaConversa: data(c.ultimaConversa),
    clienteDesde: data(c.clienteDesde),
  };
}
