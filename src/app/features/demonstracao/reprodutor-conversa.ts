import { computed, signal } from '@angular/core';

import { LinhaFormatada, formatarWhatsapp } from '../painel/teste-atendimento/formatacao-whatsapp';
import { DEMONSTRACOES, PassoConversa, SegmentoDemonstracao, TipoNegocio, acharSegmento } from './conversas-demonstracao';

/** Um passo pronto para a tela: com a hora da mensagem e o texto já formatado como no WhatsApp. */
export interface ItemConversa extends PassoConversa {
  hora: string;
  linhas: LinhaFormatada[];
}

/** Ritmo de uma conversa de verdade (em ms, na velocidade normal). */
const LEITURA_CLIENTE_MS = 1400;
const DIGITACAO_MINIMA_MS = 900;
const POR_CARACTERE_MS = 14;
const DIGITACAO_MAXIMA_MS = 2600;
const VELOCIDADE_RAPIDA = 2.2;
/** Quanto tempo a tela do painel fica no celular antes de voltar ao WhatsApp (o roteiro de cada tela cabe nisso). */
export const DURACAO_TELA_MS = { pedidos: 7200, agenda: 4800 } as const;

export interface OpcoesReprodutor {
  /** Chamado quando um passo entra na conversa (o hero usa para o aviso e a legenda). */
  aoMostrar?: (item: ItemConversa) => void;
  /** Chamado quando a conversa termina. */
  aoTerminar?: () => void;
}

/**
 * Toca uma conversa de demonstração sozinha: o cliente "lê e responde", o assistente "digita" antes de cada mensagem.
 * Usado pelo hero da landing e pela página /demonstracao. Quem usa chama `parar()` ao ser destruído.
 */
export class ReprodutorConversa {
  readonly tipo = signal<TipoNegocio>('servicos');
  readonly segmento = signal<SegmentoDemonstracao>(DEMONSTRACOES.servicos.segmentos[0]);
  readonly itens = computed(() => prepararItens(this.segmento()));

  /** Quantos passos já entraram na conversa. */
  readonly mostrados = signal(0);
  readonly digitando = signal(false);
  readonly pausado = signal(false);
  readonly rapido = signal(false);

  readonly visiveis = computed(() => this.itens().slice(0, this.mostrados()));
  readonly terminou = computed(() => this.mostrados() >= this.itens().length);
  readonly alcancados = computed(() => new Set(this.visiveis().flatMap((item) => (item.destaque ? [item.destaque] : []))));
  /** A tela do painel no celular, enquanto ela for o último passo (o próximo passo volta ao WhatsApp). */
  readonly telaAtual = computed(() => {
    const ultimo = this.visiveis().at(-1);
    return ultimo?.de === 'tela' ? ultimo : null;
  });

  private temporizador: ReturnType<typeof setTimeout> | undefined;

  constructor(private readonly opcoes: OpcoesReprodutor = {}) {}

  escolher(tipo: TipoNegocio, idSegmento?: string | null): void {
    this.tipo.set(tipo);
    this.segmento.set(acharSegmento(tipo, idSegmento));
    this.recomecar();
  }

  recomecar(): void {
    this.parar();
    this.mostrados.set(0);
    this.pausado.set(false);
    this.agendarProximo();
  }

  pausar(pausado: boolean): void {
    if (pausado === this.pausado() || this.terminou()) {
      return;
    }
    this.pausado.set(pausado);
    this.parar();
    if (!pausado) {
      this.agendarProximo();
    }
  }

  alternarVelocidade(): void {
    this.rapido.update((rapido) => !rapido);
  }

  parar(): void {
    clearTimeout(this.temporizador);
    this.digitando.set(false);
  }

  private agendarProximo(): void {
    const proximo = this.itens()[this.mostrados()];
    if (this.pausado()) {
      return;
    }
    if (!proximo) {
      this.opcoes.aoTerminar?.();
      return;
    }
    this.digitando.set(proximo.de === 'assistente' || proximo.de === 'dono');
    // a tela do painel fica à vista até o próximo passo: ele espera o roteiro dela terminar
    const anterior = this.itens()[this.mostrados() - 1];
    const tela = anterior?.de === 'tela' ? DURACAO_TELA_MS[anterior.pedido ? 'pedidos' : 'agenda'] : 0;
    this.temporizador = setTimeout(() => {
      this.digitando.set(false);
      this.mostrados.update((quantos) => quantos + 1);
      this.opcoes.aoMostrar?.(proximo);
      this.agendarProximo();
    }, tela + espera(proximo) / (this.rapido() ? VELOCIDADE_RAPIDA : 1));
  }
}

function espera(item: ItemConversa): number {
  const tamanho = item.texto?.length ?? 0;
  switch (item.de) {
    case 'cliente':
      return LEITURA_CLIENTE_MS + Math.min(tamanho * 20, 1600);
    case 'assistente':
    case 'dono':
      return Math.min(DIGITACAO_MINIMA_MS + tamanho * POR_CARACTERE_MS, DIGITACAO_MAXIMA_MS);
    case 'automatica':
      return 1100;
    case 'dia':
      return 1700;
    default:
      return 850;
  }
}

/**
 * A hora anda um minuto a cada duas mensagens; o separador de dia recomeça às 09:30 e um passo com `hora`
 * (lembrete, agradecimento) vai para ela.
 */
function prepararItens(segmento: SegmentoDemonstracao): ItemConversa[] {
  let minutos = emMinutos(segmento.inicio);
  return segmento.passos.map((passo, indice) => {
    if (passo.hora) {
      minutos = emMinutos(passo.hora);
    } else if (passo.de === 'dia') {
      minutos = 9 * 60 + 30;
    } else if (indice % 2 === 0) {
      minutos += 1;
    }
    const hora = `${String(Math.floor(minutos / 60) % 24).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
    const escrita = passo.de === 'cliente' || passo.de === 'assistente' || passo.de === 'dono' || passo.de === 'automatica';
    return { ...passo, hora, linhas: escrita && passo.texto ? formatarWhatsapp(passo.texto) : [] };
  });
}

function emMinutos(hora: string): number {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}
