import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlDoPerfil } from '../api/api-url';
import { SessaoService } from '../auth/sessao.service';

export type OrigemMensagemTeste = 'CLIENTE' | 'BOT' | 'DONO';

export interface MensagemTeste {
  origem: OrigemMensagemTeste;
  texto: string;
  criadoEm: string;
}

/** O que o assistente decidiu na última mensagem (TRANSFERIR_HUMANO e SEM_INFORMACAO viram aviso na tela). */
export type AcaoTeste = 'RESPONDER' | 'SEM_INFORMACAO' | 'TRANSFERIR_HUMANO' | 'AGENDAR' | 'CANCELAR_AGENDAMENTO' | 'CONFIRMAR_PRESENCA';

export interface RespostaTeste {
  mensagens: MensagemTeste[];
  acao: AcaoTeste | null;
}

/**
 * "Testar atendimento": o lojista conversa com o próprio assistente como cliente.
 * /api/perfis/{perfilId}/teste-atendimento (o backend usa o mesmo fluxo e prompt do WhatsApp; nada é enviado).
 */
@Injectable({ providedIn: 'root' })
export class TesteAtendimentoService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);

  mensagens(): Promise<MensagemTeste[]> {
    return firstValueFrom(this.http.get<MensagemTeste[]>(this.url('/mensagens')));
  }

  enviar(texto: string): Promise<RespostaTeste> {
    return firstValueFrom(this.http.post<RespostaTeste>(this.url('/mensagens'), { texto }));
  }

  recomecar(): Promise<void> {
    return firstValueFrom(this.http.delete<void>(this.url()));
  }

  private url(caminho = ''): string {
    return urlDoPerfil(this.sessao.perfilIdObrigatorio(), `/teste-atendimento${caminho}`);
  }
}
