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
import { FechamentoDoDiaComponent } from './fechamento-do-dia/fechamento-do-dia.component';
import { ResumoDoDia } from '../../core/models/resumo-do-dia.model';
import { ResumoDoDiaService } from '../../core/services/resumo-do-dia.service';

/** Tempo que o painel fica à mostra antes da janela de boas-vindas abrir. */
const ESPERA_BOAS_VINDAS_MS = 2500;
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
    DicaSobrepostaComponent,
    CarregandoComponent,
    AlvoTourDirective,
    OnboardingTourComponent,
    EscolhaSegmentoComponent,
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

  /** Conta nova: primeiro a janela de boas-vindas, depois o tour em passos. */
  protected readonly mostrarBoasVindas = signal(false);
  protected readonly tituloBoasVindas = computed(() => {
    const perfil = this.perfilService.perfil();
    const nome = perfil.nomeResponsavel?.trim().split(/\s+/)[0];
    return nome ? `${nome}, qual é o seu negócio?` : 'Qual é o seu negócio?';
  });
  /** Lojas de produtos saem das boas-vindas direto para o produto de exemplo; as outras, para o tour do painel. */
  protected readonly rotuloBoasVindas = computed(() =>
    ramoComProdutoDeExemplo(this.perfilService.perfil().ramo) ? 'Ver o meu exemplo' : 'Conhecer o painel',
  );
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
    if (ramoComProdutoDeExemplo(this.perfilService.perfil().ramo)) {
      // lojas de produtos: nunca pede o cadastro; a conta tem um produto de exemplo (criado nas boas-vindas ou,
      // se faltar, pela tela de Produtos) e o tour termina nele
      return {
        descricao: `Deixamos um ${termo} de exemplo cadastrado para você ver como funciona.`,
        itens: [
          { icone: 'caixa', titulo: 'Um cadastro completo', texto: 'Preço, opções que o cliente escolhe e adicionais.' } as ItemDica,
          { icone: 'conversa', titulo: 'O assistente vendendo', texto: 'Uma conversa que acontece sozinha, do preço ao pedido.' } as ItemDica,
        ],
        botao: 'Ver o exemplo',
      };
    }
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
    if (perfil.id && (!perfil.onboardingConcluido || TOUR_SEMPRE_ABERTO)) {
      const temporizador = setTimeout(() => this.mostrarBoasVindas.set(true), ESPERA_BOAS_VINDAS_MS);
      this.destroyRef.onDestroy(() => clearTimeout(temporizador));
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

  /** Grava o tipo do negócio (se escolheu) e começa o tour, já com os exemplos dele. */
  protected async iniciarTourAposBoasVindas(): Promise<void> {
    this.mostrarBoasVindas.set(false);
    await this.salvarSegmentoEscolhido();
    if (ramoComProdutoDeExemplo(this.perfilService.perfil().ramo)) {
      // lojas de produtos: o segmento já criou o produto de exemplo; vai direto a ele e ao teste (sem o tour)
      this.perfilService.marcarOnboardingConcluido();
      void this.router.navigate([this.rotasPainel().produtos], { queryParams: { exemplo: 1 } });
      return;
    }
    this.tour().iniciar();
  }

  /** A escolha do tipo do negócio é obrigatória nas boas-vindas: vale também para quem pula o tour. */
  private async salvarSegmentoEscolhido(): Promise<void> {
    const segmento = this.segmentoEscolhido();
    // sempre salva (mesmo igual ao atual): é aqui que as lojas de produtos ganham o produto de exemplo
    if (segmento !== undefined) {
      try {
        await this.perfilService.definirSegmento(segmento);
        if (!this.produtoService.produtos().length) {
          await this.produtoService.carregar();
        }
      } catch (erro) {
        this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível salvar o tipo do negócio. Mude depois em Dados da loja.'));
      }
    }
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
    void this.salvarSegmentoEscolhido();
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
    if (ramoComProdutoDeExemplo(this.perfilService.perfil().ramo)) {
      void this.router.navigate([rotas.produtos], { queryParams: { exemplo: 1 } });
    } else if (this.produtoService.produtos().length > 0) {
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

function lerDoNavegador(chave: string): string | null {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function gravarNoNavegador(chave: string, valor: string): void {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    // sem armazenamento: o fechamento pode abrir de novo, sem problema
  }
}

/** Ramos de produtos que ganham o produto de exemplo do segmento (ProdutosDeExemplo no backend). */
export function ramoComProdutoDeExemplo(ramo: string | null | undefined): boolean {
  return ramo === 'DOCES_SALGADOS' || ramo === 'PRODUTOS_PERSONALIZADOS' || ramo === 'PRODUTOS_GERAIS';
}
