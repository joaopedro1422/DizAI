import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { DicaSobrepostaComponent } from '../../../shared/components/dica-sobreposta/dica-sobreposta.component';
import { perguntaDoPrimeiroTeste, testeFeito } from '../../painel/onboarding/progresso-onboarding';
import { mensagemDoErro } from '../../../core/api/erro-api';
import { SessaoService } from '../../../core/auth/sessao.service';
import { ConfiguracaoAgenda, DiaSemana, PeriodoAtendimento } from '../../../core/models/agenda.model';
import { ProdutoService } from '../../../core/services/produto.service';
import { AgendaService } from '../../../core/services/agenda.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { ToastService } from '../../../core/services/toast.service';
import { alternarItem, pluralizar } from '../../../core/utils/colecao.utils';
import { DIAS_SEMANA } from '../../../core/utils/datas-agenda';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { InterruptorComponent } from '../../../shared/components/interruptor/interruptor.component';
import { ETIQUETAS_AGENDAMENTO, MensagemConfirmacaoComponent } from '../mensagem-confirmacao/mensagem-confirmacao.component';
import { ProfissionaisAgendaComponent } from '../profissionais/profissionais-agenda.component';
import { SecaoConfiguracao } from '../secoes-agenda';
import { AlvoTourDirective } from '../../painel/onboarding/alvo-tour.directive';
import { SemanaAgendaComponent } from '../semana-agenda/semana-agenda.component';
import { Trecho, validarDia } from '../semana-agenda/semana-agenda';

/** O que está na tela (só vai para o backend no "Salvar"). */
interface Rascunho {
  intervaloMinutos: number;
  antecedenciaMinutos: number;
  lembreteMinutos: number;
  mensagemConfirmacao: string;
  agradecimentoAtivo: boolean;
  mensagemAgradecimento: string;
  mensagemLembrete: string;
  listaEsperaAtiva: boolean;
  listaEsperaMinutos: number;
  periodos: Record<DiaSemana, Trecho[]>;
}

/** Usada só se o backend não mandar a padrão (o texto é o de AgendaService.CONFIRMACAO_PADRAO). */
const CONFIRMACAO_PADRAO =
  'Agendado! ✅\n\n🛠️ Serviço: {servico}\n📅 Data: {data}\n⏰ Horário: {horario}\n👤 Nome: {nome}\n\n' +
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
  { minutos: 10, rotulo: '10 min' },
  { minutos: 15, rotulo: '15 min' },
  { minutos: 30, rotulo: '30 min' },
  { minutos: 60, rotulo: '1 hora' },
  { minutos: 120, rotulo: '2 horas' },
  { minutos: 240, rotulo: '4 horas' },
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

/** Quanto tempo quem recebe a vaga da lista de espera tem para responder. */
const PRAZOS_LISTA_ESPERA = [10, 15, 30];

@Component({
  selector: 'app-horarios-atendimento',
  imports: [
    SemanaAgendaComponent,
    RouterLink,
    IconeComponent,
    InterruptorComponent,
    CarregandoComponent,
    MensagemConfirmacaoComponent,
    ProfissionaisAgendaComponent,
    DicaSobrepostaComponent,
    AlvoTourDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './horarios-atendimento.component.html',
  styleUrls: ['./horarios-atendimento.component.css', './ajustes-agenda.css'],
})
export class HorariosAtendimentoComponent {
  readonly configuracao = input.required<ConfiguracaoAgenda>();
  /** Serviços cadastrados sem duração: a agenda não consegue marcar esses. */
  readonly servicosSemDuracao = input(0);
  /** A página do menu da agenda: cada uma mostra a sua parte do formulário (o Salvar vale para todas). */
  readonly secao = input<SecaoConfiguracao>('horarios');

  private readonly agendaService = inject(AgendaService);
  private readonly produtoService = inject(ProdutoService);
  private readonly perfilService = inject(PerfilService);
  private readonly toastService = inject(ToastService);
  private readonly rotas = inject(SessaoService).rotasDoPainel;
  private readonly router = inject(Router);
  /** Primeiros horários salvos (e o assistente ainda não foi testado): convite para testar um agendamento. */
  protected readonly convidarTeste = signal(false);
  protected readonly rotaProdutos = computed(() => this.rotas().produtos);
  /** "Quando o cliente quiser agendar" fica na tela do assistente. */
  protected readonly rotaAtendimento = computed(() => this.rotas().atendimento);
  /** "Agendamento automático" escolhido = agenda ativa (página pública e o assistente marcando sozinho). */
  protected readonly modoAutomatico = computed(() => this.perfilService.perfil().modoPedido === 'AGENDAMENTO_AUTOMATICO');

  protected readonly diasSemana = DIAS_SEMANA;
  protected readonly intervalos = INTERVALOS;
  protected readonly antecedencias = ANTECEDENCIAS;
  protected readonly lembretes = LEMBRETES;
  protected readonly prazosListaEspera = PRAZOS_LISTA_ESPERA;
  protected readonly etiquetasAgradecimento = ETIQUETAS_AGRADECIMENTO;

  protected readonly rascunho = linkedSignal(() => paraRascunho(this.configuracao()));
  protected readonly salvando = signal(false);
  /** Os cards de mensagem abertos (começam fechados, para a tela não ficar comprida). */
  protected readonly mensagensAbertas = signal<MensagemDaAgenda[]>([]);


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


  protected readonly confirmacaoPadrao = computed(
    () => this.configuracao().mensagemConfirmacaoPadrao ?? CONFIRMACAO_PADRAO,
  );

  /** Com 2+ profissionais, a confirmação do agendamento pode citar com quem é ({profissional}). */
  /** {profissional} só com 2+ profissionais; {produtos} só quando o negócio tem produto à venda. */
  protected readonly etiquetasAgendamento = computed(() => [
    ...ETIQUETAS_AGENDAMENTO,
    ...(this.agendaService.variosProfissionais() ? ['profissional'] : []),
    ...(this.produtoService.produtos().some((p) => p.produtoAVenda) ? ['produtos'] : []),
  ]);

  protected readonly lembretePadrao = computed(
    () => this.configuracao().mensagemLembretePadrao ?? LEMBRETE_PADRAO,
  );

  protected readonly agradecimentoPadrao = computed(
    () => this.configuracao().mensagemAgradecimentoPadrao ?? AGRADECIMENTO_PADRAO,
  );

  protected readonly textoServicosSemDuracao = computed(() =>
    pluralizar(this.servicosSemDuracao(), 'serviço está', 'serviços estão'),
  );

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

  /** Os seletores das páginas de configuração guardam minutos no value. */
  protected valorEscolhido(evento: Event): number {
    return Number((evento.target as HTMLSelectElement).value);
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

  protected alternarListaEspera(ativa: boolean): void {
    this.rascunho.update((r) => ({ ...r, listaEsperaAtiva: ativa }));
  }

  protected escolherPrazoListaEspera(minutos: number): void {
    this.rascunho.update((r) => ({ ...r, listaEsperaMinutos: minutos }));
  }

  protected descartar(): void {
    this.rascunho.set(paraRascunho(this.configuracao()));
  }

  /** "Testar agora": o teste abre com a pergunta de um cliente que quer marcar. */
  protected testarAgendamento(): void {
    this.convidarTeste.set(false);
    const servico = this.produtoService.produtos().find((produto) => !produto.produtoAVenda);
    const pergunta = perguntaDoPrimeiroTeste(true, servico?.nome);
    void this.router.navigate([this.rotas().atendimento], { queryParams: { testar: 1, pergunta } });
  }

  protected async salvar(): Promise<void> {
    if (this.salvando() || this.temErro()) {
      return;
    }
    const rascunho = this.rascunho();
    const primeirosHorarios = this.configuracao().periodos.length === 0 && this.algumDiaAberto();
    this.salvando.set(true);
    try {
      await this.agendaService.salvarConfiguracao(paraConfiguracao(rascunho, this.configuracao()));
      if (primeirosHorarios && !testeFeito(this.perfilService.perfil().id)) {
        this.convidarTeste.set(true);
      }
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

  protected definirPeriodos(periodos: Record<DiaSemana, Trecho[]>): void {
    this.rascunho.update((r) => ({ ...r, periodos }));
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
    listaEsperaAtiva: configuracao.listaEsperaAtiva ?? true,
    listaEsperaMinutos: configuracao.listaEsperaMinutos ?? 15,
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
    listaEsperaAtiva: rascunho.listaEsperaAtiva,
    listaEsperaMinutos: rascunho.listaEsperaMinutos,
    periodos,
    diasBloqueados: atual.diasBloqueados,
  };
}

