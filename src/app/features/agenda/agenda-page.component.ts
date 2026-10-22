import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../core/api/erro-api';
import { Agendamento, NovoAgendamento } from '../../core/models/agenda.model';
import { AgendaService, DIAS_DA_AGENDA } from '../../core/services/agenda.service';
import { DicasVistasService } from '../../core/services/dicas-vistas.service';
import { PerfilService } from '../../core/services/perfil.service';
import { ProdutoService } from '../../core/services/produto.service';
import { ToastService } from '../../core/services/toast.service';
import { pluralizar } from '../../core/utils/colecao.utils';
import { deIso, diaPorExtenso, formatarDuracao, hojeIso, infoDia, minutosDoDia, proximosDias, somarDias } from '../../core/utils/datas-agenda';
import { gerarLinkWhatsapp } from '../../core/utils/texto.utils';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { EstadoVazioComponent } from '../../shared/components/estado-vazio/estado-vazio.component';
import { FaixaDiasComponent, ItemFaixaDia } from '../../shared/components/faixa-dias/faixa-dias.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { HorariosAtendimentoComponent } from './horarios-atendimento/horarios-atendimento.component';
import { MensagensProntasComponent } from './mensagens-prontas/mensagens-prontas.component';
import { preencherMensagem } from './mensagens-prontas/variaveis-mensagem';
import { montarLinhaDoTempo } from './linha-do-tempo';
import { NovoAgendamentoComponent } from './novo-agendamento/novo-agendamento.component';
import { VideoAgendaComponent } from './video-agenda/video-agenda.component';

type AbaAgenda = 'agendamentos' | 'horarios';

/**
 * Agenda do painel (serviços presenciais).
 * - Agendamentos: faixa de dias com o que está marcado em cada um, agendamento manual, cancelar e folga.
 * - Horários: dias e horários de atendimento e a chave do agendamento automático.
 */
@Component({
  selector: 'app-agenda-page',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    CarregandoComponent,
    EstadoVazioComponent,
    FaixaDiasComponent,
    IconeComponent,
    BottomSheetComponent,
    HorariosAtendimentoComponent,
    NovoAgendamentoComponent,
    MensagensProntasComponent,
    VideoAgendaComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './agenda-page.component.html',
  styleUrls: ['../../shared/estilos-topo-azul.css', './agenda-page.component.css'],
})
export class AgendaPageComponent implements OnInit {
  private readonly agendaService = inject(AgendaService);
  private readonly produtoService = inject(ProdutoService);
  private readonly toastService = inject(ToastService);
  private readonly perfil = inject(PerfilService).perfil;
  private readonly dicasVistas = inject(DicasVistasService);

  /** Vídeo de orientação na primeira visita (a agenda só existe nos ramos de serviço). */
  protected readonly mostrarVideo = signal(this.dicasVistas.deveMostrarVideo('video-agenda'));

  protected readonly carregando = signal(true);
  protected readonly aba = signal<AbaAgenda>('agendamentos');
  protected readonly diaSelecionado = signal(hojeIso());

  protected readonly criando = signal(false);
  protected readonly salvandoNovo = signal(false);
  protected readonly paraCancelar = signal<Agendamento | null>(null);
  /** Cliente cujo WhatsApp foi tocado: abre a escolha de mensagem antes de ir para a conversa. */
  protected readonly paraMensagem = signal<Agendamento | null>(null);
  protected readonly gerenciandoMensagens = signal(false);

  /** As mensagens prontas já preenchidas com os dados do cliente escolhido, cada uma com o link do WhatsApp. */
  protected readonly opcoesMensagem = computed(() => {
    const agendamento = this.paraMensagem();
    if (!agendamento) {
      return [];
    }
    return this.agendaService.mensagensProntas().map((mensagem) => {
      const texto = preencherMensagem(mensagem.texto, agendamento);
      return { id: mensagem.id, titulo: mensagem.titulo, texto, link: this.linkWhatsapp(agendamento, texto) };
    });
  });
  protected readonly cancelando = signal(false);
  protected readonly confirmandoFolga = signal(false);
  protected readonly mudandoFolga = signal(false);

  protected readonly configuracao = this.agendaService.configuracao;
  /** "Agendamento automático" = agenda ativa: o assistente marca sozinho e a página mostra os horários. */
  protected readonly modoAutomatico = computed(() => this.perfil().modoPedido === 'AGENDAMENTO_AUTOMATICO');
  /** "Quando o cliente quiser fechar" fica na tela do assistente. */
  protected readonly rotaAtendimento = computed(() => `/painel/${this.perfil().id}/atendimento`);
  protected readonly rotaInicio = computed(() => `/painel/${this.perfil().id}`);
  protected readonly temHorarios = computed(() => (this.configuracao()?.periodos.length ?? 0) > 0);

  protected readonly servicosSemDuracao = computed(
    () => this.produtoService.produtos().filter((p) => p.disponivel && !p.duracaoMinutos).length,
  );

  /** Confirmados por dia ("AAAA-MM-DD" → lista), para a faixa e a lista do dia. */
  private readonly porDia = computed(() => {
    const mapa = new Map<string, Agendamento[]>();
    for (const agendamento of this.agendaService.agendamentos()) {
      mapa.set(agendamento.data, [...(mapa.get(agendamento.data) ?? []), agendamento]);
    }
    return mapa;
  });

  /** Mês do dia escolhido, em cima da faixa ("Outubro"). */
  protected readonly mesDoDia = computed(() => {
    const mes = deIso(this.diaSelecionado()).toLocaleDateString('pt-BR', { month: 'long' });
    return mes.charAt(0).toUpperCase() + mes.slice(1);
  });
  protected readonly podeVoltarSemana = computed(() => this.diaSelecionado() > hojeIso());
  protected readonly podeAvancarSemana = computed(
    () => this.diaSelecionado() < somarDias(hojeIso(), DIAS_DA_AGENDA - 1),
  );

  protected readonly itensFaixa = computed<ItemFaixaDia[]>(() =>
    proximosDias(hojeIso(), DIAS_DA_AGENDA).map((data) => {
      const confirmados = (this.porDia().get(data) ?? []).filter((a) => a.status === 'CONFIRMADO').length;
      if (this.ehFolga(data)) {
        return { data, detalhe: 'Folga', marcado: confirmados > 0 };
      }
      if (confirmados > 0) {
        return { data, detalhe: String(confirmados), marcado: true };
      }
      return { data, detalhe: this.periodosDoDia(data).length === 0 ? 'Fechado' : '' };
    }),
  );

  protected readonly agendamentosDoDia = computed(() => this.porDia().get(this.diaSelecionado()) ?? []);
  protected readonly confirmadosDoDia = computed(() =>
    this.agendamentosDoDia().filter((a) => a.status === 'CONFIRMADO'),
  );
  protected readonly tituloDia = computed(() => {
    const data = this.diaSelecionado();
    const prefixo = data === hojeIso() ? 'Hoje, ' : '';
    const texto = diaPorExtenso(data);
    return prefixo + (prefixo ? texto : texto.charAt(0).toUpperCase() + texto.slice(1));
  });
  protected readonly folgaNoDia = computed(() => this.ehFolga(this.diaSelecionado()));
  protected readonly resumoDia = computed(() => {
    const total = this.confirmadosDoDia().length;
    return total === 0 ? 'Nenhum cliente' : pluralizar(total, 'cliente', 'clientes');
  });

  /** "HH:MM" de agora; muda a cada minuto, para o card ficar cinza assim que o horário termina. */
  private readonly horaAgora = signal(horaAtual());

  /** Resumida (cards) ou Completa (linha do tempo); o lojista escolhe e fica guardado neste navegador. */
  protected readonly visualizacao = signal<Visualizacao>(lerVisualizacao());

  protected readonly canceladosDoDia = computed(() =>
    this.agendamentosDoDia().filter((a) => a.status === 'CANCELADO'),
  );

  /** Linha do tempo do dia: expediente (nada na folga), agendamentos confirmados e o agora (só hoje). */
  protected readonly linhaDoTempo = computed(() => {
    const data = this.diaSelecionado();
    const periodos = this.folgaNoDia() ? [] : this.periodosDoDia(data);
    const agora = data === hojeIso() ? minutosDoDia(this.horaAgora()) : null;
    return montarLinhaDoTempo(periodos, this.confirmadosDoDia(), agora);
  });

  /** Tablet e computador (mesmo corte do CSS): as abas sobem para a linha do título. */
  private readonly consultaTelaGrande = window.matchMedia('(min-width: 760px)');
  protected readonly telaGrande = signal(this.consultaTelaGrande.matches);

  constructor() {
    const relogio = window.setInterval(() => this.horaAgora.set(horaAtual()), 60_000);
    const aoMudarTela = (evento: MediaQueryListEvent) => this.telaGrande.set(evento.matches);
    this.consultaTelaGrande.addEventListener('change', aoMudarTela);
    inject(DestroyRef).onDestroy(() => {
      window.clearInterval(relogio);
      this.consultaTelaGrande.removeEventListener('change', aoMudarTela);
    });
  }

  ngOnInit(): void {
    void this.carregar();
  }

  protected fecharVideo(): void {
    this.dicasVistas.marcarComoVista('video-agenda');
    this.mostrarVideo.set(false);
  }

  protected mudarVisualizacao(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value === 'completa' ? 'completa' : 'resumida';
    this.visualizacao.set(valor);
    try {
      localStorage.setItem(CHAVE_VISUALIZACAO, valor);
    } catch {
      // navegador sem armazenamento: vale só até recarregar
    }
  }

  /** O horário já terminou (dia anterior a hoje, ou hoje com o fim antes de agora). */
  protected jaPassou(agendamento: Agendamento): boolean {
    const hoje = hojeIso();
    return agendamento.data < hoje || (agendamento.data === hoje && agendamento.fim <= this.horaAgora());
  }

  private async carregar(): Promise<void> {
    try {
      await Promise.all([
        this.agendaService.carregarConfiguracao(),
        this.agendaService.atualizarAgendamentos(),
        this.produtoService.carregar(),
        this.agendaService.carregarMensagensProntas(),
      ]);
      // primeira vez: abre direto nos horários, que é o que falta configurar
      if (!this.temHorarios()) {
        this.aba.set('horarios');
      }
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR));
    } finally {
      this.carregando.set(false);
    }
  }

  protected mudarAba(aba: AbaAgenda): void {
    this.aba.set(aba);
  }

  protected escolherDia(data: string): void {
    this.diaSelecionado.set(data);
  }

  /** Setas em cima da faixa: pula uma semana, sem sair dos dias da agenda. */
  protected mudarSemana(direcao: 1 | -1): void {
    const ultimo = somarDias(hojeIso(), DIAS_DA_AGENDA - 1);
    const destino = somarDias(this.diaSelecionado(), 7 * direcao);
    this.diaSelecionado.set(destino < hojeIso() ? hojeIso() : destino > ultimo ? ultimo : destino);
  }

  protected duracao(agendamento: Agendamento): string {
    return formatarDuracao(agendamento.duracaoMinutos);
  }

  protected linkWhatsapp(agendamento: Agendamento, texto?: string): string {
    const link = gerarLinkWhatsapp(agendamento.whatsapp);
    return texto ? `${link}?text=${encodeURIComponent(texto)}` : link;
  }

  /** Mensagem pronta para avisar o cliente de um cancelamento feito pelo painel. */
  protected mensagemCancelamento(agendamento: Agendamento): string {
    const primeiroNome = agendamento.nomeCliente.split(' ')[0];
    return `Olá, ${primeiroNome}! Precisamos cancelar o seu horário de ${diaPorExtenso(agendamento.data)} às ${agendamento.inicio}. Podemos marcar outro dia?`;
  }

  /** Do modal de escolha para o de cadastro (o cliente continua guardado para voltar depois). */
  protected abrirGerenciarMensagens(): void {
    this.paraMensagem.set(null);
    this.gerenciandoMensagens.set(true);
  }

  protected diaPorExtenso(data: string): string {
    return diaPorExtenso(data);
  }

  // ---------------------------------------------------------------- novo agendamento

  protected async criar(novo: NovoAgendamento): Promise<void> {
    this.salvandoNovo.set(true);
    try {
      const criado = await this.agendaService.criar(novo);
      this.criando.set(false);
      this.diaSelecionado.set(criado.data);
      this.toastService.mostrar(`Agendado: ${criado.nomeCliente} às ${criado.inicio}`);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível agendar. Tente de novo.'));
    } finally {
      this.salvandoNovo.set(false);
    }
  }

  // ---------------------------------------------------------------- cancelar

  protected async confirmarCancelamento(): Promise<void> {
    const agendamento = this.paraCancelar();
    if (!agendamento || this.cancelando()) {
      return;
    }
    this.cancelando.set(true);
    try {
      await this.agendaService.cancelar(agendamento.id);
      this.paraCancelar.set(null);
      this.toastService.mostrar('Horário cancelado e liberado na agenda');
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível cancelar. Tente de novo.'));
    } finally {
      this.cancelando.set(false);
    }
  }

  // ---------------------------------------------------------------- folga

  /** Com horários marcados no dia, confirma antes (eles continuam marcados). */
  protected pedirFolga(): void {
    if (this.confirmadosDoDia().length > 0) {
      this.confirmandoFolga.set(true);
      return;
    }
    void this.alterarFolga(true);
  }

  protected async alterarFolga(folga: boolean): Promise<void> {
    if (this.mudandoFolga()) {
      return;
    }
    const data = this.diaSelecionado();
    this.mudandoFolga.set(true);
    try {
      if (folga) {
        await this.agendaService.adicionarFolga(data);
        this.toastService.mostrar('Folga marcada: o assistente não oferece horários neste dia');
      } else {
        await this.agendaService.removerFolga(data);
        this.toastService.mostrar('Folga desfeita: o dia voltou para a agenda');
      }
      this.confirmandoFolga.set(false);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível alterar o dia. Tente de novo.'));
    } finally {
      this.mudandoFolga.set(false);
    }
  }

  private ehFolga(data: string): boolean {
    return this.configuracao()?.diasBloqueados.includes(data) ?? false;
  }

  private periodosDoDia(data: string) {
    const dia = infoDia(data).valor;
    return (this.configuracao()?.periodos ?? [])
      .filter((p) => p.diaSemana === dia)
      .sort((a, b) => a.inicio.localeCompare(b.inicio));
  }

  /** Link da agenda online para divulgar (Instagram, status): abre a página pública já na aba Agenda. */
  protected readonly linkAgendaOnline = computed(() => `${location.origin}/l/${this.perfil().slug}/agenda`);
  /** O mesmo link sem "https://", para caber no topo. */
  protected readonly linkAgendaSemProtocolo = computed(() => this.linkAgendaOnline().replace(/^https?:\/\//, ''));

  protected async copiarLinkAgenda(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.linkAgendaOnline());
      this.toastService.mostrar('Link da agenda copiado');
    } catch {
      this.toastService.mostrar('Não foi possível copiar. Segure o link para copiar.');
    }
  }
}

function horaAtual(): string {
  const agora = new Date();
  return `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
}

type Visualizacao = 'resumida' | 'completa';
const CHAVE_VISUALIZACAO = 'dizai.agenda.visualizacao';

function lerVisualizacao(): Visualizacao {
  try {
    return localStorage.getItem(CHAVE_VISUALIZACAO) === 'completa' ? 'completa' : 'resumida';
  } catch {
    return 'resumida';
  }
}
