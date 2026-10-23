import { Injectable, computed, signal } from '@angular/core';

/** O que o backend devolve no login e no cadastro. */
export interface RespostaAutenticacao {
  token: string;
  /** Data/hora ISO em que o token expira. */
  expiraEm: string;
  perfilId: string;
}

interface SessaoSalva {
  token: string;
  expiraEm: number;
  perfilId: string;
}

const CHAVE_ARMAZENAMENTO = 'dizai:sessao';

/**
 * Sessão do lojista logado: token JWT e UUID do perfil.
 * Fica no localStorage para o login sobreviver ao recarregar a página.
 */
@Injectable({ providedIn: 'root' })
export class SessaoService {
  private readonly sessaoAtual = signal<SessaoSalva | null>(lerSessaoSalva());

  readonly token = computed(() => this.sessaoAtual()?.token ?? null);
  readonly perfilId = computed(() => this.sessaoAtual()?.perfilId ?? null);

  /** Caminho do painel do lojista logado: /painel/{uuid} */
  readonly caminhoPainel = computed(() => {
    const perfilId = this.perfilId();
    return perfilId ? `/painel/${perfilId}` : '/entrar';
  });

  /** Endereços das telas do painel do lojista logado, para links e navegação. */
  readonly rotasDoPainel = computed(() => {
    const inicio = this.caminhoPainel();
    return {
      inicio,
      produtos: `${inicio}/produtos`,
      perguntas: `${inicio}/perguntas`,
      galeria: `${inicio}/galeria`,
      chats: `${inicio}/chats`,
      clientes: `${inicio}/clientes`,
      agenda: `${inicio}/agenda`,
      pedidos: `${inicio}/pedidos`,
      estatisticas: `${inicio}/estatisticas`,
      atendimento: `${inicio}/atendimento`,
      conectarWhatsapp: `${inicio}/conectar-whatsapp`,
      contatosIgnorados: `${inicio}/contatos-ignorados`,
      admin: `${inicio}/admin`,
    };
  });

  estaAutenticado(): boolean {
    const sessao = this.sessaoAtual();
    if (!sessao) {
      return false;
    }
    if (sessao.expiraEm <= Date.now()) {
      this.encerrar();
      return false;
    }
    return true;
  }

  /** UUID do lojista logado. Só é chamado em telas protegidas pelo painelGuard. */
  perfilIdObrigatorio(): string {
    const perfilId = this.perfilId();
    if (!perfilId) {
      throw new Error('Nenhum lojista logado.');
    }
    return perfilId;
  }

  iniciar(resposta: RespostaAutenticacao): void {
    const sessao: SessaoSalva = {
      token: resposta.token,
      perfilId: resposta.perfilId,
      expiraEm: new Date(resposta.expiraEm).getTime(),
    };
    this.sessaoAtual.set(sessao);
    try {
      localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(sessao));
    } catch {
      // Armazenamento bloqueado: a sessão vale só enquanto a aba estiver aberta.
    }
  }

  encerrar(): void {
    this.sessaoAtual.set(null);
    try {
      localStorage.removeItem(CHAVE_ARMAZENAMENTO);
    } catch {
      // Nada a remover.
    }
  }
}

function lerSessaoSalva(): SessaoSalva | null {
  try {
    const texto = localStorage.getItem(CHAVE_ARMAZENAMENTO);
    if (!texto) {
      return null;
    }
    const sessao = JSON.parse(texto) as Partial<SessaoSalva>;
    if (!sessao.token || !sessao.perfilId || !sessao.expiraEm || sessao.expiraEm <= Date.now()) {
      return null;
    }
    return { token: sessao.token, perfilId: sessao.perfilId, expiraEm: sessao.expiraEm };
  } catch {
    return null;
  }
}
