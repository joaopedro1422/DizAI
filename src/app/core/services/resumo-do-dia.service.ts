import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlDoPerfil } from '../api/api-url';
import { SessaoService } from '../auth/sessao.service';
import { ResumoDoDia } from '../models/resumo-do-dia.model';

/** Fechamento do dia: /api/perfis/{perfilId}/resumo-do-dia */
@Injectable({ providedIn: 'root' })
export class ResumoDoDiaService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);

  /** hoje = true: os números de hoje até agora, mesmo com o expediente aberto. */
  buscar(hoje = false): Promise<ResumoDoDia> {
    const params = new HttpParams().set('hoje', hoje);
    return firstValueFrom(
      this.http.get<ResumoDoDia>(urlDoPerfil(this.sessao.perfilIdObrigatorio(), '/resumo-do-dia'), { params }),
    );
  }
}
