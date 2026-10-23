import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlDoPerfil } from '../api/api-url';
import { SessaoService } from '../auth/sessao.service';
import {
  Agendamento,
  ConfiguracaoAgenda,
  DisponibilidadeProfissional,
  MensagemPronta,
  NovaMensagemPronta,
  NovoAgendamento,
  ItemNovaVenda,
  NumerosAgenda,
  Profissional,
  VendaProduto,
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
  /** Quem atende, na ordem de cadastro (o primeiro é o dono). Com 2+, a agenda mostra com quem é cada horário. */
  readonly profissionais = signal<Profissional[]>([]);
  readonly variosProfissionais = computed(() => this.profissionais().length > 1);
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

  async carregarProfissionais(): Promise<void> {
    this.profissionais.set(await firstValueFrom(this.http.get<Profissional[]>(this.url('/profissionais'))));
  }

  async adicionarProfissional(nome: string): Promise<void> {
    this.profissionais.set(await firstValueFrom(this.http.post<Profissional[]>(this.url('/profissionais'), { nome })));
  }

  async renomearProfissional(id: string, nome: string): Promise<void> {
    this.profissionais.set(await firstValueFrom(this.http.put<Profissional[]>(this.url(`/profissionais/${id}`), { nome })));
  }

  /** "Quem está livre?": cada profissional no horário [hora, hora + duração) do dia. */
  disponibilidade(data: string, hora: string, duracaoMinutos: number): Promise<DisponibilidadeProfissional[]> {
    const params = new HttpParams().set('data', data).set('hora', hora).set('duracao', duracaoMinutos);
    return firstValueFrom(this.http.get<DisponibilidadeProfissional[]>(this.url('/disponibilidade'), { params }));
  }

  /** Foto de quem atende (referência do upload com destino PROFISSIONAIS); null tira a foto. */
  async trocarFotoProfissional(id: string, fotoUrl: string | null): Promise<void> {
    this.profissionais.set(
      await firstValueFrom(this.http.patch<Profissional[]>(this.url(`/profissionais/${id}/foto`), { fotoUrl })),
    );
  }

  async removerProfissional(id: string): Promise<void> {
    this.profissionais.set(await firstValueFrom(this.http.delete<Profissional[]>(this.url(`/profissionais/${id}`))));
  }

  /** O lojista ajusta o valor do atendimento (null = sem valor). */
  async atualizarValor(agendamentoId: string, valor: number | null): Promise<void> {
    const atualizado = await firstValueFrom(
      this.http.patch<Agendamento>(this.url(`/agendamentos/${agendamentoId}/valor`), { valor }),
    );
    this.agendamentos.update((lista) => lista.map((a) => (a.id === agendamentoId ? atualizado : a)));
  }

  /** "Registrar venda": produtos vendidos no balcão (entram só na parte Produtos dos Números). */
  registrarVenda(itens: ItemNovaVenda[]): Promise<VendaProduto> {
    return firstValueFrom(this.http.post<VendaProduto>(this.url('/vendas'), { itens }));
  }

  /** Últimos 7/30/90 dias, ou um mês do calendário ("2026-10"). */
  numeros(filtro: { dias: number } | { mes: string }): Promise<NumerosAgenda> {
    const params = 'mes' in filtro ? new HttpParams().set('mes', filtro.mes) : new HttpParams().set('dias', filtro.dias);
    return firstValueFrom(this.http.get<NumerosAgenda>(this.url('/numeros'), { params }));
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
    this.profissionais.set([]);
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
