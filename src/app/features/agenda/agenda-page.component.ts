import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../core/api/erro-api';
import { Agendamento, NovoAgendamento } from '../../core/models/agenda.model';
import { AgendaService, DIAS_DA_AGENDA } from '../../core/services/agenda.service';
import { PerfilService } from '../../core/services/perfil.service';
import { ProdutoService } from '../../core/services/produto.service';
import { ToastService } from '../../core/services/toast.service';
import { pluralizar } from '../../core/utils/colecao.utils';
import { diaPorExtenso, formatarDuracao, hojeIso, infoDia, proximosDias } from '../../core/utils/datas-agenda';
import { gerarLinkWhatsapp } from '../../core/utils/texto.utils';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { CabecalhoPaginaComponent } from '../../shared/components/cabecalho-pagina/cabecalho-pagina.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { EstadoVazioComponent } from '../../shared/components/estado-vazio/estado-vazio.component';
import { FaixaDiasComponent, ItemFaixaDia } from '../../shared/components/faixa-dias/faixa-dias.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { HorariosAtendimentoComponent } from './horarios-atendimento/horarios-atendimento.component';
import { MensagensProntasComponent } from './mensagens-prontas/mensagens-prontas.component';
import { preencherMensagem } from './mensagens-prontas/variaveis-mensagem';
import { NovoAgendamentoComponent } from './novo-agendamento/novo-agendamento.component';

type AbaAgenda = 'agendamentos' | 'horarios';

/**
 * Agenda do painel (serviços presenciais).
 * - Agendamentos: faixa de dias com o que está marcado em cada um, agendamento manual, cancelar e folga.
 * - Horários: dias e horários de atendimento e a chave do agendamento automático.
 */
@Component({
  selector: 'app-agenda-page',
  imports: [
    RouterLink,
    CabecalhoPaginaComponent,
    CarregandoComponent,
    EstadoVazioComponent,
    FaixaDiasComponent,
    IconeComponent,
    BottomSheetComponent,
    HorariosAtendimentoComponent,
    NovoAgendamentoComponent,
    MensagensProntasComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './agenda-page.component.html',
  styleUrl: './agenda-page.component.css',
})
export class AgendaPageComponent implements OnInit {
  private readonly agendaService = inject(AgendaService);
  private readonly produtoService = inject(ProdutoService);
  private readonly toastService = inject(ToastService);
  private readonly perfil = inject(PerfilService).perfil;

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
  protected readonly agendaAtiva = computed(() => this.configuracao()?.agendaAtiva ?? false);
  /** Só no modo "Agendamento automático" o assistente marca sozinho. */
  protected readonly modoAutomatico = computed(() => this.perfil().modoPedido === 'AGENDAMENTO_AUTOMATICO');
  protected readonly rotaPainel = computed(() => `/painel/${this.perfil().id}`);
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
  protected readonly expedienteDoDia = computed(() => {
    const periodos = this.periodosDoDia(this.diaSelecionado());
    return periodos.length === 0 ? 'Fechado neste dia da semana' : periodos.map((p) => `${p.inicio}–${p.fim}`).join(' · ');
  });
  protected readonly resumoDia = computed(() => {
    const total = this.confirmadosDoDia().length;
    return total === 0 ? 'Nenhum horário marcado' : pluralizar(total, 'horário marcado', 'horários marcados');
  });

  ngOnInit(): void {
    void this.carregar();
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

  /** "Ver página": a página pública já aberta na aba de agendamento. */
  protected readonly caminhoAgendaPublica = computed(() => `/l/${this.perfil().slug}/agenda`);

  /** Link da agenda online para divulgar (Instagram, status): abre a página pública já na aba Agenda. */
  protected readonly linkAgendaOnline = computed(() => `${location.origin}/l/${this.perfil().slug}/agenda`);

  protected async copiarLinkAgenda(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.linkAgendaOnline());
      this.toastService.mostrar('Link da agenda copiado');
    } catch {
      this.toastService.mostrar('Não foi possível copiar. Segure o link para copiar.');
    }
  }
}
