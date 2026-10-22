import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { mensagemDoErro } from '../../../core/api/erro-api';
import { SessaoService } from '../../../core/auth/sessao.service';
import { ConfiguracaoAgenda, DiaSemana, PeriodoAtendimento } from '../../../core/models/agenda.model';
import { AgendaService } from '../../../core/services/agenda.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { ToastService } from '../../../core/services/toast.service';
import { alternarItem, pluralizar } from '../../../core/utils/colecao.utils';
import { DIAS_SEMANA, minutosDoDia } from '../../../core/utils/datas-agenda';
import { BottomSheetComponent } from '../../../shared/components/bottom-sheet/bottom-sheet.component';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { InterruptorComponent } from '../../../shared/components/interruptor/interruptor.component';
import { MensagemConfirmacaoComponent } from '../mensagem-confirmacao/mensagem-confirmacao.component';

interface Trecho {
  inicio: string;
  fim: string;
}

/** O que está na tela (só vai para o backend no "Salvar"). */
interface Rascunho {
  intervaloMinutos: number;
  antecedenciaMinutos: number;
  lembreteMinutos: number;
  mensagemConfirmacao: string;
  agradecimentoAtivo: boolean;
  mensagemAgradecimento: string;
  mensagemLembrete: string;
  periodos: Record<DiaSemana, Trecho[]>;
}

/** Usada só se o backend não mandar a padrão (o texto é o de AgendaService.CONFIRMACAO_PADRAO). */
const CONFIRMACAO_PADRAO =
  'Agendado! ✅\n\nServiço: {servico}\nData: {data}\nHorário: {horario}\nNome: {nome}\n\n' +
  'Se precisar remarcar ou cancelar, é só me avisar por aqui.';

/** Usada só se o backend não mandar o padrão (o texto é o de AgendaService.AGRADECIMENTO_PADRAO). */
const AGRADECIMENTO_PADRAO =
  'Obrigado pela visita, {nome}! 😊\n\nFoi um prazer te atender. Quando quiser marcar o próximo horário, é só me chamar por aqui.';

/** Usada só se o backend não mandar o padrão (o texto é o de AgendaService.LEMBRETE_PADRAO). */
const LEMBRETE_PADRAO =
  'Oi, {nome}! 😊 Passando para lembrar do seu horário de {data} às {horario} ({servico}).\nVocê confirma a presença?';

/** As três mensagens do fim da tela, que abrem e fecham. */
export type MensagemDaAgenda = 'agendamento' | 'lembrete' | 'agradecimento';

/** O agradecimento só conhece o nome e o serviço. */
const ETIQUETAS_AGRADECIMENTO = ['servico', 'nome'];

const INTERVALOS = [
  { minutos: 15, rotulo: '15 min' },
  { minutos: 30, rotulo: '30 min' },
  { minutos: 60, rotulo: '1 hora' },
];

const ANTECEDENCIAS = [
  { minutos: 0, rotulo: 'Sem' },
  { minutos: 60, rotulo: '1 hora' },
  { minutos: 120, rotulo: '2 horas' },
  { minutos: 240, rotulo: '4 horas' },
  { minutos: 720, rotulo: '12 horas' },
  { minutos: 1440, rotulo: '1 dia' },
];

const LEMBRETES = [
  { minutos: 0, rotulo: 'Não enviar' },
  { minutos: 60, rotulo: '1 hora antes' },
  { minutos: 120, rotulo: '2 horas antes' },
  { minutos: 240, rotulo: '4 horas antes' },
  { minutos: 480, rotulo: '8 horas antes' },
  { minutos: 1440, rotulo: '1 dia antes' },
];

/** Quem liga o dia ganha o horário mais comum: manhã e tarde com pausa para o almoço. */
const DIA_PADRAO: Trecho[] = [
  { inicio: '08:00', fim: '12:00' },
  { inicio: '13:00', fim: '18:00' },
];

const MAXIMO_PERIODOS_POR_DIA = 4;

/**
 * Aba "Horários" da agenda: em quais dias e horários o negócio atende (vários períodos por dia, para o almoço),
 * de quanto em quanto tempo os horários começam, a antecedência mínima, o lembrete e, no fim, as mensagens
 * (agendamento, lembrete e agradecimento), cada uma num card que abre e fecha.
 * A agenda não tem chave própria: fica ativa com "Agendamento automático" em "Quando o cliente quiser fechar".
 */
@Component({
  selector: 'app-horarios-atendimento',
  imports: [
    RouterLink,
    IconeComponent,
    InterruptorComponent,
    BottomSheetComponent,
    CarregandoComponent,
    MensagemConfirmacaoComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './horarios-atendimento.component.html',
  styleUrl: './horarios-atendimento.component.css',
})
export class HorariosAtendimentoComponent {
  readonly configuracao = input.required<ConfiguracaoAgenda>();
  /** Serviços cadastrados sem duração: a agenda não consegue marcar esses. */
  readonly servicosSemDuracao = input(0);

  private readonly agendaService = inject(AgendaService);
  private readonly perfilService = inject(PerfilService);
  private readonly toastService = inject(ToastService);
  private readonly rotas = inject(SessaoService).rotasDoPainel;
  protected readonly rotaProdutos = computed(() => this.rotas().produtos);
  /** "Quando o cliente quiser fechar" fica na tela do assistente. */
  protected readonly rotaAtendimento = computed(() => this.rotas().atendimento);
  /** "Agendamento automático" escolhido = agenda ativa (página pública e o assistente marcando sozinho). */
  protected readonly modoAutomatico = computed(() => this.perfilService.perfil().modoPedido === 'AGENDAMENTO_AUTOMATICO');

  protected readonly diasSemana = DIAS_SEMANA;
  protected readonly intervalos = INTERVALOS;
  protected readonly antecedencias = ANTECEDENCIAS;
  protected readonly lembretes = LEMBRETES;
  protected readonly etiquetasAgradecimento = ETIQUETAS_AGRADECIMENTO;
  protected readonly maximoPeriodos = MAXIMO_PERIODOS_POR_DIA;

  protected readonly rascunho = linkedSignal(() => paraRascunho(this.configuracao()));
  protected readonly diaAberto = signal<DiaSemana>(diaDeHoje());
  protected readonly salvando = signal(false);
  protected readonly copiando = signal(false);
  /** Os cards de mensagem abertos (começam fechados, para a tela não ficar comprida). */
  protected readonly mensagensAbertas = signal<MensagemDaAgenda[]>([]);
  protected readonly diasParaCopiar = signal<DiaSemana[]>([]);

  protected readonly infoDiaAberto = computed(() => DIAS_SEMANA.find((d) => d.valor === this.diaAberto())!);
  protected readonly trechosDiaAberto = computed(() => this.rascunho().periodos[this.diaAberto()]);

  protected readonly alterado = computed(
    () => JSON.stringify(this.rascunho()) !== JSON.stringify(paraRascunho(this.configuracao())),
  );

  /** Erro de cada dia (fim antes do início, períodos sobrepostos). */
  protected readonly erros = computed(() => {
    const erros: Partial<Record<DiaSemana, string>> = {};
    for (const dia of DIAS_SEMANA) {
      const erro = validarDia(this.rascunho().periodos[dia.valor]);
      if (erro) {
        erros[dia.valor] = erro;
      }
    }
    return erros;
  });

  protected readonly temErro = computed(() => Object.keys(this.erros()).length > 0);
  protected readonly algumDiaAberto = computed(() =>
    DIAS_SEMANA.some((dia) => this.rascunho().periodos[dia.valor].length > 0),
  );

  /** Uma linha por dia da semana, para conferir a semana inteira de uma vez. */
  protected readonly resumoSemana = computed(() =>
    DIAS_SEMANA.map((dia) => {
      const trechos = this.rascunho().periodos[dia.valor];
      return {
        ...dia,
        texto: trechos.length === 0 ? 'Fechado' : trechos.map((t) => `${t.inicio}–${t.fim}`).join('  ·  '),
        aberto: trechos.length > 0,
      };
    }),
  );

  protected readonly confirmacaoPadrao = computed(
    () => this.configuracao().mensagemConfirmacaoPadrao ?? CONFIRMACAO_PADRAO,
  );

  protected readonly lembretePadrao = computed(
    () => this.configuracao().mensagemLembretePadrao ?? LEMBRETE_PADRAO,
  );

  protected readonly agradecimentoPadrao = computed(
    () => this.configuracao().mensagemAgradecimentoPadrao ?? AGRADECIMENTO_PADRAO,
  );

  protected readonly textoServicosSemDuracao = computed(() =>
    pluralizar(this.servicosSemDuracao(), 'serviço está', 'serviços estão'),
  );

  protected escolherDia(dia: DiaSemana): void {
    this.diaAberto.set(dia);
  }

  protected definirConfirmacao(texto: string): void {
    this.rascunho.update((r) => ({ ...r, mensagemConfirmacao: texto }));
  }

  protected alternarMensagem(mensagem: MensagemDaAgenda): void {
    this.mensagensAbertas.update((abertas) => alternarItem(abertas, mensagem));
  }

  protected definirLembrete(texto: string): void {
    this.rascunho.update((r) => ({ ...r, mensagemLembrete: texto }));
  }

  protected alternarAgradecimento(ativo: boolean): void {
    this.rascunho.update((r) => ({ ...r, agradecimentoAtivo: ativo }));
  }

  protected definirAgradecimento(texto: string): void {
    this.rascunho.update((r) => ({ ...r, mensagemAgradecimento: texto }));
  }

  protected alternarDiaAberto(aberto: boolean): void {
    this.definirTrechos(this.diaAberto(), aberto ? DIA_PADRAO.map((t) => ({ ...t })) : []);
  }

  protected alterarTrecho(indice: number, campo: keyof Trecho, evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    if (!valor) {
      return;
    }
    const trechos = this.trechosDiaAberto().map((t, i) => (i === indice ? { ...t, [campo]: valor.slice(0, 5) } : t));
    this.definirTrechos(this.diaAberto(), trechos);
  }

  /**
   * O ícone do relógio fica escondido (para o horário caber no celular): sem ele, no computador o clique no campo
   * não abria nada. Agora o clique abre o seletor de horas; digitar continua funcionando.
   */
  protected abrirSeletor(evento: Event): void {
    try {
      (evento.target as HTMLInputElement).showPicker();
    } catch {
      // navegador sem showPicker ou sem gesto do usuário: segue digitando no campo
    }
  }

  /** Novo período depois do último, com 1 hora de pausa (ex.: almoço). */
  protected adicionarTrecho(): void {
    const trechos = this.trechosDiaAberto();
    const ultimo = trechos.at(-1);
    const inicio = ultimo ? Math.min(minutosDoDia(ultimo.fim) + 60, 22 * 60) : 8 * 60;
    const fim = Math.min(inicio + 4 * 60, 23 * 60 + 45);
    this.definirTrechos(this.diaAberto(), [...trechos, { inicio: paraHora(inicio), fim: paraHora(fim) }]);
  }

  protected removerTrecho(indice: number): void {
    this.definirTrechos(this.diaAberto(), this.trechosDiaAberto().filter((_, i) => i !== indice));
  }

  protected escolherIntervalo(minutos: number): void {
    this.rascunho.update((r) => ({ ...r, intervaloMinutos: minutos }));
  }

  protected escolherAntecedencia(minutos: number): void {
    this.rascunho.update((r) => ({ ...r, antecedenciaMinutos: minutos }));
  }

  protected escolherLembrete(minutos: number): void {
    this.rascunho.update((r) => ({ ...r, lembreteMinutos: minutos }));
  }

  protected abrirCopia(): void {
    this.diasParaCopiar.set([]);
    this.copiando.set(true);
  }

  protected alternarDiaParaCopiar(dia: DiaSemana): void {
    this.diasParaCopiar.update((dias) => alternarItem(dias, dia));
  }

  /** Atalho comum: copiar a segunda para os outros dias úteis. */
  protected marcarDiasUteis(): void {
    this.diasParaCopiar.set(
      (['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as DiaSemana[]).filter((d) => d !== this.diaAberto()),
    );
  }

  protected copiar(): void {
    const origem = this.trechosDiaAberto();
    const destinos = this.diasParaCopiar();
    this.rascunho.update((r) => {
      const periodos = { ...r.periodos };
      destinos.forEach((dia) => (periodos[dia] = origem.map((t) => ({ ...t }))));
      return { ...r, periodos };
    });
    this.copiando.set(false);
    this.toastService.mostrar(`Horários copiados para ${pluralizar(destinos.length, 'dia', 'dias')}`);
  }

  protected descartar(): void {
    this.rascunho.set(paraRascunho(this.configuracao()));
  }

  protected async salvar(): Promise<void> {
    if (this.salvando() || this.temErro()) {
      return;
    }
    const rascunho = this.rascunho();
    this.salvando.set(true);
    try {
      await this.agendaService.salvarConfiguracao(paraConfiguracao(rascunho, this.configuracao()));
      this.toastService.mostrar(
        this.modoAutomatico() && !this.algumDiaAberto()
          ? 'Salvo. Sem nenhum dia de atendimento, o assistente não oferece horários.'
          : 'Agenda salva',
      );
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível salvar os horários. Tente de novo.'));
    } finally {
      this.salvando.set(false);
    }
  }

  private definirTrechos(dia: DiaSemana, trechos: Trecho[]): void {
    this.rascunho.update((r) => ({ ...r, periodos: { ...r.periodos, [dia]: trechos } }));
  }
}

function paraRascunho(configuracao: ConfiguracaoAgenda): Rascunho {
  const periodos = Object.fromEntries(DIAS_SEMANA.map((dia) => [dia.valor, [] as Trecho[]])) as Record<DiaSemana, Trecho[]>;
  [...configuracao.periodos]
    .sort((a, b) => a.inicio.localeCompare(b.inicio))
    .forEach((p) => periodos[p.diaSemana].push({ inicio: p.inicio, fim: p.fim }));
  return {
    intervaloMinutos: configuracao.intervaloMinutos,
    antecedenciaMinutos: configuracao.antecedenciaMinutos,
    lembreteMinutos: configuracao.lembreteMinutos ?? 0,
    mensagemConfirmacao:
      configuracao.mensagemConfirmacao ?? configuracao.mensagemConfirmacaoPadrao ?? CONFIRMACAO_PADRAO,
    agradecimentoAtivo: configuracao.agradecimentoAtivo ?? false,
    mensagemAgradecimento:
      configuracao.mensagemAgradecimento ?? configuracao.mensagemAgradecimentoPadrao ?? AGRADECIMENTO_PADRAO,
    mensagemLembrete: configuracao.mensagemLembrete ?? configuracao.mensagemLembretePadrao ?? LEMBRETE_PADRAO,
    periodos,
  };
}

function paraConfiguracao(rascunho: Rascunho, atual: ConfiguracaoAgenda): ConfiguracaoAgenda {
  const periodos: PeriodoAtendimento[] = DIAS_SEMANA.flatMap((dia) =>
    rascunho.periodos[dia.valor].map((t) => ({ diaSemana: dia.valor, inicio: t.inicio, fim: t.fim })),
  );
  return {
    agendaAtiva: atual.agendaAtiva,
    intervaloMinutos: rascunho.intervaloMinutos,
    antecedenciaMinutos: rascunho.antecedenciaMinutos,
    lembreteMinutos: rascunho.lembreteMinutos,
    mensagemConfirmacao: rascunho.mensagemConfirmacao,
    agradecimentoAtivo: rascunho.agradecimentoAtivo,
    mensagemAgradecimento: rascunho.mensagemAgradecimento,
    mensagemLembrete: rascunho.mensagemLembrete,
    periodos,
    diasBloqueados: atual.diasBloqueados,
  };
}

function validarDia(trechos: Trecho[]): string | null {
  if (trechos.some((t) => minutosDoDia(t.inicio) >= minutosDoDia(t.fim))) {
    return 'O fim de cada período precisa ser depois do início.';
  }
  const ordenados = [...trechos].sort((a, b) => minutosDoDia(a.inicio) - minutosDoDia(b.inicio));
  for (let i = 1; i < ordenados.length; i++) {
    if (minutosDoDia(ordenados[i].inicio) < minutosDoDia(ordenados[i - 1].fim)) {
      return 'Os períodos deste dia estão se sobrepondo.';
    }
  }
  return null;
}

function paraHora(minutos: number): string {
  return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
}

function diaDeHoje(): DiaSemana {
  return DIAS_SEMANA[(new Date().getDay() + 6) % 7].valor;
}
