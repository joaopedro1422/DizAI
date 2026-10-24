import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlDoPerfil } from '../api/api-url';
import { SessaoService } from '../auth/sessao.service';
import { MensagemPronta, NovaMensagemPronta } from '../models/agenda.model';
import { Conversa } from '../models/conversa.model';
import { NumerosPedidos, Pedido, SituacaoAviso } from '../models/pedido.model';
import { CarregamentoUnico } from '../utils/carregamento-unico';
import { ConversaService } from './conversa.service';

/** A API manda as datas como texto ISO; na tela elas viram Date. */
type PedidoApi = Omit<Pedido, 'confirmadoEm' | 'prontoEm' | 'entregueEm'> & {
  confirmadoEm: string;
  prontoEm: string | null;
  entregueEm: string | null;
};
type RespostaApi = { pedido: PedidoApi; conversa: (Omit<Conversa, 'atualizadaEm'> & { atualizadaEm: string }) | null; aviso: SituacaoAviso };
type NumerosApi = Omit<NumerosPedidos, 'entreguesRecentes'> & { entreguesRecentes: PedidoApi[] };

/** Resultado de uma ação: o pedido como ficou e se o aviso ao cliente saiu. */
export interface ResultadoAcaoPedido {
  pedido: Pedido;
  aviso: SituacaoAviso;
}

/**
 * Pedidos das lojas de produtos: /api/perfis/{perfilId}/pedidos.
 * As ações que nascem na tela de chats também atualizam a conversa lá (ela sai de "Aguardando você").
 */
@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);
  private readonly conversaService = inject(ConversaService);
  private readonly carregamento = new CarregamentoUnico();

  private readonly lista = signal<Pedido[]>([]);
  readonly carregando = this.carregamento.carregando;
  /** Em andamento, os mais antigos primeiro (quem pediu antes, sai antes). */
  readonly emAndamento = this.lista.asReadonly();
  readonly emPreparo = computed(() => this.lista().filter((p) => p.status === 'CONFIRMADO'));
  readonly prontos = computed(() => this.lista().filter((p) => p.status === 'PRONTO'));
  readonly mensagensProntas = signal<MensagemPronta[]>([]);

  carregar(): Promise<void> {
    return this.carregamento.executar(async () => {
      const pedidos = await firstValueFrom(this.http.get<PedidoApi[]>(this.url()));
      this.lista.set(pedidos.map(paraPedido));
      this.carregouUmaVez = true;
    });
  }

  /** Tela de pedidos: na primeira vez carrega com o "carregando"; nas outras busca de novo em silêncio. */
  abrir(): Promise<void> {
    return this.carregouUmaVez ? this.atualizar() : this.carregar();
  }

  private carregouUmaVez = false;

  /** Busca de novo, sem o "carregando" (a tela de pedidos aberta o dia todo, ex.: no computador da cozinha). */
  async atualizar(): Promise<void> {
    const pedidos = await firstValueFrom(this.http.get<PedidoApi[]>(this.url()));
    this.lista.set(pedidos.map(paraPedido));
  }

  /** Card da conversa: "Pedido confirmado" (vai para a lista) ou "Pedido entregue" (já entra no faturamento). */
  async criarDaConversa(
    conversaId: string,
    entregue: boolean,
    valor: number,
    mensagem: string | null,
    anexo: string | null = null,
  ): Promise<ResultadoAcaoPedido> {
    const resposta = await firstValueFrom(
      this.http.post<RespostaApi>(this.url(`/da-conversa/${conversaId}?entregue=${entregue}`), { valor, mensagem, anexo }),
    );
    return this.aplicar(resposta);
  }

  /** "Registrar pedido": pedido feito fora do assistente (balcão, ligação…); itens em texto livre. */
  async registrarManual(novo: {
    itens: string;
    valor: number;
    whatsapp: string;
    nomeCliente: string;
    entregue: boolean;
  }): Promise<ResultadoAcaoPedido> {
    return this.aplicar(await firstValueFrom(this.http.post<RespostaApi>(this.url(), novo)));
  }

  async marcarPronto(pedidoId: string, mensagem: string | null): Promise<ResultadoAcaoPedido> {
    return this.aplicar(await firstValueFrom(this.http.patch<RespostaApi>(this.url(`/${pedidoId}/pronto`), { mensagem })));
  }

  async marcarEntregue(pedidoId: string, mensagem: string | null): Promise<ResultadoAcaoPedido> {
    return this.aplicar(await firstValueFrom(this.http.patch<RespostaApi>(this.url(`/${pedidoId}/entregue`), { mensagem })));
  }

  async cancelar(pedidoId: string): Promise<ResultadoAcaoPedido> {
    return this.aplicar(await firstValueFrom(this.http.patch<RespostaApi>(this.url(`/${pedidoId}/cancelar`), null)));
  }

  async atualizarValor(pedidoId: string, valor: number): Promise<void> {
    const atualizado = paraPedido(await firstValueFrom(this.http.patch<PedidoApi>(this.url(`/${pedidoId}/valor`), { valor })));
    this.lista.update((pedidos) => pedidos.map((p) => (p.id === pedidoId ? atualizado : p)));
  }

  /** Últimos 7/30/90 dias, ou um mês do calendário ("2026-10"). */
  async numeros(filtro: { dias: number } | { mes: string }): Promise<NumerosPedidos> {
    const consulta = 'mes' in filtro ? `mes=${encodeURIComponent(filtro.mes)}` : `dias=${filtro.dias}`;
    const numeros = await firstValueFrom(this.http.get<NumerosApi>(this.url(`/numeros?${consulta}`)));
    return { ...numeros, entreguesRecentes: numeros.entreguesRecentes.map(paraPedido) };
  }

  // ------------------------------------------------------------ mensagens prontas dos avisos

  async carregarMensagensProntas(): Promise<void> {
    this.mensagensProntas.set(await firstValueFrom(this.http.get<MensagemPronta[]>(this.url('/mensagens-prontas'))));
  }

  async criarMensagemPronta(nova: NovaMensagemPronta): Promise<void> {
    const criada = await firstValueFrom(this.http.post<MensagemPronta>(this.url('/mensagens-prontas'), nova));
    this.mensagensProntas.update((lista) => [...lista, criada]);
  }

  async atualizarMensagemPronta(id: string, mensagem: NovaMensagemPronta): Promise<void> {
    const atualizada = await firstValueFrom(this.http.put<MensagemPronta>(this.url(`/mensagens-prontas/${id}`), mensagem));
    this.mensagensProntas.update((lista) => lista.map((m) => (m.id === id ? atualizada : m)));
  }

  async removerMensagemPronta(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(this.url(`/mensagens-prontas/${id}`)));
    this.mensagensProntas.update((lista) => lista.filter((m) => m.id !== id));
  }

  reiniciar(): void {
    this.carregamento.reiniciar();
    this.carregouUmaVez = false;
    this.lista.set([]);
    this.mensagensProntas.set([]);
  }

  /** Atualiza a lista (entra, muda ou sai) e a conversa na tela de chats. */
  private aplicar(resposta: RespostaApi): ResultadoAcaoPedido {
    const pedido = paraPedido(resposta.pedido);
    const emAndamento = pedido.status === 'CONFIRMADO' || pedido.status === 'PRONTO';
    this.lista.update((pedidos) => {
      const semEle = pedidos.filter((p) => p.id !== pedido.id);
      if (!emAndamento) {
        return semEle;
      }
      return pedidos.some((p) => p.id === pedido.id)
        ? pedidos.map((p) => (p.id === pedido.id ? pedido : p))
        : [...semEle, pedido];
    });
    if (resposta.conversa) {
      this.conversaService.substituir({ ...resposta.conversa, atualizadaEm: new Date(resposta.conversa.atualizadaEm) });
    }
    return { pedido, aviso: resposta.aviso };
  }

  private url(caminho = ''): string {
    return urlDoPerfil(this.sessao.perfilIdObrigatorio(), `/pedidos${caminho}`);
  }
}

function paraPedido(pedido: PedidoApi): Pedido {
  return {
    ...pedido,
    valor: Number(pedido.valor),
    confirmadoEm: new Date(pedido.confirmadoEm),
    prontoEm: pedido.prontoEm ? new Date(pedido.prontoEm) : null,
    entregueEm: pedido.entregueEm ? new Date(pedido.entregueEm) : null,
  };
}
