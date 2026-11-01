import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlApi } from '../api/api-url';
import { PainelAdmin, SenhaTemporaria, SolicitacaoSenha } from '../models/admin.model';

/**
 * Gerenciamento da plataforma: GET /api/admin/painel.
 * Só responde para as contas de DIZAI_ADMIN_NUMEROS no backend (as outras recebem 403).
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  private readonly dados = signal<PainelAdmin | null>(null);
  private readonly emAndamento = signal(false);

  private readonly pedidosSenha = signal<SolicitacaoSenha[]>([]);

  readonly painel = this.dados.asReadonly();
  readonly carregando = this.emAndamento.asReadonly();
  /** "Esqueci minha senha" ainda abertos, os mais antigos primeiro. */
  readonly solicitacoesSenha = this.pedidosSenha.asReadonly();

  /**
   * Sempre busca de novo: os números mudam a cada mensagem e o botão "Atualizar" usa o mesmo método.
   * `mes` ("2026-10") troca o mês do custo da IA; sem ele, o mês atual.
   */
  async carregar(mes?: string): Promise<void> {
    this.emAndamento.set(true);
    try {
      const params: Record<string, string> = mes ? { mes } : {};
      const [painel, solicitacoes] = await Promise.all([
        firstValueFrom(this.http.get<PainelAdmin>(urlApi('/api/admin/painel'), { params })),
        firstValueFrom(this.http.get<SolicitacaoSenha[]>(urlApi('/api/admin/solicitacoes-senha'))),
      ]);
      this.dados.set(painel);
      this.pedidosSenha.set(solicitacoes);
    } finally {
      this.emAndamento.set(false);
    }
  }

  /** Troca a senha da conta por uma temporária; o pedido sai da lista. */
  async gerarSenhaTemporaria(solicitacaoId: string): Promise<SenhaTemporaria> {
    const senha = await firstValueFrom(
      this.http.post<SenhaTemporaria>(urlApi(`/api/admin/solicitacoes-senha/${solicitacaoId}/senha-temporaria`), null),
    );
    this.tirarDaLista(solicitacaoId);
    return senha;
  }

  async descartarSolicitacao(solicitacaoId: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(urlApi(`/api/admin/solicitacoes-senha/${solicitacaoId}`)));
    this.tirarDaLista(solicitacaoId);
  }

  private tirarDaLista(solicitacaoId: string): void {
    this.pedidosSenha.update((lista) => lista.filter((s) => s.id !== solicitacaoId));
  }
}
