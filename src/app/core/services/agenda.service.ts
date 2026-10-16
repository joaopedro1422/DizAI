import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlDoPerfil } from '../api/api-url';
import { SessaoService } from '../auth/sessao.service';
import {
  Agendamento,
  ConfiguracaoAgenda,
  MensagemPronta,
  NovaMensagemPronta,
  NovoAgendamento,
} from '../models/agenda.model';
import { CarregamentoUnico } from '../utils/carregamento-unico';
import { hojeIso, somarDias } from '../utils/datas-agenda';

/** Quantos dias a tela carrega de uma vez (o mesmo alcance que a agenda aceita marcar). */
export const DIAS_DA_AGENDA = 30;

/** Agenda do painel: /api/perfis/{perfilId}/agenda */
@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);

  private readonly carregamentoConfiguracao = new CarregamentoUnico();
  private readonly carregamentoAgendamentos = new CarregamentoUnico();
  private readonly carregamentoMensagens = new CarregamentoUnico();

  readonly configuracao = signal<ConfiguracaoAgenda | null>(null);
  /** Agendamentos de hoje até DIAS_DA_AGENDA dias (confirmados e cancelados). */
  readonly agendamentos = signal<Agendamento[]>([]);
  /** Mensagens prontas para mandar ao cliente pelo WhatsApp (lembrete, endereço...). */
  readonly mensagensProntas = signal<MensagemPronta[]>([]);
  readonly carregando = computed(
    () => this.carregamentoConfiguracao.carregando() || this.carregamentoAgendamentos.carregando(),
  );

  /** Card do painel: os horários confirmados de hoje, em ordem. */
  readonly confirmadosHoje = computed(() => {
    const hoje = hojeIso();
    return this.agendamentos().filter((a) => a.data === hoje && a.status === 'CONFIRMADO');
  });

  carregarConfiguracao(): Promise<void> {
    return this.carregamentoConfiguracao.executar(async () => {
      this.configuracao.set(await firstValueFrom(this.http.get<ConfiguracaoAgenda>(this.url('/configuracao'))));
    });
  }

  carregarAgendamentos(): Promise<void> {
    return this.carregamentoAgendamentos.executar(() => this.buscarAgendamentos());
  }

  /** Busca de novo (ex.: ao abrir a tela, para ver o que o assistente marcou enquanto isso). */
  async atualizarAgendamentos(): Promise<void> {
    await this.buscarAgendamentos();
  }

  async salvarConfiguracao(configuracao: ConfiguracaoAgenda): Promise<void> {
    this.configuracao.set(
      await firstValueFrom(this.http.put<ConfiguracaoAgenda>(this.url('/configuracao'), configuracao)),
    );
  }

  /** "Não vou atender neste dia". */
  async adicionarFolga(data: string): Promise<void> {
    this.configuracao.set(await firstValueFrom(this.http.post<ConfiguracaoAgenda>(this.url(`/folgas/${data}`), null)));
  }

  async removerFolga(data: string): Promise<void> {
    this.configuracao.set(await firstValueFrom(this.http.delete<ConfiguracaoAgenda>(this.url(`/folgas/${data}`))));
  }

  async criar(novo: NovoAgendamento): Promise<Agendamento> {
    const criado = await firstValueFrom(this.http.post<Agendamento>(this.url('/agendamentos'), novo));
    this.agendamentos.update((lista) => ordenar([...lista, criado]));
    return criado;
  }

  async cancelar(agendamentoId: string): Promise<void> {
    const cancelado = await firstValueFrom(
      this.http.post<Agendamento>(this.url(`/agendamentos/${agendamentoId}/cancelamento`), null),
    );
    this.agendamentos.update((lista) => lista.map((a) => (a.id === agendamentoId ? cancelado : a)));
  }

  carregarMensagensProntas(): Promise<void> {
    return this.carregamentoMensagens.executar(async () => {
      this.mensagensProntas.set(await firstValueFrom(this.http.get<MensagemPronta[]>(this.url('/mensagens-prontas'))));
    });
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
    this.carregamentoMensagens.reiniciar();
    this.mensagensProntas.set([]);
    this.carregamentoConfiguracao.reiniciar();
    this.carregamentoAgendamentos.reiniciar();
    this.configuracao.set(null);
    this.agendamentos.set([]);
  }

  private async buscarAgendamentos(): Promise<void> {
    const de = hojeIso();
    const params = new HttpParams().set('de', de).set('ate', somarDias(de, DIAS_DA_AGENDA - 1));
    this.agendamentos.set(
      ordenar(await firstValueFrom(this.http.get<Agendamento[]>(this.url('/agendamentos'), { params }))),
    );
  }

  private url(caminho: string): string {
    return urlDoPerfil(this.sessao.perfilIdObrigatorio(), `/agenda${caminho}`);
  }
}

function ordenar(lista: Agendamento[]): Agendamento[] {
  return [...lista].sort((a, b) => (a.data + a.inicio).localeCompare(b.data + b.inicio));
}
