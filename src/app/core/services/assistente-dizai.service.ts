import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';

import { urlApi } from '../api/api-url';

/** Uma pergunta do visitante e a resposta do assistente. */
export interface TrocaDizai {
  pergunta: string;
  resposta: string;
}

/** "Pergunte ao DizAI" da landing (público): POST /public/assistente-dizai/perguntas */
@Injectable({ providedIn: 'root' })
export class AssistenteDizaiService {
  private readonly http = inject(HttpClient);

  /** As últimas trocas vão junto para a IA entender perguntas como "e para salão?". */
  perguntar(pergunta: string, historico: TrocaDizai[]): Promise<string> {
    return firstValueFrom(
      this.http
        .post<{ resposta: string }>(urlApi('/public/assistente-dizai/perguntas'), { pergunta, historico })
        .pipe(map((corpo) => corpo.resposta)),
    );
  }
}
