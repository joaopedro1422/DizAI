import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

/** O que o cadastro da Meta devolve e o backend precisa para concluir a conexão. */
export interface ResultadoCadastroMeta {
  /** Código de uso único (vale ~30 s) que o backend troca pelo token da loja. */
  code: string;
  wabaId: string;
  /** No fluxo do app WhatsApp Business a Meta pode não mandar; o backend descobre pela conta. */
  phoneNumberId: string | null;
}

/** Erro com mensagem pronta para o lojista. `cancelado` = ele fechou a janela da Meta. */
export class ErroCadastroMeta extends Error {
  constructor(
    mensagem: string,
    readonly cancelado = false,
  ) {
    super(mensagem);
  }
}

interface RespostaLoginFacebook {
  authResponse?: { code?: string } | null;
  status?: string;
}

interface SdkFacebook {
  init(opcoes: { appId: string; autoLogAppEvents: boolean; xfbml: boolean; version: string }): void;
  login(callback: (resposta: RespostaLoginFacebook) => void, opcoes: Record<string, unknown>): void;
}

type JanelaComFacebook = Window & { FB?: SdkFacebook; fbAsyncInit?: () => void };

/** Mensagem que a janela da Meta envia por postMessage durante o cadastro. */
interface EventoCadastroMeta {
  type: 'WA_EMBEDDED_SIGNUP';
  event: string;
  data?: { waba_id?: string; phone_number_id?: string; current_step?: string; error_message?: string };
}

const URL_SDK = 'https://connect.facebook.net/pt_BR/sdk.js';
/** Depois do code, quanto esperar pela mensagem com o waba_id (ela pode chegar logo depois). */
const ESPERA_DADOS_DA_CONTA_MS = 10_000;

/**
 * Cadastro incorporado da Meta (Embedded Signup) no modo do app WhatsApp Business (coexistência):
 * o lojista continua usando o app no celular e o DizAI passa a receber e responder pela Cloud API.
 *
 * Duas respostas chegam separadas e precisam ser juntadas:
 * 1. o callback do FB.login traz o `code`;
 * 2. a janela da Meta manda um postMessage `WA_EMBEDDED_SIGNUP` com o `waba_id` (e às vezes o `phone_number_id`).
 */
@Injectable({ providedIn: 'root' })
export class CadastroIncorporadoMetaService {
  private carregamentoSdk: Promise<SdkFacebook> | null = null;

  /** Falta preencher appId/configId em environment.ts. */
  readonly configurado = Boolean(environment.meta.appId && environment.meta.configId);

  /** Baixa o SDK do Facebook com antecedência: o FB.login precisa rodar direto no clique (senão o navegador bloqueia o pop-up). */
  prepararSdk(): Promise<SdkFacebook> {
    this.carregamentoSdk ??= carregarSdk();
    this.carregamentoSdk.catch(() => (this.carregamentoSdk = null));
    return this.carregamentoSdk;
  }

  /** O SDK já está pronto para abrir a janela no clique. */
  sdkPronto(): boolean {
    return Boolean((window as JanelaComFacebook).FB);
  }

  /** Abre a janela da Meta. Chame direto no clique do botão, com o SDK já preparado. */
  iniciar(): Promise<ResultadoCadastroMeta> {
    const sdk = (window as JanelaComFacebook).FB;
    if (!this.configurado) {
      return Promise.reject(new ErroCadastroMeta('A conexão com o WhatsApp ainda não foi configurada. Fale com o suporte.'));
    }
    if (!sdk) {
      return Promise.reject(new ErroCadastroMeta('A janela da Meta ainda está carregando. Tente de novo em alguns segundos.'));
    }

    return new Promise<ResultadoCadastroMeta>((resolver, rejeitar) => {
      let code: string | null = null;
      let dadosDaConta: { wabaId: string; phoneNumberId: string | null } | null = null;
      let temporizador: ReturnType<typeof setTimeout> | undefined;
      let encerrado = false;

      const encerrar = () => {
        encerrado = true;
        window.removeEventListener('message', aoReceberMensagem);
        clearTimeout(temporizador);
      };
      const falhar = (erro: ErroCadastroMeta) => {
        encerrar();
        rejeitar(erro);
      };
      const concluirSePronto = () => {
        if (code && dadosDaConta) {
          encerrar();
          resolver({ code, ...dadosDaConta });
        }
      };

      const aoReceberMensagem = (mensagem: MessageEvent) => {
        if (!origemDoFacebook(mensagem.origin)) {
          return;
        }
        const evento = lerEvento(mensagem.data);
        if (!evento) {
          return;
        }
        if (evento.event.startsWith('FINISH') && evento.data?.waba_id) {
          dadosDaConta = { wabaId: evento.data.waba_id, phoneNumberId: evento.data.phone_number_id ?? null };
          concluirSePronto();
        } else if (evento.event === 'CANCEL') {
          falhar(new ErroCadastroMeta('A conexão foi interrompida antes de terminar.', true));
        } else if (evento.event === 'ERROR') {
          falhar(new ErroCadastroMeta(evento.data?.error_message || 'A Meta não conseguiu concluir a conexão.'));
        }
      };
      window.addEventListener('message', aoReceberMensagem);

      // O SDK não aceita função async aqui.
      sdk.login(
        (resposta) => {
          code = resposta.authResponse?.code ?? null;
          if (!code) {
            falhar(new ErroCadastroMeta('A conexão foi interrompida antes de terminar.', true));
            return;
          }
          concluirSePronto();
          if (encerrado) {
            return;
          }
          temporizador = setTimeout(
            () => falhar(new ErroCadastroMeta('A Meta não informou a conta do WhatsApp. Tente conectar de novo.')),
            ESPERA_DADOS_DA_CONTA_MS,
          );
        },
        {
          config_id: environment.meta.configId,
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            setup: {},
            featureType: 'whatsapp_business_app_onboarding',
            sessionInfoVersion: '3',
          },
        },
      );
    });
  }
}

function origemDoFacebook(origem: string): boolean {
  try {
    const { hostname } = new URL(origem);
    return hostname === 'facebook.com' || hostname.endsWith('.facebook.com');
  } catch {
    return false;
  }
}

function lerEvento(dados: unknown): EventoCadastroMeta | null {
  try {
    const evento = (typeof dados === 'string' ? JSON.parse(dados) : dados) as Partial<EventoCadastroMeta> | null;
    return evento?.type === 'WA_EMBEDDED_SIGNUP' && typeof evento.event === 'string'
      ? (evento as EventoCadastroMeta)
      : null;
  } catch {
    return null;
  }
}

function carregarSdk(): Promise<SdkFacebook> {
  const janela = window as JanelaComFacebook;
  if (janela.FB) {
    return Promise.resolve(janela.FB);
  }
  return new Promise<SdkFacebook>((resolver, rejeitar) => {
    janela.fbAsyncInit = () => {
      const sdk = janela.FB as SdkFacebook;
      sdk.init({
        appId: environment.meta.appId,
        autoLogAppEvents: true,
        xfbml: false,
        version: environment.meta.versaoGraphApi,
      });
      resolver(sdk);
    };
    const script = document.createElement('script');
    script.src = URL_SDK;
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => {
      script.remove();
      rejeitar(new ErroCadastroMeta('Não foi possível carregar a janela da Meta. Confira sua internet ou desative o bloqueador de anúncios.'));
    };
    document.body.appendChild(script);
  });
}
