import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';

import { Router, RouterLink } from '@angular/router';

import { mensagemDoErro } from '../../../core/api/erro-api';
import { SessaoService } from '../../../core/auth/sessao.service';
import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { FORMAS_RECEBIMENTO, RAMOS_NEGOCIO, obterRotulo } from '../../../core/constants/opcoes-perfil';
import { COR_MARCA_PADRAO, buscarCorMarca } from '../../../core/constants/cores-marca';
import { InstalacaoAppService } from '../../../core/pwa/instalacao-app.service';
import { ArmazenamentoFotosService } from '../../../core/services/armazenamento-fotos.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { ToastService } from '../../../core/services/toast.service';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { InterruptorComponent } from '../../../shared/components/interruptor/interruptor.component';
import { ItemMenuAcoes, MenuAcoesComponent } from '../../../shared/components/menu-acoes/menu-acoes.component';
import { AlvoTourDirective } from '../onboarding/alvo-tour.directive';

type AcaoPerfil = 'editar' | 'estatisticas' | 'senha' | 'atalho' | 'sair';

const TAMANHO_MAXIMO_FOTO_BYTES = 5 * 1024 * 1024;

const ITEM_EDITAR: ItemMenuAcoes<AcaoPerfil> = { id: 'editar', rotulo: 'Editar dados da loja', icone: 'editar' };
const ITEM_ESTATISTICAS: ItemMenuAcoes<AcaoPerfil> = { id: 'estatisticas', rotulo: 'Estatísticas', icone: 'grafico' };
const ITEM_SENHA: ItemMenuAcoes<AcaoPerfil> = { id: 'senha', rotulo: 'Alterar senha', icone: 'cadeado' };
const ITEM_ATALHO: ItemMenuAcoes<AcaoPerfil> = { id: 'atalho', rotulo: 'Baixar atalho', icone: 'celular' };
const ITEM_SAIR: ItemMenuAcoes<AcaoPerfil> = { id: 'sair', rotulo: 'Sair da conta', icone: 'sair', perigo: true };

/** Topo do painel: saudação, identidade da loja, status do assistente e link público. */
@Component({
  selector: 'app-resumo-loja',
  imports: [IconeComponent, MenuAcoesComponent, AlvoTourDirective, CarregandoComponent, InterruptorComponent, UrlImagemPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resumo-loja.component.html',
  styleUrls: ['./resumo-loja.component.css', './conectar-whatsapp.css'],
  host: {
    '[style.--brilho-topo]': 'brilhoTopo()',
  },
})
export class ResumoLojaComponent {
  readonly editarDados = output<void>();
  readonly sair = output<void>();
  /** "Baixar atalho": o painel abre a janela de instalação do app (a mesma do fim do onboarding). */
  readonly baixarAtalho = output<void>();
  readonly alterarSenha = output<void>();

  private readonly perfilService = inject(PerfilService);
  private readonly toastService = inject(ToastService);
  private readonly armazenamentoFotos = inject(ArmazenamentoFotosService);

  protected readonly perfil = this.perfilService.perfil;
  private readonly instalacaoApp = inject(InstalacaoAppService);
  private readonly router = inject(Router);
  private readonly rotas = inject(SessaoService).rotasDoPainel;
  protected readonly rotaConectar = computed(() => this.rotas().conectarWhatsapp);
  /** "Baixar atalho" só enquanto o DizAI ainda não está instalado neste aparelho. */
  protected readonly itensMenu = computed(() => [
    ITEM_EDITAR,
    ITEM_ESTATISTICAS,
    ITEM_SENHA,
    ...(this.instalacaoApp.podeInstalar() ? [ITEM_ATALHO] : []),
    ITEM_SAIR,
  ]);

  protected readonly enviandoFoto = signal(false);
  /** Sem foto, a inicial aparece na cor escolhida para a página pública. */
  protected readonly corMarca = computed(() => buscarCorMarca(this.perfil().corMarca).hex);
  protected readonly brilhoTopo = computed(() =>
    this.perfil().corMarca === COR_MARCA_PADRAO ? null : `color-mix(in srgb, ${this.corMarca()} 16%, white)`,
  );

  protected readonly inicial = computed(() => this.perfil().nomeLoja.trim().charAt(0).toUpperCase() || '?');

  /** "Boa tarde, Isabela": usa só o primeiro nome do responsável. */
  protected readonly saudacao = computed(() => {
    const primeiroNome = this.perfil().nomeResponsavel.trim().split(/\s+/)[0];
    const periodo = saudacaoDoPeriodo(new Date().getHours());
    return primeiroNome ? `${periodo}, ${primeiroNome}` : periodo;
  });

  /** Etiquetas curtas abaixo do nome: o ramo e cada forma de atendimento. */
  protected readonly etiquetas = computed(() => {
    const perfil = this.perfil();
    const formasRecebimento = perfil.formasRecebimento.map((forma) => obterRotulo(FORMAS_RECEBIMENTO, forma));
    return [obterRotulo(RAMOS_NEGOCIO, perfil.ramo), ...formasRecebimento].filter(Boolean);
  });

  protected readonly salvandoIaAtiva = signal(false);

  /** O assistente só responde de verdade com o WhatsApp conectado e as respostas ligadas. */
  protected readonly assistenteRespondendo = computed(
    () => this.perfil().whatsappConectado && this.perfil().iaAtiva,
  );

  protected readonly textoStatus = computed(() => {
    if (!this.perfil().whatsappConectado) {
      return 'WhatsApp desconectado';
    }
    return this.perfil().iaAtiva ? 'Assistente ativo' : 'Assistente pausado';
  });

  /** Liga ou pausa as respostas automáticas. Pausado, as mensagens continuam chegando, mas ninguém responde por você. */
  protected async definirIaAtiva(iaAtiva: boolean): Promise<void> {
    if (this.salvandoIaAtiva()) {
      return;
    }
    this.salvandoIaAtiva.set(true);
    try {
      await this.perfilService.definirIaAtiva(iaAtiva);
      this.toastService.mostrar(
        iaAtiva ? 'Assistente ligado. Ele volta a responder seus clientes.' : 'Assistente pausado. Você responde pelo celular.',
      );
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível mudar o assistente. Tente de novo.'));
    } finally {
      this.salvandoIaAtiva.set(false);
    }
  }

  protected aoEscolherNoMenu(acao: AcaoPerfil): void {
    if (acao === 'editar') {
      this.editarDados.emit();
    } else if (acao === 'estatisticas') {
      void this.router.navigateByUrl(this.rotas().estatisticas);
    } else if (acao === 'senha') {
      this.alterarSenha.emit();
    } else if (acao === 'atalho') {
      this.baixarAtalho.emit();
    } else {
      this.sair.emit();
    }
  }

  /** O lojista escolheu uma imagem: envia ao armazenamento e guarda a referência no perfil. */
  protected async aoEscolherFoto(evento: Event): Promise<void> {
    const campo = evento.target as HTMLInputElement;
    const arquivo = campo.files?.[0];
    campo.value = ''; // permite escolher o mesmo arquivo de novo
    if (!arquivo) {
      return;
    }
    if (!arquivo.type.startsWith('image/')) {
      this.toastService.mostrar('Escolha um arquivo de imagem (JPG, PNG ou WEBP).');
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_FOTO_BYTES) {
      this.toastService.mostrar('A imagem é muito grande. Use uma de até 5 MB.');
      return;
    }

    this.enviandoFoto.set(true);
    try {
      const [referencia] = await this.armazenamentoFotos.enviar([arquivo], { tipo: 'PERFIL' });
      await this.perfilService.atualizarFotoPerfil(referencia);
      this.toastService.mostrar('Foto da loja atualizada');
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível enviar a foto. Tente de novo.'));
    } finally {
      this.enviandoFoto.set(false);
    }
  }
}

function saudacaoDoPeriodo(hora: number): string {
  if (hora >= 5 && hora < 12) {
    return 'Bom dia';
  }
  return hora >= 12 && hora < 18 ? 'Boa tarde' : 'Boa noite';
}
