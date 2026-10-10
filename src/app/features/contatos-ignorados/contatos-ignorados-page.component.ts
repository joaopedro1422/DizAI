import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../core/api/erro-api';
import { SessaoService } from '../../core/auth/sessao.service';
import { NovoContatoIgnorado, OrigemContatoIgnorado } from '../../core/models/contato.model';
import { ContatoIgnoradoService } from '../../core/services/contato-ignorado.service';
import { PerfilService } from '../../core/services/perfil.service';
import { ToastService } from '../../core/services/toast.service';
import { pluralizar } from '../../core/utils/colecao.utils';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { CabecalhoPaginaComponent } from '../../shared/components/cabecalho-pagina/cabecalho-pagina.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { EstadoVazioComponent } from '../../shared/components/estado-vazio/estado-vazio.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { AdicionarNumeroComponent } from './adicionar-numero/adicionar-numero.component';
import { EscolherContatosWhatsappComponent } from './escolher-contatos-whatsapp/escolher-contatos-whatsapp.component';

type ModalContatos = 'whatsapp' | 'manual';

const ROTULO_ORIGEM: Record<OrigemContatoIgnorado, string> = {
  WHATSAPP: 'Do WhatsApp',
  AGENDA_CELULAR: 'Da agenda',
  MANUAL: 'Digitado',
};

/** Tela "Contatos a ignorar": números pessoais que o assistente nunca responde. */
@Component({
  selector: 'app-contatos-ignorados-page',
  imports: [
    RouterLink,
    CabecalhoPaginaComponent,
    IconeComponent,
    AvatarComponent,
    BottomSheetComponent,
    EstadoVazioComponent,
    CarregandoComponent,
    AdicionarNumeroComponent,
    EscolherContatosWhatsappComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contatos-ignorados-page.component.html',
  styleUrls: ['../../shared/estilos-listagem.css', './contatos-ignorados-page.component.css'],
})
export class ContatosIgnoradosPageComponent implements OnInit {
  private readonly contatoIgnoradoService = inject(ContatoIgnoradoService);
  private readonly toastService = inject(ToastService);

  protected readonly contatos = this.contatoIgnoradoService.contatos;
  protected readonly carregando = this.contatoIgnoradoService.carregando;
  private readonly perfil = inject(PerfilService).perfil;
  protected readonly whatsappConectado = computed(() => this.perfil().whatsappConectado);
  protected readonly modalAberto = signal<ModalContatos | null>(null);
  protected readonly salvando = signal(false);
  protected readonly removendoId = signal<number | null>(null);
  protected readonly rotuloOrigem = ROTULO_ORIGEM;
  protected readonly rotas = inject(SessaoService).rotasDoPainel;

  protected readonly subtitulo = computed(() => {
    const total = this.contatos().length;
    const quantidade = total === 0 ? 'Nenhum contato ainda' : pluralizar(total, 'contato', 'contatos');
    return `${quantidade}. O assistente não responde ninguém desta lista.`;
  });

  protected readonly tituloModal = computed(() =>
    this.modalAberto() === 'whatsapp' ? 'Escolher do WhatsApp' : 'Adicionar número',
  );

  ngOnInit(): void {
    this.contatoIgnoradoService
      .carregar()
      .catch((erro: unknown) => this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR)));
  }

  protected abrirModal(modal: ModalContatos): void {
    this.modalAberto.set(modal);
  }

  protected fecharModal(): void {
    this.modalAberto.set(null);
  }

  protected async adicionar(novos: NovoContatoIgnorado[]): Promise<void> {
    this.salvando.set(true);
    try {
      const adicionados = await this.contatoIgnoradoService.adicionar(novos);
      this.fecharModal();
      this.toastService.mostrar(
        adicionados === 0
          ? 'Esses números já estavam na lista'
          : pluralizar(adicionados, 'contato ignorado', 'contatos ignorados'),
      );
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível salvar. Tente de novo.'));
    } finally {
      this.salvando.set(false);
    }
  }

  protected async remover(contatoId: number): Promise<void> {
    if (this.removendoId() !== null) {
      return;
    }
    this.removendoId.set(contatoId);
    try {
      await this.contatoIgnoradoService.remover(contatoId);
      this.toastService.mostrar('Removido. O assistente volta a responder esse número.');
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível remover. Tente de novo.'));
    } finally {
      this.removendoId.set(null);
    }
  }
}
