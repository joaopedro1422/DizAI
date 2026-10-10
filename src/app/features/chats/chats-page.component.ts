import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../core/api/erro-api';
import { Conversa } from '../../core/models/conversa.model';
import { ConversaService } from '../../core/services/conversa.service';
import { ToastService } from '../../core/services/toast.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { CabecalhoPaginaComponent } from '../../shared/components/cabecalho-pagina/cabecalho-pagina.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { EstadoVazioComponent } from '../../shared/components/estado-vazio/estado-vazio.component';
import { TempoDecorridoPipe } from '../../shared/pipes/tempo-decorrido.pipe';
import { ConversaAguardandoCardComponent } from './conversa-aguardando-card/conversa-aguardando-card.component';

type AbaChats = 'aguardando' | 'andamento';

@Component({
  selector: 'app-chats-page',
  imports: [
    CabecalhoPaginaComponent,
    EstadoVazioComponent,
    AvatarComponent,
    TempoDecorridoPipe,
    ConversaAguardandoCardComponent,
    CarregandoComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chats-page.component.html',
  styleUrls: ['../../shared/estilos-listagem.css', './chats-page.component.css'],
})
export class ChatsPageComponent implements OnInit {
  private readonly conversaService = inject(ConversaService);
  private readonly toastService = inject(ToastService);

  protected readonly aguardandoDono = this.conversaService.aguardandoDono;
  protected readonly emAndamento = this.conversaService.emAndamento;
  protected readonly abaAtual = signal<AbaChats>('aguardando');
  protected readonly carregando = this.conversaService.carregando;
  /** Conversa sendo marcada como resolvida (mostra o carregando no botão). */
  protected readonly resolvendoId = signal<string | null>(null);

  ngOnInit(): void {
    this.conversaService
      .carregar()
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

  /** HUMANO_ATIVO: o dono respondeu pelo celular, então o assistente fica quieto nessa conversa. */
  protected textoStatus(conversa: Conversa): string {
    return conversa.status === 'HUMANO_ATIVO' ? 'Você está atendendo' : 'Assistente atendendo';
  }

  protected nomeExibicao(conversa: Conversa): string {
    return conversa.nomeCliente || conversa.whatsapp;
  }
}
