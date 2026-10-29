import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlDoPerfil } from '../api/api-url';
import { SessaoService } from '../auth/sessao.service';
import { Conversa, MensagemConversa } from '../models/conversa.model';
import { CarregamentoUnico } from '../utils/carregamento-unico';

/** A API manda a data como texto ISO; na tela ela vira Date. */
type ConversaApi = Omit<Conversa, 'atualizadaEm'> & { atualizadaEm: string };

/** Conversas do WhatsApp: /api/perfis/{perfilId}/conversas */
@Injectable({ providedIn: 'root' })
export class ConversaService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);

  private readonly listaConversas = signal<Conversa[]>([]);
  private readonly carregamento = new CarregamentoUnico();

  readonly carregando = this.carregamento.carregando;

  /** Conversas que precisam do dono, as mais recentes primeiro. */
  readonly aguardandoDono = computed(() =>
    this.listaConversas()
      .filter((conversa) => conversa.status === 'AGUARDANDO_DONO')
      .sort((a, b) => b.atualizadaEm.getTime() - a.atualizadaEm.getTime()),
  );

  /** Conversas em andamento (com o assistente ou com o dono no celular), as mais recentes primeiro. */
  readonly emAndamento = computed(() =>
    this.listaConversas()
      .filter((conversa) => conversa.status !== 'AGUARDANDO_DONO')
      .sort((a, b) => b.atualizadaEm.getTime() - a.atualizadaEm.getTime()),
  );

  readonly totalConversas = computed(() => this.listaConversas().length);

  carregar(): Promise<void> {
    return this.carregamento.executar(async () => {
      await this.buscar();
      this.carregouUmaVez = true;
    });
  }

  /**
   * Tela de chats: na primeira vez carrega com o "carregando"; nas outras busca de novo em silêncio, porque
   * conversas novas (um pedido que acabou de chegar) não apareciam até recarregar a página.
   */
  abrir(): Promise<void> {
    return this.carregouUmaVez ? this.buscar() : this.carregar();
  }

  private carregouUmaVez = false;

  private async buscar(): Promise<void> {
    const conversas = await firstValueFrom(this.http.get<ConversaApi[]>(this.url()));
    this.listaConversas.set(conversas.map(paraConversa));
  }

  /** O dono resolveu: a conversa sai da fila e volta para o assistente. */
  async marcarComoResolvida(conversaId: string): Promise<void> {
    const resolvida = paraConversa(
      await firstValueFrom(this.http.patch<ConversaApi>(this.url(`/${conversaId}/resolver`), null)),
    );
    this.listaConversas.update((conversas) =>
      conversas.map((conversa) => (conversa.id === conversaId ? resolvida : conversa)),
    );
  }

  /** "Assumir conversa": o assistente para de responder este cliente (volta com o marcarComoResolvida). */
  async assumir(conversaId: string): Promise<Conversa> {
    const assumida = paraConversa(
      await firstValueFrom(this.http.patch<ConversaApi>(this.url(`/${conversaId}/assumir`), null)),
    );
    this.listaConversas.update((conversas) => conversas.map((c) => (c.id === conversaId ? assumida : c)));
    return assumida;
  }

  /** As últimas mensagens da conversa, da mais antiga para a mais nova. */
  async ultimasMensagens(conversaId: string, quantidade = 2): Promise<MensagemConversa[]> {
    const mensagens = await firstValueFrom(
      this.http.get<(Omit<MensagemConversa, 'criadoEm'> & { criadoEm: string })[]>(
        this.url(`/${conversaId}/mensagens`),
        { params: { quantidade } },
      ),
    );
    return mensagens.map((m) => ({ ...m, criadoEm: new Date(m.criadoEm) }));
  }

  /** Uma ação de pedido mudou a conversa (ex.: saiu de "Aguardando você"): troca na lista sem recarregar. */
  substituir(conversa: Conversa): void {
    const normalizada = { ...conversa, motivoEspera: conversa.motivoEspera ?? undefined, resumoPedido: conversa.resumoPedido ?? [] };
    this.listaConversas.update((conversas) => conversas.map((c) => (c.id === normalizada.id ? normalizada : c)));
  }

  reiniciar(): void {
    this.carregamento.reiniciar();
    this.carregouUmaVez = false;
    this.listaConversas.set([]);
  }

  private url(caminho = ''): string {
    return urlDoPerfil(this.sessao.perfilIdObrigatorio(), `/conversas${caminho}`);
  }
}

function paraConversa(conversa: ConversaApi): Conversa {
  return {
    ...conversa,
    motivoEspera: conversa.motivoEspera ?? undefined,
    resumoPedido: conversa.resumoPedido ?? [],
    atualizadaEm: new Date(conversa.atualizadaEm),
  };
}
