import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';


import { mensagemDoErro } from '../../core/api/erro-api';
import { SessaoService } from '../../core/auth/sessao.service';
import { EMAIL_SUPORTE } from '../../core/constants/contato';
import { PerfilService } from '../../core/services/perfil.service';
import { ToastService } from '../../core/services/toast.service';
import { CadastroIncorporadoMetaService, ErroCadastroMeta } from '../../core/whatsapp/cadastro-incorporado-meta.service';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import {
  OPCOES_SITUACAO,
  PASSOS_JANELA_META,
  PROBLEMAS_COMUNS,
  ROTULO_PERGUNTA,
  SituacaoWhatsapp,
  etapasDaSituacao,
} from './passos-conexao';

@Component({
  selector: 'app-conectar-whatsapp-page',
  imports: [ReactiveFormsModule, RouterLink, IconeComponent, CarregandoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './conectar-whatsapp-page.component.html',
  styleUrls: ['../../shared/estilos-topo-azul.css', './conectar-whatsapp-page.component.css', './conectar-whatsapp-pc.css'],
})
export class ConectarWhatsappPageComponent implements OnInit {
  private readonly perfilService = inject(PerfilService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly sessao = inject(SessaoService);
  private readonly cadastroMeta = inject(CadastroIncorporadoMetaService);

  protected readonly perfil = this.perfilService.perfil;
  protected readonly caminhoPainel = this.sessao.caminhoPainel;
  protected readonly opcoesSituacao = OPCOES_SITUACAO;
  protected readonly passosJanelaMeta = PASSOS_JANELA_META;

  /** null = ainda na pergunta inicial. */
  protected readonly situacao = signal<SituacaoWhatsapp | null>(null);
  protected readonly indiceEtapa = signal(0);
  protected readonly etapas = computed(() => {
    const situacao = this.situacao();
    return situacao ? etapasDaSituacao(situacao) : [];
  });
  protected readonly etapaAtual = computed(() => this.etapas()[this.indiceEtapa()] ?? null);
  /** A etapa atual numa lista de um item: o @for recria o bloco a cada etapa, e ela entra com a animação. */
  protected readonly etapaVisivel = computed(() => {
    const etapa = this.etapaAtual();
    return etapa ? [etapa] : [];
  });
  /** Pergunta inicial + etapas: a barra de progresso conta a pergunta como o passo 1. */
  protected readonly totalPassos = computed(() => this.etapas().length + 1);
  protected readonly numeroPasso = computed(() => (this.situacao() ? this.indiceEtapa() + 2 : 1));
  /** Nomes curtos de todos os passos, na ordem (a pergunta é o primeiro). */
  protected readonly passos = computed(() => [ROTULO_PERGUNTA, ...this.etapas().map((etapa) => etapa.rotulo)]);
  protected readonly proximoPasso = computed(() => this.passos()[this.numeroPasso()] ?? null);

  protected readonly problemasComuns = PROBLEMAS_COMUNS;
  protected readonly emailSuporte = EMAIL_SUPORTE;
  protected readonly conectando = signal(false);

  /** Atalho para testar com o número de teste da Meta. Some no build de produção. */
  // TEMPORÁRIO: aberta em produção durante a análise do app da Meta; depois, volte para !environment.production
  protected readonly modoDesenvolvimento = true;
  protected readonly conectandoManualmente = signal(false);
  protected readonly formularioManual = inject(FormBuilder).nonNullable.group({
    phoneNumberId: ['', [Validators.required, Validators.pattern(/^\d{10,20}$/)]],
    wabaId: ['', [Validators.required, Validators.pattern(/^\d{10,20}$/)]],
    token: ['', Validators.required],
  });

  /** Abre o e-mail já com assunto e os dados da loja preenchidos. */
  protected readonly linkPedidoAjuda = computed(() => {
    const { nomeLoja, nomeResponsavel, whatsapp } = this.perfil();
    const assunto = `Quero ajuda para conectar meu WhatsApp - ${nomeLoja}`;
    const corpo = [
      'Olá! Gostaria de um atendimento individual para conectar meu WhatsApp ao DizAI.',
      '',
      `Nome: ${nomeResponsavel}`,
      `Loja: ${nomeLoja}`,
      `WhatsApp da loja: ${whatsapp}`,
      'Melhores dias e horários para falar comigo: ',
    ].join('\n');
    return `mailto:${EMAIL_SUPORTE}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  });

  protected escolherSituacao(situacao: SituacaoWhatsapp): void {
    this.situacao.set(situacao);
    this.indiceEtapa.set(0);
    rolarParaOTopo();
  }

  protected avancar(): void {
    this.indiceEtapa.update((indice) => Math.min(indice + 1, this.etapas().length - 1));
    rolarParaOTopo();
  }

  /** Volta para um passo já feito, pela lista de passos (0 = a pergunta inicial). */
  protected irParaPasso(indice: number): void {
    if (this.conectando() || indice >= this.numeroPasso() - 1) {
      return;
    }
    if (indice === 0) {
      this.situacao.set(null);
    } else {
      this.indiceEtapa.set(indice - 1);
    }
    rolarParaOTopo();
  }

  /** Na primeira etapa, volta para a pergunta inicial. */
  protected voltar(): void {
    if (this.conectando()) {
      return;
    }
    if (this.indiceEtapa() === 0) {
      this.situacao.set(null);
    } else {
      this.indiceEtapa.update((indice) => indice - 1);
    }
    rolarParaOTopo();
  }

  /** O SDK da Meta é baixado ao abrir a tela: a janela precisa abrir direto no clique. */
  ngOnInit(): void {
    if (!this.perfil().whatsappConectado && this.cadastroMeta.configurado) {
      this.cadastroMeta.prepararSdk().catch(() => undefined);
    }
  }

  protected async conectarComFacebook(): Promise<void> {
    if (this.conectando()) {
      return;
    }
    this.conectando.set(true);
    try {
      // Chamado antes de qualquer await, para o navegador não bloquear o pop-up.
      const resultado = await this.cadastroMeta.iniciar();
      await this.perfilService.conectarWhatsapp(resultado);
      this.toastService.mostrar('WhatsApp conectado! O assistente já pode responder.');
      await this.router.navigateByUrl(this.sessao.caminhoPainel());
    } catch (erro) {
      const mensagem =
        erro instanceof ErroCadastroMeta ? erro.message : mensagemDoErro(erro, 'Não foi possível concluir a conexão. Tente de novo.');
      this.toastService.mostrar(mensagem, 5000);
    } finally {
      this.conectando.set(false);
    }
  }

  /** Conecta o número de teste da Meta usando os dados da tela "Configuração da API". */
  protected async conectarManualmente(): Promise<void> {
    if (this.conectandoManualmente()) {
      return;
    }
    if (this.formularioManual.invalid) {
      this.formularioManual.markAllAsTouched();
      this.toastService.mostrar('Preencha os dois IDs (só números) e o token.');
      return;
    }
    this.conectandoManualmente.set(true);
    try {
      await this.perfilService.conectarWhatsappManualmente(this.formularioManual.getRawValue());
      this.formularioManual.reset();
      this.toastService.mostrar('Número conectado! Mande uma mensagem para ele pelo seu WhatsApp.', 5000);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível conectar o número.'), 6000);
    } finally {
      this.conectandoManualmente.set(false);
    }
  }
}

function rolarParaOTopo(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
