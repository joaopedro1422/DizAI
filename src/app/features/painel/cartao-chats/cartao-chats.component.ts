import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SessaoService } from '../../../core/auth/sessao.service';
import { MOTIVOS_ESPERA } from '../../../core/constants/opcoes-conversa';
import { ConversaService } from '../../../core/services/conversa.service';
import { pluralizar } from '../../../core/utils/colecao.utils';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

/** Card de destaque "Chats" (grupo "Seu assistente" da tela inicial), com a conversa que espera o dono. */
@Component({
  selector: 'app-cartao-chats',
  imports: [RouterLink, IconeComponent, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cartao-chats.component.html',
  styleUrl: './cartao-chats.component.css',
})
export class CartaoChatsComponent {
  private readonly conversaService = inject(ConversaService);
  protected readonly rotas = inject(SessaoService).rotasDoPainel;

  protected readonly quantidadeAguardando = computed(() => this.conversaService.aguardandoDono().length);

  protected readonly resumoChats = computed(() => {
    const total = this.conversaService.totalConversas();
    return total === 0 ? 'Nenhuma conversa ainda' : pluralizar(total, 'conversa', 'conversas');
  });

  /** Conversa mais recente esperando o dono, mostrada como prévia no card. */
  protected readonly conversaMaisUrgente = computed(() => {
    const conversa = this.conversaService.aguardandoDono()[0];
    if (!conversa) {
      return null;
    }
    return {
      nome: conversa.nomeCliente || conversa.whatsapp,
      motivo: conversa.motivoEspera ? MOTIVOS_ESPERA[conversa.motivoEspera].rotulo.toLowerCase() : '',
      mensagem: conversa.ultimaMensagem,
    };
  });
}
