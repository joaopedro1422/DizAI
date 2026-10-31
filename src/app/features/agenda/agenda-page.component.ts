import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../core/api/erro-api';
import { Agendamento, ClienteListaEspera, NovoAgendamento, VendaProduto } from '../../core/models/agenda.model';
import { AgendaService, DIAS_DA_AGENDA } from '../../core/services/agenda.service';
import { DicasVistasService } from '../../core/services/dicas-vistas.service';
import { PerfilService } from '../../core/services/perfil.service';
import { ProdutoService } from '../../core/services/produto.service';
import { ToastService } from '../../core/services/toast.service';
import { pluralizar } from '../../core/utils/colecao.utils';
import { deIso, diaPorExtenso, formatarDuracao, hojeIso, infoDia, minutosDoDia, proximosDias, somarDias } from '../../core/utils/datas-agenda';
import { chegouAlgoNovo, prepararSinalSonoro, tocarSinalNovo } from '../../core/utils/sinal-sonoro';
import { limparMarcaIcone } from '../../core/utils/marca-icone';
import { gerarLinkWhatsapp } from '../../core/utils/texto.utils';
import { UrlImagemPipe } from '../../core/imagens/url-imagem';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { EstadoVazioComponent } from '../../shared/components/estado-vazio/estado-vazio.component';
import { FaixaDiasComponent, ItemFaixaDia } from '../../shared/components/faixa-dias/faixa-dias.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { HorariosAtendimentoComponent } from './horarios-atendimento/horarios-atendimento.component';
import { montarColunas, montarLinhaDoTempo } from './linha-do-tempo';
import { NovoAgendamentoComponent } from './novo-agendamento/novo-agendamento.component';
import { NumerosAgendaComponent } from './numeros-agenda/numeros-agenda.component';
import { RegistrarVendaComponent } from './registrar-venda/registrar-venda.component';
import { SeletorProfissionalComponent } from './seletor-profissional/seletor-profissional.component';
import { EscolhaQuemEstaLivre, QuemEstaLivreComponent } from './quem-esta-livre/quem-esta-livre.component';
import { formatarReal } from '../pedidos/textos-pedido';
import { FormsModule } from '@angular/forms';
import { MenuAgendaComponent } from './menu-agenda/menu-agenda.component';
import { SecaoAgenda, SecaoConfiguracao, ehConfiguracao, infoDaSecao } from './secoes-agenda';
import { passosDoTourDaAgenda } from './tour-agenda';
import { AlvoTourDirective } from '../painel/onboarding/alvo-tour.directive';
import { OnboardingTourComponent } from '../painel/onboarding/onboarding-tour.component';
import { OnboardingTourService } from '../painel/onboarding/onboarding-tour.service';
import { DicaSobrepostaComponent } from '../../shared/components/dica-sobreposta/dica-sobreposta.component';
import { ConteudoRamoService } from '../../core/services/conteudo-ramo.service';
import { exemplosDaAgenda } from '../../core/constants/segmentos';

const PADRAO_VALOR = /^\d{1,7}([.,]\d{1,2})?$/;
/** De quanto em quanto tempo a tela busca os agendamentos de novo (os que a IA marcou aparecem sozinhos). */
const ATUALIZAR_A_CADA_MS = 15_000;

/**
 * Agenda do painel (serviços presenciais).
 * - Menu (gaveta no celular, coluna no computador): Agendamentos, Números e as páginas de configuração
 *   (Horários, Equipe, Lembretes e mensagens, Lista de espera) e o link da agenda online.
 * - Agendamentos: faixa de dias com o que está marcado em cada um, agendamento manual, cancelar e folga.
 */
@Component({
  selector: 'app-agenda-page',
  imports: [
    UrlImagemPipe,
    RegistrarVendaComponent,
    SeletorProfissionalComponent,
    QuemEstaLivreComponent,
    NgTemplateOutlet,
    RouterLink,
    CarregandoComponent,
    EstadoVazioComponent,
    FaixaDiasComponent,
    IconeComponent,
    BottomSheetComponent,
    HorariosAtendimentoComponent,
    NovoAgendamentoComponent,
    OnboardingTourComponent,
    DicaSobrepostaComponent,
    AlvoTourDirective,
    NumerosAgendaComponent,
    MenuAgendaComponent,
    FormsModule,
  ],
  // o tour da agenda guarda os próprios alvos (menu, dias, configurações)
  providers: [OnboardingTourService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './agenda-page.component.html',
  styleUrls: [
    './agenda-page.component.css',
    './agenda-colunas.css',
    './lista-espera.css',
    './agenda-pc.css',
    '../../shared/estilos-tela-com-menu.css',
    './topo-agenda.css',
  ],
})
export class AgendaPageComponent implements OnInit {
  private readonly agendaService = inject(AgendaService);
  private readonly produtoService = inject(ProdutoService);
  private readonly toastService = inject(ToastService);
  private readonly perfil = inject(PerfilService).perfil;
  private readonly dicasVistas = inject(DicasVistasService);

  /** Primeira visita: convite para o tour da agenda (aparece depois de carregar). */
  protected readonly convidarTour = signal(false);
  private readonly tour = viewChild.required(OnboardingTourComponent);
  private readonly exemplos = inject(ConteudoRamoService).exemplos;

  protected readonly carregando = signal(true);
  protected readonly aba = signal<SecaoAgenda>('agendamentos');
  /** Gaveta do menu aberta (celular). */
  protected readonly menuAberto = signal(false);
  /** Computador: o calendário abre num modal pelo botão ao lado do dia. */
  protected readonly calendarioAberto = signal(false);
  protected readonly infoSecao = computed(() => infoDaSecao(this.aba()));
  /** A parte do formulário de configuração que aparece (fora das configurações, a última não importa). */
  protected readonly secaoConfiguracao = computed<SecaoConfiguracao>(() => {
    const aba = this.aba();
    return ehConfiguracao(aba) ? aba : 'horarios';
  });
  protected readonly nomeLoja = computed(() => this.perfil().nomeLoja ?? '');
  protected readonly diaSelecionado = signal(hojeIso());

  protected readonly criando = signal(false);
  /** "Quem está livre?" aberto, e o que ele passa para o "Agendar horário" (hora, profissional e serviço). */
  protected readonly consultandoLivres = signal(false);
  protected readonly presetNovo = signal<EscolhaQuemEstaLivre | null>(null);
  protected readonly salvandoNovo = signal(false);
  protected readonly paraCancelar = signal<Agendamento | null>(null);
  /** Quem atende; com 2+, os cards dizem com quem é e dá para filtrar a agenda por profissional. */
  protected readonly profissionais = this.agendaService.profissionais;
  protected readonly variosProfissionais = this.agendaService.variosProfissionais;
  /**
   * null = todos (na resumida; na completa do celular a linha do tempo mostra um profissional por vez; na do
   * computador, todos lado a lado, um por coluna).
   */
  protected readonly filtroProfissional = signal<string | null>(null);
  protected readonly profissionalVisivel = computed(() => {
    if (!this.variosProfissionais() || this.completaEmColunas()) {
      return null;
    }
    return this.filtroProfissional() ?? (this.visualizacao() === 'completa' ? this.profissionais()[0]?.id ?? null : null);
  });

  /** "Registrar venda": só aparece quando o negócio tem produto à venda disponível. */
  protected readonly registrandoVenda = signal(false);
  protected readonly temProdutosAVenda = computed(() =>
    this.produtoService.produtos().some((produto) => produto.produtoAVenda && produto.disponivel),
  );

  /** Agendamento cujo "1 produto" foi tocado: abre os produtos que o cliente reservou pela agenda online. */
  protected readonly vendoProdutos = signal<Agendamento | null>(null);
  protected readonly editandoValor = signal<Agendamento | null>(null);
  protected readonly valorDigitado = signal('');
  protected readonly salvandoValor = signal(false);
  protected readonly tentouSalvarValor = signal(false);
  protected readonly erroValor = computed(() => {
    const texto = this.valorDigitado().trim();
    return this.tentouSalvarValor() && texto !== '' && !PADRAO_VALOR.test(texto);
  });

  protected readonly cancelando = signal(false);
  /** Qual botão do cancelamento foi tocado (o spinner aparece nele): true = "Cancelar e oferecer à lista". */
  protected readonly avisandoLista = signal(false);
  /** Cliente da lista de espera cujo "×" foi tocado: confirma antes de tirar da fila. */
  protected readonly paraRemoverDaLista = signal<ClienteListaEspera | null>(null);
  protected readonly removendoDaLista = signal(false);
  protected readonly confirmandoFolga = signal(false);
  protected readonly mudandoFolga = signal(false);

  protected readonly configuracao = this.agendaService.configuracao;
  /** "Agendamento automático" = agenda ativa: o assistente marca sozinho e a página mostra os horários. */
  protected readonly modoAutomatico = computed(() => this.perfil().modoPedido === 'AGENDAMENTO_AUTOMATICO');
  /** "Quando o cliente quiser agendar" fica na tela do assistente. */
  protected readonly rotaAtendimento = computed(() => `/painel/${this.perfil().id}/atendimento`);
  protected readonly rotaInicio = computed(() => `/painel/${this.perfil().id}`);
  protected readonly temHorarios = computed(() => (this.configuracao()?.periodos.length ?? 0) > 0);

  protected readonly servicosSemDuracao = computed(
    () => this.produtoService.produtos().filter((p) => p.disponivel && !p.produtoAVenda && !p.duracaoMinutos).length,
  );

  /** Confirmados por dia ("AAAA-MM-DD" → lista), para a faixa e a lista do dia (só do profissional filtrado). */
  private readonly porDia = computed(() => {
    const mapa = new Map<string, Agendamento[]>();
    const profissional = this.profissionalVisivel();
    for (const agendamento of this.agendaService.agendamentos()) {
      if (profissional && agendamento.profissionalId !== profissional) {
        continue;
      }
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

  /**
   * Lista de espera do dia escolhido, na ordem da fila. Filtrando um profissional, aparece quem quer ele ou
   * qualquer um (a posição continua a do dia).
   */
  protected readonly listaEsperaDoDia = computed(() => {
    const data = this.diaSelecionado();
    const filtro = this.profissionalVisivel();
    const nome = filtro ? this.profissionais().find((p) => p.id === filtro)?.nome : null;
    return this.agendaService
      .listaEspera()
      .filter((l) => l.data === data && (!nome || l.profissional === null || l.profissional === nome));
  });
  protected readonly minutosListaEspera = computed(() => this.configuracao()?.listaEsperaMinutos ?? 15);

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
  /** Computador: a completa com 2+ profissionais mostra todos, um por coluna (no celular, um por vez). */
  private readonly consultaComputador = window.matchMedia('(min-width: 1024px)');
  protected readonly computador = signal(this.consultaComputador.matches);
  protected readonly completaEmColunas = computed(
    () => this.computador() && this.variosProfissionais() && this.visualizacao() === 'completa',
  );

  /** A completa no computador com 2+ profissionais: a mesma grade do dia, com uma coluna para cada um. */
  protected readonly linhaEmColunas = computed(() => {
    if (!this.completaEmColunas()) {
      return null;
    }
    const data = this.diaSelecionado();
    const periodos = this.folgaNoDia() ? [] : this.periodosDoDia(data);
    const agora = data === hojeIso() ? minutosDoDia(this.horaAgora()) : null;
    return montarColunas(periodos, this.profissionais(), this.confirmadosDoDia(), agora);
  });

  /**
   * A área das colunas rola sozinha (para o lado e para baixo). Rolada para o lado, a régua de horas presa à esquerda
   * ganha o card com sombra; rolada para baixo, a linha dos nomes presa no topo também.
   */
  /** Mouse em cima de um horário da régua: a altura dele (px), para a linha que atravessa a agenda inteira. */
  protected readonly horaEmFoco = signal<number | null>(null);
  protected readonly colunasRoladas = signal(false);
  protected readonly colunasRoladasParaBaixo = signal(false);
  /** Ainda há profissionais escondidos à direita: aparece a seta flutuante da direita. */
  protected readonly colunasComMaisADireita = signal(false);
  private readonly areaColunas = viewChild<ElementRef<HTMLElement>>('areaColunas');

  protected aoRolarColunas(evento: Event): void {
    const area = evento.target as HTMLElement;
    this.colunasRoladas.set(area.scrollLeft > 2);
    this.colunasRoladasParaBaixo.set(area.scrollTop > 2);
    this.medirColunas(area);
  }

  /** Setas da linha dos nomes: anda uma coluna (a largura de um profissional) para o lado. */
  protected rolarColunas(direcao: 1 | -1): void {
    const area = this.areaColunas()?.nativeElement;
    const coluna = area?.querySelector<HTMLElement>('.colunas__nome');
    if (area) {
      area.scrollBy({ left: direcao * ((coluna?.offsetWidth ?? 320) + 10), behavior: 'smooth' });
    }
  }

  private medirColunas(area: HTMLElement): void {
    this.colunasComMaisADireita.set(area.scrollLeft + area.clientWidth < area.scrollWidth - 2);
  }

  /** A linha vermelha da hora atual na visão completa (só hoje). */
  private readonly linhaAgora = viewChild<ElementRef<HTMLElement>>('linhaAgora');
  /** Já rolou até a hora atual desde que a visão completa de hoje abriu (as atualizações de 15 s não rolam de novo). */
  private rolouParaAgora = false;

  constructor() {
    effect((aoLimpar) => {
      const area = this.areaColunas()?.nativeElement;
      if (!area) {
        this.colunasComMaisADireita.set(false);
        return;
      }
      const observador = new ResizeObserver(() => this.medirColunas(area));
      observador.observe(area);
      aoLimpar(() => observador.disconnect());
    });
    // abriu a visão completa (ou voltou para hoje nela): a tela rola até a linha da hora atual, uma vez
    effect(() => {
      const aberta =
        this.aba() === 'agendamentos' && this.visualizacao() === 'completa' && this.diaSelecionado() === hojeIso();
      const linha = this.linhaAgora();
      if (!aberta) {
        this.rolouParaAgora = false;
        return;
      }
      if (linha && !untracked(() => this.rolouParaAgora)) {
        this.rolouParaAgora = true;
        setTimeout(() => linha.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      }
    });
    const relogio = window.setInterval(() => this.horaAgora.set(horaAtual()), 60_000);
    const aoMudarTela = (evento: MediaQueryListEvent) => this.telaGrande.set(evento.matches);
    this.consultaTelaGrande.addEventListener('change', aoMudarTela);
    const aoMudarComputador = (evento: MediaQueryListEvent) => this.computador.set(evento.matches);
    this.consultaComputador.addEventListener('change', aoMudarComputador);
    // a tela fica aberta no balcão: o que a IA (ou a página pública) marcar aparece sozinho, como nos Pedidos,
    // com um sinal sonoro quando chega um agendamento novo. Com a aba escondida não busca; ao voltar, busca na hora.
    prepararSinalSonoro();
    const atualizar = async () => {
      if (document.hidden || this.carregando()) {
        return;
      }
      void limparMarcaIcone('agenda');
      const antes = this.agendaService.agendamentos();
      try {
        await this.agendaService.atualizarAgendamentos();
      } catch {
        return;
      }
      if (chegouAlgoNovo(antes, this.agendaService.agendamentos())) {
        tocarSinalNovo();
      }
    };
    const atualizacao = window.setInterval(atualizar, ATUALIZAR_A_CADA_MS);
    document.addEventListener('visibilitychange', atualizar);
    window.addEventListener('focus', atualizar);
    inject(DestroyRef).onDestroy(() => {
      window.clearInterval(relogio);
      this.consultaTelaGrande.removeEventListener('change', aoMudarTela);
      this.consultaComputador.removeEventListener('change', aoMudarComputador);
      window.clearInterval(atualizacao);
      document.removeEventListener('visibilitychange', atualizar);
      window.removeEventListener('focus', atualizar);
    });
  }

  ngOnInit(): void {
    // abriu a agenda: a bolinha dos agendamentos novos no ícone do app some
    void limparMarcaIcone('agenda');
    void this.carregar();
  }

  // ---------------------------------------------------------------- tour da agenda

  protected comecarTour(): void {
    this.convidarTour.set(false);
    this.dicasVistas.marcarComoVista('tour-agenda');
    this.tour().iniciarCom(
      passosDoTourDaAgenda(
        {
          abrirMenu: () => this.menuAberto.set(true),
          fecharMenu: () => this.menuAberto.set(false),
          irPara: (secao) => this.irPara(secao),
        },
        exemplosDaAgenda(this.exemplos()),
      ),
    );
  }

  protected dispensarTour(): void {
    this.convidarTour.set(false);
    this.dicasVistas.marcarComoVista('tour-agenda');
  }

  /** Fim do tour: menu fechado e de volta aos agendamentos (ou aos horários, se ainda não há nenhum). */
  protected aoEncerrarTour(): void {
    this.irPara(this.temHorarios() ? 'agendamentos' : 'horarios');
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
        this.agendaService.carregarProfissionais(),
      ]);
      // primeira vez: abre direto nos horários, que é o que falta configurar
      if (!this.temHorarios()) {
        this.aba.set('horarios');
      }
      this.convidarTour.set(this.dicasVistas.deveMostrarVideo('tour-agenda'));
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR));
    } finally {
      this.carregando.set(false);
    }
  }

  protected mudarAba(aba: SecaoAgenda): void {
    this.aba.set(aba);
  }

  /** Página escolhida no menu: fecha a gaveta e volta ao topo. */
  protected irPara(secao: SecaoAgenda): void {
    this.aba.set(secao);
    this.menuAberto.set(false);
    window.scrollTo({ top: 0 });
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

  /** "Agendar com…" no "Quem está livre?": abre o "Agendar horário" já preenchido. */
  protected agendarDaConsulta(escolha: EscolhaQuemEstaLivre): void {
    this.consultandoLivres.set(false);
    this.presetNovo.set(escolha);
    this.criando.set(true);
  }

  protected fecharNovo(): void {
    this.criando.set(false);
    this.presetNovo.set(null);
  }

  protected vendaRegistrada(venda: VendaProduto): void {
    this.registrandoVenda.set(false);
    this.toastService.mostrar(`Venda registrada · ${formatarReal(Number(venda.total))}`);
  }

  /** "1 produto", "2 produtos" (reservados pela agenda online). */
  protected rotuloProdutos(agendamento: Agendamento): string {
    return pluralizar(agendamento.produtos.length, 'produto', 'produtos');
  }

  protected precoReservado(preco: number | null, aPartirDe: boolean): string {
    return preco === null ? '' : (aPartirDe ? 'a partir de ' : '') + formatarReal(Number(preco));
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

  protected diaPorExtenso(data: string): string {
    return diaPorExtenso(data);
  }

  // ---------------------------------------------------------------- novo agendamento

  protected async criar(novo: NovoAgendamento): Promise<void> {
    this.salvandoNovo.set(true);
    try {
      const criado = await this.agendaService.criar(novo);
      this.criando.set(false);
      this.presetNovo.set(null);
      this.diaSelecionado.set(criado.data);
      this.toastService.mostrar(`Agendado: ${criado.nomeCliente} às ${criado.inicio}`);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível agendar. Tente de novo.'));
    } finally {
      this.salvandoNovo.set(false);
    }
  }

  // ---------------------------------------------------------------- valor

  protected real(valor: number): string {
    return formatarReal(Number(valor));
  }

  protected abrirValor(agendamento: Agendamento): void {
    this.tentouSalvarValor.set(false);
    this.valorDigitado.set(agendamento.valor === null ? '' : Number(agendamento.valor).toFixed(2).replace('.', ','));
    this.editandoValor.set(agendamento);
  }

  protected async salvarValor(): Promise<void> {
    const agendamento = this.editandoValor();
    if (!agendamento || this.salvandoValor()) {
      return;
    }
    this.tentouSalvarValor.set(true);
    if (this.erroValor()) {
      return;
    }
    const texto = this.valorDigitado().trim();
    this.salvandoValor.set(true);
    try {
      await this.agendaService.atualizarValor(agendamento.id, texto === '' ? null : Number(texto.replace(',', '.')));
      this.editandoValor.set(null);
      this.toastService.mostrar('Valor salvo');
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível salvar o valor. Tente de novo.'));
    } finally {
      this.salvandoValor.set(false);
    }
  }

  // ---------------------------------------------------------------- cancelar

  /**
   * Quantos esperam uma vaga no dia do horário e poderiam ficar com ele (querem esse profissional ou qualquer um).
   * Com alguém, o cancelamento pergunta se o horário vai para a lista. Horário que já passou não vai.
   */
  protected esperandoVaga(agendamento: Agendamento): number {
    if (!this.modoAutomatico() || this.configuracao()?.listaEsperaAtiva === false || this.jaPassou(agendamento)) {
      return 0;
    }
    return this.agendaService
      .listaEspera()
      .filter(
        (l) =>
          l.data === agendamento.data &&
          l.status === 'AGUARDANDO' &&
          (l.profissional === null || l.profissional === agendamento.profissionalNome),
      ).length;
  }

  protected async confirmarCancelamento(avisarListaEspera = false): Promise<void> {
    const agendamento = this.paraCancelar();
    if (!agendamento || this.cancelando()) {
      return;
    }
    this.cancelando.set(true);
    this.avisandoLista.set(avisarListaEspera);
    try {
      await this.agendaService.cancelar(agendamento.id, avisarListaEspera);
      this.paraCancelar.set(null);
      const oferecida = this.agendaService
        .listaEspera()
        .some((l) => l.data === agendamento.data && l.status === 'OFERECIDA' && l.ofertaHorario !== null);
      this.toastService.mostrar(
        !avisarListaEspera
          ? 'Horário cancelado e liberado na agenda'
          : oferecida
            ? 'Horário cancelado e oferecido à lista de espera'
            : 'Horário cancelado. O serviço de quem está na lista não cabe neste horário: ele ficou livre na agenda.',
      );
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível cancelar. Tente de novo.'));
    } finally {
      this.cancelando.set(false);
    }
  }

  // ---------------------------------------------------------------- lista de espera

  /** "14:32": até quando quem recebeu a vaga pode responder. */
  protected horaDoPrazo(instante: string | null): string {
    return instante ? new Date(instante).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
  }

  protected linkWhatsappDaLista(cliente: ClienteListaEspera): string {
    return gerarLinkWhatsapp(cliente.whatsapp);
  }

  protected async removerDaLista(): Promise<void> {
    const cliente = this.paraRemoverDaLista();
    if (!cliente || this.removendoDaLista()) {
      return;
    }
    this.removendoDaLista.set(true);
    try {
      await this.agendaService.removerDaListaEspera(cliente.id);
      this.paraRemoverDaLista.set(null);
      this.toastService.mostrar(`${cliente.nomeCliente} saiu da lista de espera`);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível tirar da lista. Tente de novo.'));
    } finally {
      this.removendoDaLista.set(false);
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
