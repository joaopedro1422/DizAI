import { Component, DestroyRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { mensagemDoErro } from '../../core/api/erro-api';
import { AutenticacaoService } from '../../core/auth/autenticacao.service';
import { MODOS_FOTOS, MODOS_PEDIDO } from '../../core/constants/opcoes-perfil';
import { ModoFotos, ModoPedido } from '../../core/models/perfil.model';
import { ContatoIgnoradoService } from '../../core/services/contato-ignorado.service';
import { ConteudoRamoService } from '../../core/services/conteudo-ramo.service';
import { ConversaService } from '../../core/services/conversa.service';
import { GaleriaService } from '../../core/services/galeria.service';
import { PerfilService } from '../../core/services/perfil.service';
import { PerguntaFrequenteService } from '../../core/services/pergunta-frequente.service';
import { ArmazenamentoFotosService } from '../../core/services/armazenamento-fotos.service';
import { ProdutoService } from '../../core/services/produto.service';
import { ToastService } from '../../core/services/toast.service';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { DicaSobrepostaComponent } from '../../shared/components/dica-sobreposta/dica-sobreposta.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { OpcaoCardComponent } from '../../shared/components/opcao-card/opcao-card.component';
import { SecaoConfiguracaoComponent } from '../../shared/components/secao-configuracao/secao-configuracao.component';
import { AlertaConexaoWhatsappComponent } from './alerta-conexao-whatsapp/alerta-conexao-whatsapp.component';
import { InstalacaoAppService } from '../../core/pwa/instalacao-app.service';
import { NotificacoesPushService } from '../../core/pwa/notificacoes-push.service';
import { AppNoCelularComponent } from './app-no-celular/app-no-celular.component';
import { AtalhosSecoesComponent } from './atalhos-secoes/atalhos-secoes.component';
import { CatalogoConversaComponent } from './catalogo-conversa/catalogo-conversa.component';
import { EditarPerfilComponent } from './editar-perfil/editar-perfil.component';
import { AlvoTourDirective } from './onboarding/alvo-tour.directive';
import { OnboardingTourComponent } from './onboarding/onboarding-tour.component';
import { OnboardingTourService } from './onboarding/onboarding-tour.service';
import { criarFormularioConfiguracoes } from './painel-formulario';
import { ResumoLojaComponent } from './resumo-loja/resumo-loja.component';

/** Tempo que o painel fica à mostra antes da janela de boas-vindas abrir. */
const ESPERA_BOAS_VINDAS_MS = 2500;

/** Tela inicial do painel do lojista. */
@Component({
  selector: 'app-painel-page',
  imports: [
    ReactiveFormsModule,
    IconeComponent,
    OpcaoCardComponent,
    SecaoConfiguracaoComponent,
    ResumoLojaComponent,
    AtalhosSecoesComponent,
    AppNoCelularComponent,
    CatalogoConversaComponent,
    AlertaConexaoWhatsappComponent,
    BottomSheetComponent,
    EditarPerfilComponent,
    DicaSobrepostaComponent,
    CarregandoComponent,
    AlvoTourDirective,
    OnboardingTourComponent,
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
  private readonly armazenamentoFotos = inject(ArmazenamentoFotosService);
  private readonly autenticacaoService = inject(AutenticacaoService);
  private readonly router = inject(Router);
  private readonly rotaAtual = inject(ActivatedRoute);
  private readonly tour = viewChild.required(OnboardingTourComponent);
  private readonly destroyRef = inject(DestroyRef);

  /** O painel só aparece depois que perfil, catálogo, perguntas, galeria e conversas chegam. */
  protected readonly carregandoPainel = signal(true);
  protected readonly salvandoConfiguracoes = signal(false);

  protected readonly whatsappConectado = computed(() => this.perfilService.perfil().whatsappConectado);

  protected readonly modosPedido = MODOS_PEDIDO;
  protected readonly modosFotos = MODOS_FOTOS;

  protected readonly formulario = criarFormularioConfiguracoes(inject(FormBuilder), this.perfilService.perfil());

  /** Valores do formulário como signal, para o template reagir às escolhas. */
  protected readonly valores = toSignal(
    this.formulario.valueChanges.pipe(map(() => this.formulario.getRawValue())),
    { initialValue: this.formulario.getRawValue() },
  );

  /** Último estado salvo, usado para saber se o lojista mudou alguma coisa. */
  private readonly valoresSalvos = signal(this.formulario.getRawValue());

  /** Arquivos do catálogo escolhidos e ainda não enviados: sobem no "Salvar alterações". */
  protected readonly pendentesCatalogo = signal<File[]>([]);

  /** A barra de salvar só aparece quando o formulário difere do que está salvo (ou há catálogo novo). */
  protected readonly temAlteracoes = computed(
    () =>
      JSON.stringify(this.valores()) !== JSON.stringify(this.valoresSalvos()) || this.pendentesCatalogo().length > 0,
  );

  /** Envio do catálogo ligado, mas sem nenhum arquivo salvo nem escolhido. */
  protected readonly faltaCatalogo = computed(
    () =>
      this.valores().modoCatalogo !== 'NAO' &&
      this.valores().catalogoArquivos.length === 0 &&
      this.pendentesCatalogo().length === 0,
  );

  protected readonly tentouSalvar = signal(false);

  private readonly conteudoRamoService = inject(ConteudoRamoService);
  /** Exemplos e sugestões do ramo da loja (placeholders e regras comuns). */
  protected readonly conteudoRamo = this.conteudoRamoService.conteudo;
  protected readonly exemploSaudacao = this.conteudoRamoService.exemploSaudacao;

  /** Regras sugeridas que ainda não estão nas instruções obrigatórias. */
  protected readonly instrucoesSugeridas = computed(() => {
    const instrucoesAtuais = this.valores().instrucoesObrigatorias.toLowerCase();
    return this.conteudoRamo().instrucoesSugeridas.filter((instrucao) => !instrucoesAtuais.includes(instrucao.toLowerCase()));
  });
  protected readonly editandoPerfil = signal(false);

  private readonly instalacaoApp = inject(InstalacaoAppService);
  private readonly avisosPush = inject(NotificacoesPushService);
  /** Fim do onboarding: convite para instalar o app e ativar os avisos (só se houver algo a fazer). */
  protected readonly mostrarConviteApp = signal(false);

  /** Conta nova: primeiro a janela de boas-vindas, depois o tour em passos. */
  protected readonly mostrarBoasVindas = signal(false);

  /** O erro do link aparece depois que o campo foi tocado ou que o lojista tentou salvar. */
  protected mostrarErroLink(): boolean {
    const controleLink = this.formulario.controls.linkPortfolioExterno;
    const linkFoiTocado = controleLink.touched || this.tentouSalvar();
    return linkFoiTocado && (controleLink.invalid || this.formulario.hasError('linkPortfolioObrigatorio'));
  }

  /** Como a primeira mensagem aparece para o cliente. */
  protected readonly previaSaudacao = computed(() => {
    const saudacao = this.valores().saudacaoPersonalizada.trim();
    if (saudacao) {
      return saudacao;
    }
    const nomeLoja = this.perfilService.perfil().nomeLoja;
    return `Olá! Que bom ter você aqui na ${nomeLoja}!`;
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
      this.preencherFormularioComPerfil();
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

  /** O formulário nasce antes da resposta do backend: aqui ele recebe os valores salvos da loja. */
  private preencherFormularioComPerfil(): void {
    this.formulario.reset(this.perfilService.perfil());
    this.valoresSalvos.set(this.formulario.getRawValue());
  }

  protected iniciarTourAposBoasVindas(): void {
    this.mostrarBoasVindas.set(false);
    this.tour().iniciar();
  }

  protected escolherModoPedido(modo: ModoPedido): void {
    this.formulario.controls.modoPedido.setValue(modo);
    this.formulario.markAsDirty();
  }

  protected escolherModoFotos(modo: ModoFotos): void {
    this.formulario.controls.modoFotos.setValue(modo);
    this.formulario.markAsDirty();
  }

  /** Coloca a regra sugerida numa linha nova das instruções obrigatórias. */
  protected adicionarInstrucao(instrucao: string): void {
    const controle = this.formulario.controls.instrucoesObrigatorias;
    const atuais = controle.value.trimEnd();
    controle.setValue(atuais ? `${atuais}\n${instrucao}` : instrucao);
    controle.markAsDirty();
  }

  protected async salvar(): Promise<void> {
    if (this.salvandoConfiguracoes()) {
      return;
    }
    this.tentouSalvar.set(true);
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.toastService.mostrar('Confira os campos destacados antes de salvar.');
      return;
    }
    if (this.faltaCatalogo()) {
      this.toastService.mostrar('Envie o catálogo (PDF ou imagem) ou escolha "Não" no envio do catálogo.');
      return;
    }
    this.salvandoConfiguracoes.set(true);
    try {
      await this.enviarCatalogoPendente();
      const valoresAtuais = this.formulario.getRawValue();
      await this.perfilService.salvarConfiguracoes(valoresAtuais);
      this.valoresSalvos.set(valoresAtuais);
      this.formulario.markAsPristine();
      this.tentouSalvar.set(false);
      this.toastService.mostrar('Alterações salvas');
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível salvar. Tente de novo.'));
    } finally {
      this.salvandoConfiguracoes.set(false);
    }
  }

  /** Sobe os arquivos escolhidos do catálogo e junta as referências às que já estavam salvas. */
  private async enviarCatalogoPendente(): Promise<void> {
    const pendentes = this.pendentesCatalogo();
    if (pendentes.length === 0) {
      return;
    }
    const referencias = await this.armazenamentoFotos.enviar(pendentes, { tipo: 'CATALOGO' });
    const controle = this.formulario.controls.catalogoArquivos;
    controle.setValue([...controle.value, ...referencias]);
    this.pendentesCatalogo.set([]);
  }

  /** Volta o formulário para o último estado salvo. */
  protected descartarAlteracoes(): void {
    this.formulario.reset(this.valoresSalvos());
    this.pendentesCatalogo.set([]);
    this.tentouSalvar.set(false);
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

  protected aoEncerrarTour(): void {
    this.perfilService.marcarOnboardingConcluido();
    this.router.navigate([], { relativeTo: this.rotaAtual, queryParams: {}, replaceUrl: true });
    this.toastService.mostrar('Tudo pronto! Comece cadastrando seus produtos.');
    if (this.instalacaoApp.podeInstalar() || this.avisosPush.estado() === 'desativado') {
      this.mostrarConviteApp.set(true);
    }
  }

  protected fecharConviteApp(): void {
    this.mostrarConviteApp.set(false);
  }
}
