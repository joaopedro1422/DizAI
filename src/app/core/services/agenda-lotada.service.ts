import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlDoPerfil } from '../api/api-url';
import { SessaoService } from '../auth/sessao.service';

/** Um período de "Restringir agenda" (datas ISO "AAAA-MM-DD", fim inclusive). */
export interface PeriodoLotado {
  id: string;
  inicio: string;
  fim: string;
}

/** Pedidos → "Restringir agenda": /api/perfis/{id}/pedidos/agenda-lotada. Cada ação devolve a lista atualizada. */
@Injectable({ providedIn: 'root' })
export class AgendaLotadaService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);

  private url(caminho = ''): string {
    return urlDoPerfil(this.sessao.perfilIdObrigatorio(), `/pedidos/agenda-lotada${caminho}`);
  }

  listar(): Promise<PeriodoLotado[]> {
    return firstValueFrom(this.http.get<PeriodoLotado[]>(this.url()));
  }

  restringir(inicio: string, fim: string): Promise<PeriodoLotado[]> {
    return firstValueFrom(this.http.post<PeriodoLotado[]>(this.url(), { inicio, fim }));
  }

  liberar(id: string): Promise<PeriodoLotado[]> {
    return firstValueFrom(this.http.delete<PeriodoLotado[]>(this.url(`/${id}`)));
  }
}
