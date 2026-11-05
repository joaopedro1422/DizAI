import { Component, DestroyRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { mensagemDoErro } from '../../core/api/erro-api';
import { AutenticacaoService } from '../../core/auth/autenticacao.service';
import { SessaoService } from '../../core/auth/sessao.service';
import { ContatoIgnoradoService } from '../../core/services/contato-ignorado.service';
import { ConversaService } from '../../core/services/conversa.service';
import { GaleriaService } from '../../core/services/galeria.service';
import { PerfilService } from '../../core/services/perfil.service';
import { PerguntaFrequenteService } from '../../core/services/pergunta-frequente.service';
import { ProdutoService } from '../../core/services/produto.service';
import { ToastService } from '../../core/services/toast.service';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { AlterarSenhaComponent } from './alterar-senha/alterar-senha.component';
import { InstalacaoAppService } from '../../core/pwa/instalacao-app.service';
import { NotificacoesPushService } from '../../core/pwa/notificacoes-push.service';
import { AppNoCelularComponent } from './app-no-celular/app-no-celular.component';
import { AtalhosSecoesComponent } from './atalhos-secoes/atalhos-secoes.component';
import { CartaoChatsComponent } from './cartao-chats/cartao-chats.component';
import { EditarPerfilComponent } from './editar-perfil/editar-perfil.component';
import { AlvoTourDirective } from './onboarding/alvo-tour.directive';
import { OnboardingTourComponent } from './onboarding/onboarding-tour.component';
import { OnboardingTourService } from './onboarding/onboarding-tour.service';
import { OnboardingInicialComponent } from './onboarding/onboarding-inicial/onboarding-inicial.component';
import { PrimeirosPassosComponent } from './onboarding/primeiros-passos.component';
import { ResumoLojaComponent } from './resumo-loja/resumo-loja.component';
import { FechamentoDoDiaComponent } from './fechamento-do-dia/fechamento-do-dia.component';
import { ResumoDoDia } from '../../core/models/resumo-do-dia.model';
import { ResumoDoDiaService } from '../../core/services/resumo-do-dia.service';

/** Tempo que o painel fica à mostra antes do onboarding abrir. */
const ESPERA_BOAS_VINDAS_MS = 1200;
/** O onboarding acabou e o lojista foi ao teste: o tour pelos cards abre quando ele volta ao painel. */
const CHAVE_TOUR_PENDENTE = 'dizai:tour-pendente:';
const ESPERA_TOUR_MS = 900;
const TOUR_SEMPRE_ABERTO = false;
const FECHAMENTO_SEMPRE_ABERTO = false;
/** O dia cujo fechamento o lojista já viu ("AAAA-MM-DD"), por loja. */
const CHAVE_FECHAMENTO_VISTO = 'dizai:fechamento-visto:';
/** Tempo que o painel fica à mostra antes do fechamento do dia abrir. */
const ESPERA_FECHAMENTO_MS = 700;

/** Tela inicial do painel do lojista. */
@Component({
  selector: 'app-painel-page',
  imports: [
    IconeComponent,
    RouterLink,
    ResumoLojaComponent,
    AtalhosSecoesComponent,
    CartaoChatsComponent,
    AppNoCelularComponent,
    BottomSheetComponent,
    EditarPerfilComponent,
    CarregandoComponent,
    AlvoTourDirective,
    OnboardingTourComponent,
    OnboardingInicialComponent,
    PrimeirosPassosComponent,
    AlterarSenhaComponent,
    FechamentoDoDiaComponent,
  ],
  providers: [OnboardingTourService],
  templateUrl: './painel-page.component.html',
  styleUrl: './painel-page.component.css',
})
export class PainelPageComponent implements OnInit {
  private readonly perfilService = inject(PerfilService);
  private readonly produtoService = inject(ProdutoService);
  private readonly perguntaService = inject(PerguntaFrequenteService);
  private readonly galeriaService = inject(GaleriaService);
  private readonly conversaService = inject(ConversaService);
  private readonly contatoIgnoradoService = inject(ContatoIgnoradoService);
  private readonly toastService = inject(ToastService);
  private readonly autenticacaoService = inject(AutenticacaoService);
  private readonly router = inject(Router);
  private readonly rotaAtual = inject(ActivatedRoute);
  private readonly tour = viewChild.required(OnboardingTourComponent);
  private readonly destroyRef = inject(DestroyRef);
  private readonly resumoDoDiaService = inject(ResumoDoDiaService);

  /** Fechamento do dia aberto (null = fechado). */
  protected readonly resumoDoDia = signal<ResumoDoDia | null>(null);

  /** O painel só aparece depois que perfil, catálogo, perguntas, galeria e conversas chegam. */
  protected readonly carregandoPainel = signal(true);

  protected readonly whatsappConectado = computed(() => this.perfilService.perfil().whatsappConectado);

  private readonly rotasPainel = inject(SessaoService).rotasDoPainel;
  /** Card "Como o assistente atende": as configurações do atendimento ficam numa tela própria. */
  protected readonly rotaAtendimento = computed(() => this.rotasPainel().atendimento);
  protected readonly rotaPosts = computed(() => this.rotasPainel().posts);

  protected readonly editandoPerfil = signal(false);
  protected readonly alterandoSenha = signal(false);
  /** Entrou com a senha temporária do "Esqueci minha senha": aviso para criar a senha nova. */
  protected readonly senhaTemporaria = computed(() => this.perfilService.perfil().senhaTemporaria ?? false);

  private readonly instalacaoApp = inject(InstalacaoAppService);
  private readonly avisosPush = inject(NotificacoesPushService);
  /** Fim do onboarding: convite para instalar o app e ativar os avisos (só se houver algo a fazer). */
  protected readonly mostrarConviteApp = signal(false);

  /** Conta nova: o onboarding em passos (segmento, catálogo, horários, pagamento, saudação e o exemplo). */
  protected readonly mostrarBoasVindas = signal(false);

  ngOnInit(): void {
    void this.carregarPainel();
  }

  private async carregarPainel(): Promise<void> {
    try {
      await Promise.all([
        this.perfilService.carregar(),
        this.produtoService.carregar(),
        this.perguntaService.carregar(),
        this.galeriaService.carregar(),
        this.conversaService.carregar(),
        this.contatoIgnoradoService.carregar(),
      ]);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível carregar o painel. Recarregue a página.'));
    } finally {
      this.carregandoPainel.set(false);
    }
    // Conta nova: depois de carregar, primeiro a janela de boas-vindas e depois o tour.
    // Deixa o lojista ver o painel por alguns segundos antes de abrir a janela.
    const perfil = this.perfilService.perfil();
    if (perfil.id && (!perfil.onboardingConcluido || TOUR_SEMPRE_ABERTO)) {
      this.depois(ESPERA_BOAS_VINDAS_MS, () => this.mostrarBoasVindas.set(true));
    } else if (perfil.id && lerDoNavegador(CHAVE_TOUR_PENDENTE + perfil.id)) {
      removerDoNavegador(CHAVE_TOUR_PENDENTE + perfil.id);
      this.depois(ESPERA_TOUR_MS, () => this.tour().iniciar());
    } else if (perfil.id) {
      void this.abrirFechamentoDoDia(perfil.id);
    }
  }

  /** Primeira visita depois do expediente: o fechamento do dia (uma vez por dia; sem movimento, não abre). */
  private async abrirFechamentoDoDia(perfilId: string): Promise<void> {
    let resumo: ResumoDoDia;
    try {
      resumo = await this.resumoDoDiaService.buscar(FECHAMENTO_SEMPRE_ABERTO);
    } catch {
      return;
    }
    const chave = CHAVE_FECHAMENTO_VISTO + perfilId;
    if (!FECHAMENTO_SEMPRE_ABERTO) {
      if (!resumo.encerrado || !resumo.comMovimento || lerDoNavegador(chave) === resumo.data) return;
      gravarNoNavegador(chave, resumo.data);
    }
    const temporizador = setTimeout(() => this.resumoDoDia.set(resumo), ESPERA_FECHAMENTO_MS);
    this.destroyRef.onDestroy(() => clearTimeout(temporizador));
  }

  /** Último passo do onboarding: o teste automático; o tour pelos cards fica para a volta ao painel. */
  protected iniciarTeste(): void {
    const perfil = this.perfilService.perfil();
    this.mostrarBoasVindas.set(false);
    this.perfilService.marcarOnboardingConcluido();
    gravarNoNavegador(CHAVE_TOUR_PENDENTE + perfil.id, '1');
    void this.router.navigate([this.rotasPainel().atendimento], { queryParams: { testar: 1 } });
  }

  private depois(ms: number, acao: () => void): void {
    const temporizador = setTimeout(acao, ms);
    this.destroyRef.onDestroy(() => clearTimeout(temporizador));
  }

  protected aoAlterarSenha(): void {
    this.alterandoSenha.set(false);
    this.toastService.mostrar('Senha alterada');
  }

  protected abrirEdicaoPerfil(): void {
    this.editandoPerfil.set(true);
  }

  protected fecharEdicaoPerfil(): void {
    this.editandoPerfil.set(false);
  }

  protected aoSalvarPerfil(): void {
    this.fecharEdicaoPerfil();
    this.toastService.mostrar('Dados da loja atualizados');
  }

  protected sairDaConta(): void {
    this.autenticacaoService.sair();
    void this.router.navigate(['/entrar']);
  }

  /** Fim do tour: o convite para instalar o app e ativar os avisos (só se houver algo a fazer). */
  protected aoEncerrarTour(concluido: boolean): void {
    this.router.navigate([], { relativeTo: this.rotaAtual, queryParams: {}, replaceUrl: true });
    if (concluido && (this.instalacaoApp.podeInstalar() || this.avisosPush.estado() === 'desativado')) {
      this.mostrarConviteApp.set(true);
    }
  }

  /** "Baixar atalho" no menu do perfil. */
  protected abrirConviteApp(): void {
    this.mostrarConviteApp.set(true);
  }

  protected fecharConviteApp(): void {
    this.mostrarConviteApp.set(false);
  }
}

function lerDoNavegador(chave: string): string | null {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function removerDoNavegador(chave: string): void {
  try {
    localStorage.removeItem(chave);
  } catch {
    // sem armazenamento: nada a limpar
  }
}

function gravarNoNavegador(chave: string, valor: string): void {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    // sem armazenamento: o fechamento pode abrir de novo, sem problema
  }
}
