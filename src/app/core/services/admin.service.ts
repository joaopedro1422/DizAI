import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlApi } from '../api/api-url';
import { PainelAdmin } from '../models/admin.model';

/**
 * Gerenciamento da plataforma: GET /api/admin/painel.
 * Só responde para as contas de DIZAI_ADMIN_NUMEROS no backend (as outras recebem 403).
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  private readonly dados = signal<PainelAdmin | null>(null);
  private readonly emAndamento = signal(false);

  readonly painel = this.dados.asReadonly();
  readonly carregando = this.emAndamento.asReadonly();

  /** Sempre busca de novo: os números mudam a cada mensagem e o botão "Atualizar" usa o mesmo método. */
  async carregar(): Promise<void> {
    this.emAndamento.set(true);
    try {
      this.dados.set(await firstValueFrom(this.http.get<PainelAdmin>(urlApi('/api/admin/painel'))));
    } finally {
      this.emAndamento.set(false);
    }
  }
}
