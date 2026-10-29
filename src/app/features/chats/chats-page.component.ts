import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../core/api/erro-api';
import { Conversa } from '../../core/models/conversa.model';
import { ramoDeServico } from '../../core/models/perfil.model';
import { ConversaService } from '../../core/services/conversa.service';
import { DicasVistasService } from '../../core/services/dicas-vistas.service';
import { PerfilService } from '../../core/services/perfil.service';
import { ToastService } from '../../core/services/toast.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { RouterLink } from '@angular/router';
import { SessaoService } from '../../core/auth/sessao.service';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { EstadoVazioComponent } from '../../shared/components/estado-vazio/estado-vazio.component';
import { TempoDecorridoPipe } from '../../shared/pipes/tempo-decorrido.pipe';
import { ConversaAguardandoCardComponent } from './conversa-aguardando-card/conversa-aguardando-card.component';
import { limparMarcaIcone } from '../../core/utils/marca-icone';
import { VideoChatsComponent } from './video-chats/video-chats.component';
import { DetalheConversaComponent } from './detalhe-conversa/detalhe-conversa.component';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import {
  AcaoPedidoConversa,
  AcaoPedidoConversaComponent,
} from '../pedidos/acao-pedido-conversa/acao-pedido-conversa.component';

type AbaChats = 'aguardando' | 'andamento';

@Component({
  selector: 'app-chats-page',
  imports: [
    VideoChatsComponent,
    RouterLink,
    IconeComponent,
    EstadoVazioComponent,
    AvatarComponent,
    TempoDecorridoPipe,
    ConversaAguardandoCardComponent,
    CarregandoComponent,
    BottomSheetComponent,
    AcaoPedidoConversaComponent,
    DetalheConversaComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chats-page.component.html',
  styleUrls: [
    '../../shared/estilos-listagem.css',
    '../../shared/estilos-topo-azul.css',
    './chats-page.component.css',
    './chats-pc.css',
  ],
})
export class ChatsPageComponent implements OnInit {
  private readonly conversaService = inject(ConversaService);
  private readonly toastService = inject(ToastService);
  private readonly perfil = inject(PerfilService).perfil;
  private readonly dicasVistas = inject(DicasVistasService);
  private readonly rotas = inject(SessaoService).rotasDoPainel;
  protected readonly rotaInicio = computed(() => this.rotas().inicio);
  protected readonly rotaClientes = computed(() => this.rotas().clientes);

  /** O vídeo explica pedidos conduzidos pela IA: só para os ramos de produtos. */
  protected readonly temVideo = computed(() => !ramoDeServico(this.perfil().ramo));
  protected readonly mostrarVideo = signal(this.dicasVistas.deveMostrarVideo('video-chats'));

  protected fecharVideo(): void {
    this.dicasVistas.marcarComoVista('video-chats');
    this.mostrarVideo.set(false);
  }

  protected readonly aguardandoDono = this.conversaService.aguardandoDono;
  protected readonly emAndamento = this.conversaService.emAndamento;
  protected readonly abaAtual = signal<AbaChats>('aguardando');
  protected readonly carregando = this.conversaService.carregando;
  /** Conversa sendo marcada como resolvida (mostra o carregando no botão). */
  protected readonly resolvendoId = signal<string | null>(null);
  /** Em andamento: a conversa aberta no modal (quem é, as últimas mensagens e assumir/devolver). */
  protected readonly conversaAberta = signal<Conversa | null>(null);
  /** Ação de pedido aberta no modal (confirmar, entregar ou recusar). */
  protected readonly acaoPedido = signal<{ conversa: Conversa; acao: AcaoPedidoConversa } | null>(null);
  protected readonly titulosAcaoPedido: Record<AcaoPedidoConversa, string> = {
    confirmar: 'Pedido confirmado',
    entregar: 'Pedido entregue',
    recusar: 'Pedido não aceito',
  };

  ngOnInit(): void {
    // o aviso "Pedido para fechar" abre aqui: a bolinha dos pedidos no ícone do app some
    void limparMarcaIcone('pedido');
    this.conversaService
      .abrir()
      .catch((erro: unknown) => this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR)));
  }

  protected mudarAba(aba: AbaChats): void {
    this.abaAtual.set(aba);
  }

  protected async marcarComoResolvida(conversa: Conversa): Promise<void> {
    this.resolvendoId.set(conversa.id);
    try {
      await this.conversaService.marcarComoResolvida(conversa.id);
      this.toastService.mostrar(`Conversa de ${this.nomeExibicao(conversa)} marcada como resolvida`);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível atualizar a conversa. Tente de novo.'));
    } finally {
      this.resolvendoId.set(null);
    }
  }

  /** HUMANO_ATIVO: o dono respondeu pelo celular; EM_PEDIDO: o pedido está em preparo. Nos dois o assistente fica quieto. */
  protected textoStatus(conversa: Conversa): string {
    if (conversa.status === 'EM_PEDIDO') {
      return 'Pedido em preparo';
    }
    return conversa.status === 'HUMANO_ATIVO' ? 'Você está atendendo' : 'Assistente atendendo';
  }

  protected nomeExibicao(conversa: Conversa): string {
    return conversa.nomeCliente || conversa.whatsapp;
  }
}
