import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { MOTIVOS_ESPERA } from '../../../core/constants/opcoes-conversa';
import { Conversa } from '../../../core/models/conversa.model';
import { ramoDeServico } from '../../../core/models/perfil.model';
import { PerfilService } from '../../../core/services/perfil.service';
import { gerarLinkWhatsapp } from '../../../core/utils/texto.utils';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { TempoDecorridoPipe } from '../../../shared/pipes/tempo-decorrido.pipe';
import { AcaoPedidoConversa } from '../../pedidos/acao-pedido-conversa/acao-pedido-conversa.component';

/** Conversa que precisa do dono: motivo, última mensagem e resumo do pedido. */
@Component({
  selector: 'app-conversa-aguardando-card',
  imports: [AvatarComponent, IconeComponent, TempoDecorridoPipe, CarregandoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './conversa-aguardando-card.component.html',
  styleUrl: './conversa-aguardando-card.component.css',
})
export class ConversaAguardandoCardComponent {
  readonly conversa = input.required<Conversa>();
  readonly resolvendo = input(false);
  readonly resolvida = output<void>();
  /** Pedido de loja de produtos: confirmar, entregar ou recusar (no lugar do "Resolvido"). */
  readonly acaoPedido = output<AcaoPedidoConversa>();

  /** O nome vem do perfil do WhatsApp e pode estar vazio: nesse caso mostramos o número. */
  private readonly perfil = inject(PerfilService).perfil;
  /** Serviços falam em atendimento; produtos, em pedido. */
  protected readonly tituloResumo = computed(() =>
    ramoDeServico(this.perfil().ramo) ? 'Resumo do atendimento' : 'Resumo do pedido',
  );

  protected readonly nomeExibicao = computed(() => this.conversa().nomeCliente || this.conversa().whatsapp);
  protected readonly mostrarTelefone = computed(() => !!this.conversa().nomeCliente);
  protected readonly linkWhatsapp = computed(() => gerarLinkWhatsapp(this.conversa().whatsapp));

  /** Lojas de produtos com o pedido pronto para fechar ganham os botões do pedido. */
  protected readonly ehPedido = computed(
    () => this.conversa().motivoEspera === 'PRONTO_PARA_FECHAR' && !ramoDeServico(this.perfil().ramo),
  );

  /** Conversa passada por uma pergunta: o card mostra só o assunto, sem resumo de pedido nem os botões do pedido. */
  protected readonly duvida = computed(() =>
    this.conversa().motivoEspera === 'DUVIDA' ? (this.conversa().resumoPedido[0]?.valor ?? '') : null,
  );

  protected readonly motivo = computed(() => {
    const motivoEspera = this.conversa().motivoEspera;
    return motivoEspera ? MOTIVOS_ESPERA[motivoEspera] : null;
  });
}
