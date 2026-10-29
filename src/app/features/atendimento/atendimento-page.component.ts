import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { mensagemDoErro } from '../../core/api/erro-api';
import { SessaoService } from '../../core/auth/sessao.service';
import { MODOS_FOTOS, MODOS_PEDIDO } from '../../core/constants/opcoes-perfil';
import { ModoFotos, ModoPedido, ramoDeServico, ramoUsaAgenda } from '../../core/models/perfil.model';
import { AgendaService } from '../../core/services/agenda.service';
import { ArmazenamentoFotosService } from '../../core/services/armazenamento-fotos.service';
import { ConteudoRamoService } from '../../core/services/conteudo-ramo.service';
import { PerfilService } from '../../core/services/perfil.service';
import { ToastService } from '../../core/services/toast.service';
import { resumirHorarioFuncionamento } from '../../core/utils/datas-agenda';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { OpcaoCardComponent } from '../../shared/components/opcao-card/opcao-card.component';
import { SecaoConfiguracaoComponent } from '../../shared/components/secao-configuracao/secao-configuracao.component';
import { CatalogoConversaComponent } from '../painel/catalogo-conversa/catalogo-conversa.component';
import { EditarPerfilComponent } from '../painel/editar-perfil/editar-perfil.component';
import { RegrasNegocioComponent } from './regras-negocio/regras-negocio.component';
import { TipoVideoAtendimento, VideoAtendimentoComponent } from './video-atendimento/video-atendimento.component';
import { DicasVistasService } from '../../core/services/dicas-vistas.service';
import { TesteAtendimentoComponent } from '../painel/teste-atendimento/teste-atendimento.component';
import { MensagensRepasseComponent } from './mensagens-repasse/mensagens-repasse.component';
import { catalogosIniciais, criarFormularioConfiguracoes } from '../painel/painel-formulario';

/**
 * "Como o assistente atende": quando o cliente quiser fechar, fotos, saudação, catálogo e instruções obrigatórias.
 * Saía na tela inicial do painel; agora tem tela própria, aberta pelo card da tela inicial.
 */
@Component({
  selector: 'app-atendimento-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IconeComponent,
    OpcaoCardComponent,
    SecaoConfiguracaoComponent,
    CatalogoConversaComponent,
    CarregandoComponent,
    TesteAtendimentoComponent,
    BottomSheetComponent,
    EditarPerfilComponent,
    RegrasNegocioComponent,
    VideoAtendimentoComponent,
    MensagensRepasseComponent,
  ],
  templateUrl: './atendimento-page.component.html',
  styleUrls: ['./atendimento-page.component.css', './atendimento-pc.css'],
})
export class AtendimentoPageComponent implements OnInit {
  private readonly perfilService = inject(PerfilService);
  private readonly toastService = inject(ToastService);
  private readonly armazenamentoFotos = inject(ArmazenamentoFotosService);

  protected readonly carregando = signal(true);

  private readonly dicasVistas = inject(DicasVistasService);
  /** Vídeo de orientação na primeira visita (ou sempre, no modo de teste dos vídeos). */
  protected readonly mostrarVideo = signal(this.dicasVistas.deveMostrarVideo('video-atendimento'));
  protected readonly salvandoConfiguracoes = signal(false);
  /** Conversa de teste com o próprio assistente (botão "Testar atendimento" do topo). */
  protected readonly testando = signal(false);

  /**
   * "Agendamento automático" só aparece para os ramos com agenda (serviços presenciais). Nos serviços, "Agendo por
   * outro app" fica no lugar de "Me chamar na hora" (que só continua visível para quem já está nele).
   */
  protected readonly modosPedido = computed(() => {
    const perfil = this.perfilService.perfil();
    const servico = ramoDeServico(perfil.ramo);
    return MODOS_PEDIDO.filter(
      (modo) =>
        (!modo.soComAgenda || ramoUsaAgenda(perfil.ramo)) &&
        (!modo.soServicos || servico) &&
        (!modo.soProdutos || !servico || perfil.modoPedido === modo.valor),
    );
  });
  /**
   * "Só no meu horário de funcionamento" usa o horário cadastrado em Dados da loja (aqui só aparece o resumo).
   * Vazio quando ainda não foi cadastrado.
   */
  protected readonly resumoHorario = computed(() => {
    const perfil = this.perfilService.perfil();
    if (perfil.horarioLivre) {
      return 'Sempre (sem horário fixo)';
    }
    return resumirHorarioFuncionamento(perfil.horariosFuncionamento ?? []);
  });
  /** "Configure": abre Dados da loja aqui mesmo, sem sair da tela. */
  protected readonly editandoDadosLoja = signal(false);

  /** Com "Agendamento automático" a agenda fica ativa; falta só ter dias e horários cadastrados. */
  private readonly agendaService = inject(AgendaService);
  protected readonly agendaComHorarios = computed(
    () => (this.agendaService.configuracao()?.periodos.length ?? 0) > 0,
  );
  private readonly rotasPainel = inject(SessaoService).rotasDoPainel;
  protected readonly rotaAgenda = computed(() => this.rotasPainel().agenda);
  protected readonly rotaInicio = computed(() => this.rotasPainel().inicio);
  /** Bolinha verde no topo: WhatsApp conectado e assistente ligado (o mesmo critério do painel). */
  protected readonly assistenteAtivo = computed(
    () => this.perfilService.perfil().whatsappConectado && this.perfilService.perfil().iaAtiva,
  );

  /**
   * "Quando você confirma os pedidos?" não aparece em serviço com agendamento automático:
   * ali o assistente marca e confirma sozinho.
   */
  protected readonly mostrarConfirmacao = computed(
    () => !(ramoDeServico(this.perfilService.perfil().ramo) && this.valores().modoPedido === 'AGENDAMENTO_AUTOMATICO'),
  );

  /** Atalhos do topo: cada um leva até a sua configuração. */
  protected readonly atalhos = computed(() =>
    [
      { id: 'secao-saudacao', rotulo: 'Saudação' },
      { id: 'secao-fechamento', rotulo: 'Fechamento' },
      { id: 'secao-confirmacao', rotulo: 'Confirmação' },
      { id: 'secao-fotos', rotulo: 'Fotos' },
      { id: 'secao-catalogo', rotulo: 'Catálogo' },
      { id: 'secao-regras', rotulo: 'Regras' },
    ].filter((atalho) => atalho.id !== 'secao-confirmacao' || this.mostrarConfirmacao()),
  );
  protected readonly modosFotos = MODOS_FOTOS;
  protected readonly tipoVideo = computed<TipoVideoAtendimento>(() =>
    ramoDeServico(this.perfilService.perfil().ramo) ? 'servicos' : 'produtos',
  );

  protected readonly formulario = criarFormularioConfiguracoes(inject(FormBuilder), this.perfilService.perfil());

  /** Valores do formulário como signal, para o template reagir às escolhas. */
  protected readonly valores = toSignal(
    this.formulario.valueChanges.pipe(map(() => this.formulario.getRawValue())),
    { initialValue: this.formulario.getRawValue() },
  );

  /** Último estado salvo, usado para saber se o lojista mudou alguma coisa. */
  private readonly valoresSalvos = signal(this.formulario.getRawValue());

  /** Arquivos escolhidos e ainda não enviados, um grupo por catálogo: sobem no "Salvar alterações". */
  protected readonly pendentesCatalogo = signal<File[][]>([]);

  /** A barra de salvar só aparece quando o formulário difere do que está salvo (ou há catálogo novo). */
  protected readonly temAlteracoes = computed(
    () =>
      JSON.stringify(this.valores()) !== JSON.stringify(this.valoresSalvos()) ||
      this.pendentesCatalogo().some((grupo) => grupo.length > 0),
  );

  /** Envio do catálogo ligado, mas algum catálogo sem arquivo salvo nem escolhido. */
  protected readonly faltaCatalogo = computed(
    () =>
      this.valores().modoCatalogo !== 'NAO' &&
      this.valores().catalogos.some(
        (catalogo, i) => catalogo.arquivos.length === 0 && (this.pendentesCatalogo()[i]?.length ?? 0) === 0,
      ),
  );

  /** Com 2 ou 3 catálogos, cada um precisa de assunto e contexto (é por eles que o assistente escolhe). */
  protected readonly faltaAssuntoCatalogo = computed(() => {
    const catalogos = this.valores().catalogos;
    return catalogos.length > 1 && catalogos.some((c) => !c.assunto?.trim() || !c.contexto?.trim());
  });

  protected readonly tentouSalvar = signal(false);

  private readonly conteudoRamoService = inject(ConteudoRamoService);
  /** Exemplos e sugestões do ramo da loja (placeholders e regras comuns). */
  protected readonly conteudoRamo = this.conteudoRamoService.conteudo;
  protected readonly exemploSaudacao = this.conteudoRamoService.exemploSaudacao;

  /** O erro do link de agendamento aparece depois que o campo foi tocado ou que o lojista tentou salvar. */
  protected mostrarErroLinkAgenda(): boolean {
    const controle = this.formulario.controls.linkAgendamentoExterno;
    const tocado = controle.touched || this.tentouSalvar();
    return tocado && (controle.invalid || this.formulario.hasError('linkAgendamentoObrigatorio'));
  }

  /** O erro do link aparece depois que o campo foi tocado ou que o lojista tentou salvar. */
  protected mostrarErroLink(): boolean {
    const controleLink = this.formulario.controls.linkPortfolioExterno;
    const linkFoiTocado = controleLink.touched || this.tentouSalvar();
    return linkFoiTocado && (controleLink.invalid || this.formulario.hasError('linkPortfolioObrigatorio'));
  }

  ngOnInit(): void {
    void this.carregar();
  }

  /** Aberta direto pelo link (ou depois de recarregar), a tela busca o perfil antes de preencher o formulário. */
  private async carregar(): Promise<void> {
    try {
      await this.perfilService.carregar();
      if (ramoUsaAgenda(this.perfilService.perfil().ramo)) {
        void this.agendaService.carregarConfiguracao().catch(() => undefined);
      }
      const perfil = this.perfilService.perfil();
      this.formulario.reset({ ...perfil, catalogos: catalogosIniciais(perfil) });
      this.valoresSalvos.set(this.formulario.getRawValue());
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível carregar as configurações. Recarregue a página.'));
    } finally {
      this.carregando.set(false);
    }
  }

  protected escolherModoPedido(modo: ModoPedido): void {
    this.formulario.controls.modoPedido.setValue(modo);
    this.formulario.markAsDirty();
  }

  protected fecharVideo(): void {
    this.dicasVistas.marcarComoVista('video-atendimento');
    this.mostrarVideo.set(false);
  }

  protected escolherQualquerHora(qualquerHora: boolean): void {
    this.formulario.controls.confirmaQualquerHora.setValue(qualquerHora);
    this.formulario.markAsDirty();
  }

  protected aoSalvarDadosLoja(): void {
    this.editandoDadosLoja.set(false);
    this.toastService.mostrar('Horário de funcionamento atualizado');
  }

  protected escolherModoFotos(modo: ModoFotos): void {
    this.formulario.controls.modoFotos.setValue(modo);
    this.formulario.markAsDirty();
  }

  /** A lista de regras devolve o texto inteiro (uma regra por linha). */
  protected definirInstrucoes(texto: string): void {
    const controle = this.formulario.controls.instrucoesObrigatorias;
    controle.setValue(texto);
    controle.markAsDirty();
    controle.markAsTouched();
  }

  protected irPara(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    if (!this.valores().confirmaQualquerHora && !this.resumoHorario()) {
      this.toastService.mostrar('Cadastre o horário de funcionamento em Dados da loja (toque em Configure).');
      return;
    }
    if (this.valores().catalogos.length > 1 && this.valores().modoCatalogo === 'SAUDACAO') {
      this.toastService.mostrar('Na saudação vai um catálogo só. Escolha "Quando o cliente perguntar" ou remova os outros.');
      return;
    }
    if (this.faltaAssuntoCatalogo()) {
      this.toastService.mostrar('Dê um assunto e diga do que fala cada catálogo.');
      return;
    }
    if (this.faltaCatalogo()) {
      this.toastService.mostrar('Envie o arquivo de cada catálogo (PDF ou imagem) ou escolha "Não" no envio do catálogo.');
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

  /**
   * Sobe os arquivos escolhidos de cada catálogo e junta as referências às que já estavam salvas. O 1º catálogo
   * também vai em catalogoArquivos (o campo de sempre).
   */
  private async enviarCatalogoPendente(): Promise<void> {
    const controle = this.formulario.controls.catalogos;
    const catalogos = controle.value.map((c) => ({ ...c, arquivos: [...c.arquivos] }));
    const pendentes = this.pendentesCatalogo();
    for (let i = 0; i < catalogos.length; i++) {
      const grupo = pendentes[i] ?? [];
      if (grupo.length > 0) {
        catalogos[i].arquivos.push(...(await this.armazenamentoFotos.enviar(grupo, { tipo: 'CATALOGO' })));
      }
    }
    controle.setValue(catalogos);
    this.formulario.controls.catalogoArquivos.setValue(catalogos[0]?.arquivos ?? []);
    this.pendentesCatalogo.set([]);
  }

  /** Volta o formulário para o último estado salvo. */
  protected descartarAlteracoes(): void {
    this.formulario.reset(this.valoresSalvos());
    this.pendentesCatalogo.set([]);
    this.tentouSalvar.set(false);
  }
}
