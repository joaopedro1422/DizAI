import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlApi, urlDoPerfil } from '../api/api-url';
import { SessaoService } from '../auth/sessao.service';
import { InstalacaoAppService } from './instalacao-app.service';

/**
 * indisponivel: navegador sem push ou servidor sem as chaves VAPID.
 * precisa-instalar: iPhone só recebe push com o app instalado na tela de início.
 * desativado: dá para ativar. ativo: este aparelho recebe. bloqueado: o lojista negou no navegador.
 */
export type EstadoNotificacoes = 'indisponivel' | 'precisa-instalar' | 'desativado' | 'ativo' | 'bloqueado';

/** "Testar notificação": aparelhos inscritos neste perfil e em quantos o aviso saiu. */
export interface ResultadoTestePush {
  configurado: boolean;
  aparelhos: number;
  enviados: number;
}

/**
 * Avisos no celular quando um pedido fica pronto para fechar (Web Push).
 * O aparelho se inscreve no navegador e a inscrição vai para POST /api/perfis/{id}/push/inscricoes.
 */
@Injectable({ providedIn: 'root' })
export class NotificacoesPushService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);
  private readonly instalacao = inject(InstalacaoAppService);

  private readonly estadoAtual = signal<EstadoNotificacoes>('indisponivel');
  readonly estado = this.estadoAtual.asReadonly();

  private readonly suportado =
    'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

  constructor() {
    void this.atualizarEstado();
  }

  async atualizarEstado(): Promise<void> {
    if (!this.suportado) {
      const iphoneSemApp = this.instalacao.ehIphone && !this.instalacao.instalado();
      this.estadoAtual.set(iphoneSemApp ? 'precisa-instalar' : 'indisponivel');
      return;
    }
    if (Notification.permission === 'denied') {
      this.estadoAtual.set('bloqueado');
      return;
    }
    if (!(await this.chavePublica())) {
      this.estadoAtual.set('indisponivel');
      return;
    }
    const registro = await navigator.serviceWorker.getRegistration();
    const inscricao = await registro?.pushManager.getSubscription();
    const ativo = !!inscricao && Notification.permission === 'granted';
    this.estadoAtual.set(ativo ? 'ativo' : 'desativado');
    if (ativo && this.sessao.perfilId()) {
      // o backend pode ter perdido a inscrição (troca de servidor, chave nova): reenvia, é idempotente
      void this.ativar().catch(() => undefined);
    }
  }

  /**
   * Pede a permissão primeiro: no iPhone o pedido precisa sair direto do toque no botão, antes de qualquer espera.
   * Devolve o estado final para a tela mostrar a mensagem certa.
   */
  async ativar(): Promise<EstadoNotificacoes> {
    if (!this.suportado) {
      return this.estadoAtual();
    }
    const permissao = await Notification.requestPermission();
    if (permissao !== 'granted') {
      this.estadoAtual.set(permissao === 'denied' ? 'bloqueado' : 'desativado');
      return this.estadoAtual();
    }
    const chave = await this.chavePublica();
    if (!chave) {
      this.estadoAtual.set('indisponivel');
      return this.estadoAtual();
    }
    const registro = await navigator.serviceWorker.ready;
    const bytesDaChave = base64UrlParaBytes(chave);
    let inscricao = await registro.pushManager.getSubscription();
    if (inscricao && !mesmaChave(inscricao, bytesDaChave)) {
      // inscrita com a chave de outro servidor: o push dela nunca chegaria
      await inscricao.unsubscribe();
      inscricao = null;
    }
    inscricao ??= await registro.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bytesDaChave });
    await firstValueFrom(
      this.http.post<void>(urlDoPerfil(this.sessao.perfilIdObrigatorio(), '/push/inscricoes'), inscricao.toJSON()),
    );
    this.estadoAtual.set('ativo');
    return 'ativo';
  }

  /** Manda um aviso de teste para os aparelhos inscritos (este incluído, se o envio deu certo). */
  testar(): Promise<ResultadoTestePush> {
    return firstValueFrom(
      this.http.post<ResultadoTestePush>(urlDoPerfil(this.sessao.perfilIdObrigatorio(), '/push/teste'), null),
    );
  }

  private async chavePublica(): Promise<string | null> {
    try {
      const resposta = await firstValueFrom(
        this.http.get<{ chavePublica: string | null }>(urlApi('/public/push/chave-publica')),
      );
      return resposta.chavePublica || null;
    } catch {
      return null;
    }
  }
}

function mesmaChave(inscricao: PushSubscription, chave: Uint8Array): boolean {
  const atual = inscricao.options.applicationServerKey;
  if (!atual) return true;   // navegador que não informa: fica com a inscrição que tem
  const bytes = new Uint8Array(atual);
  return bytes.length === chave.length && bytes.every((b, i) => b === chave[i]);
}

/** A chave VAPID vem em base64url; o navegador quer os bytes. */
function base64UrlParaBytes(base64Url: string): Uint8Array<ArrayBuffer> {
  const preenchimento = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + preenchimento).replace(/-/g, '+').replace(/_/g, '/');
  const texto = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(texto.length));
  for (let i = 0; i < texto.length; i++) {
    bytes[i] = texto.charCodeAt(i);
  }
  return bytes;
}
