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
import { DicaSobrepostaComponent, ItemDica } from '../../shared/components/dica-sobreposta/dica-sobreposta.component';
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
import { EscolhaSegmentoComponent } from './onboarding/escolha-segmento.component';
import { SegmentoNegocio } from '../../core/constants/segmentos';
import { PrimeirosPassosComponent } from './onboarding/primeiros-passos.component';
import { ConteudoRamoService } from '../../core/services/conteudo-ramo.service';
import { ramoDeServico, ramoUsaAgenda } from '../../core/models/perfil.model';
import { perguntaDoPrimeiroTeste } from './onboarding/progresso-onboarding';
import { ResumoLojaComponent } from './resumo-loja/resumo-loja.component';

/** Tempo que o painel fica à mostra antes da janela de boas-vindas abrir. */
const ESPERA_BOAS_VINDAS_MS = 2500;

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
    DicaSobrepostaComponent,
    CarregandoComponent,
    AlvoTourDirective,
    OnboardingTourComponent,
    EscolhaSegmentoComponent,
    PrimeirosPassosComponent,
    AlterarSenhaComponent,
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

  /** O painel só aparece depois que perfil, catálogo, perguntas, galeria e conversas chegam. */
  protected readonly carregandoPainel = signal(true);

  protected readonly whatsappConectado = computed(() => this.perfilService.perfil().whatsappConectado);

  private readonly rotasPainel = inject(SessaoService).rotasDoPainel;
  /** Card "Como o assistente atende": as configurações do atendimento ficam numa tela própria. */
  protected readonly rotaAtendimento = computed(() => this.rotasPainel().atendimento);

  protected readonly editandoPerfil = signal(false);
  protected readonly alterandoSenha = signal(false);
  /** Entrou com a senha temporária do "Esqueci minha senha": aviso para criar a senha nova. */
  protected readonly senhaTemporaria = computed(() => this.perfilService.perfil().senhaTemporaria ?? false);

  private readonly instalacaoApp = inject(InstalacaoAppService);
  private readonly avisosPush = inject(NotificacoesPushService);
  /** Fim do onboarding: convite para instalar o app e ativar os avisos (só se houver algo a fazer). */
  protected readonly mostrarConviteApp = signal(false);

  /** Conta nova: primeiro a janela de boas-vindas, depois o tour em passos. */
  protected readonly mostrarBoasVindas = signal(false);
  protected readonly tituloBoasVindas = computed(() => {
    const perfil = this.perfilService.perfil();
    const nome = perfil.nomeResponsavel?.trim().split(/\s+/)[0];
    return nome ? `${nome}, qual é o seu negócio?` : 'Qual é o seu negócio?';
  });
  /** As opções do ramo (barbearia, salão...) e a escolhida nas boas-vindas (undefined = nenhuma ainda). */
  protected readonly segmentosDoRamo = inject(ConteudoRamoService).segmentosDoRamo;
  protected readonly segmentoEscolhido = signal<SegmentoNegocio | null | undefined>(undefined);

  /** Fim do tour: convite para cadastrar o primeiro item e testar o assistente como cliente. */
  protected readonly mostrarConviteTeste = signal(false);
  private readonly conteudoRamo = inject(ConteudoRamoService).conteudo;
  protected readonly conviteTeste = computed(() => {
    const termo = this.conteudoRamo().termoItem;
    const temItem = this.produtoService.produtos().length > 0;
    const testar: ItemDica = {
      icone: 'conversa',
      titulo: 'Teste como se fosse cliente',
      texto: 'Mande uma mensagem e veja a resposta antes de ligar no WhatsApp.',
    };
    if (temItem) {
      return {
        descricao: 'Você já tem o que ele precisa para responder. Veja como ele atende os seus clientes.',
        itens: [testar],
        botao: 'Testar o atendimento',
      };
    }
    const itens: ItemDica[] = [
      { icone: 'caixa', titulo: `1. Cadastre o primeiro ${termo}`, texto: 'Nome, preço e as opções. Leva 1 minuto.' },
    ];
    // serviços com agenda: o teste só mostra horários depois que os dias de atendimento estão cadastrados
    if (ramoUsaAgenda(this.perfilService.perfil().ramo)) {
      itens.push({ icone: 'calendario', titulo: '2. Cadastre os seus horários', texto: 'Os dias e horários em que você atende.' });
    }
    itens.push({ ...testar, titulo: `${itens.length + 1}. Teste como se fosse cliente` });
    return {
      descricao: 'Ele responde com o que você cadastrar. Comece por um item e veja a resposta na hora.',
      itens,
      botao: `Cadastrar o primeiro ${termo}`,
    };
  });

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
    if (perfil.id && !perfil.onboardingConcluido) {
      const temporizador = setTimeout(() => this.mostrarBoasVindas.set(true), ESPERA_BOAS_VINDAS_MS);
      this.destroyRef.onDestroy(() => clearTimeout(temporizador));
    }
  }

  /** Grava o tipo do negócio (se escolheu) e começa o tour, já com os exemplos dele. */
  protected async iniciarTourAposBoasVindas(): Promise<void> {
    this.mostrarBoasVindas.set(false);
    const segmento = this.segmentoEscolhido();
    if (segmento !== undefined && segmento !== (this.perfilService.perfil().segmento ?? null)) {
      try {
        await this.perfilService.definirSegmento(segmento);
      } catch (erro) {
        this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível salvar o tipo do negócio. Mude depois em Dados da loja.'));
      }
    }
    this.tour().iniciar();
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

  /** "Agora não" nas boas-vindas: sem tour; o card "Primeiros passos" continua mostrando o caminho. */
  protected pularOnboarding(): void {
    this.mostrarBoasVindas.set(false);
    this.perfilService.marcarOnboardingConcluido();
  }

  /** Fim do tour: até o fim, convida para o teste; pulado, fica no painel com os "Primeiros passos". */
  protected aoEncerrarTour(concluido: boolean): void {
    this.perfilService.marcarOnboardingConcluido();
    this.router.navigate([], { relativeTo: this.rotaAtual, queryParams: {}, replaceUrl: true });
    if (concluido) {
      this.mostrarConviteTeste.set(true);
    }
  }

  /** Sem item cadastrado, vai ao cadastro (o vídeo da tela já abre o formulário); com item, direto ao teste. */
  protected aceitarConviteTeste(): void {
    this.mostrarConviteTeste.set(false);
    const rotas = this.rotasPainel();
    if (this.produtoService.produtos().length > 0) {
      const item = this.produtoService.produtos().find((produto) => !produto.produtoAVenda);
      const pergunta = perguntaDoPrimeiroTeste(ramoDeServico(this.perfilService.perfil().ramo), item?.nome);
      void this.router.navigate([rotas.atendimento], { queryParams: { testar: 1, pergunta } });
    } else {
      void this.router.navigate([rotas.produtos], { queryParams: { novo: 1 } });
    }
  }

  protected adiarConviteTeste(): void {
    this.mostrarConviteTeste.set(false);
    if (this.instalacaoApp.podeInstalar() || this.avisosPush.estado() === 'desativado') {
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
