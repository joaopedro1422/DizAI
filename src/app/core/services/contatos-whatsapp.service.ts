import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlDoPerfil } from '../api/api-url';
import { SessaoService } from '../auth/sessao.service';
import { ContatoWhatsapp } from '../models/contato.model';
import { CarregamentoUnico } from '../utils/carregamento-unico';

/**
 * Agenda do app WhatsApp Business do lojista, para ele escolher quem é pessoal:
 * GET /api/perfis/{perfilId}/contatos-whatsapp
 *
 * Na conexão pelo app (coexistência) o backend pede a sincronização da agenda e a Meta envia
 * o webhook `smb_app_state_sync` com nome e número de cada contato (e de novo a cada mudança no celular).
 * Só existe com o WhatsApp conectado (a tela checa `whatsappConectado` antes de mostrar).
 */
@Injectable({ providedIn: 'root' })
export class ContatosWhatsappService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);

  private readonly lista = signal<ContatoWhatsapp[]>([]);
  private readonly carregamento = new CarregamentoUnico();

  readonly contatos = this.lista.asReadonly();
  readonly carregando = this.carregamento.carregando;

  carregar(): Promise<void> {
    return this.carregamento.executar(async () => {
      const url = urlDoPerfil(this.sessao.perfilIdObrigatorio(), '/contatos-whatsapp');
      this.lista.set(await firstValueFrom(this.http.get<ContatoWhatsapp[]>(url)));
    });
  }

  reiniciar(): void {
    this.carregamento.reiniciar();
    this.lista.set([]);
  }
}
