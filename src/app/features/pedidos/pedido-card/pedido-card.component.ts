import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { Pedido } from '../../../core/models/pedido.model';
import { gerarLinkWhatsapp } from '../../../core/utils/texto.utils';
import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { ItemMenuAcoes, MenuAcoesComponent } from '../../../shared/components/menu-acoes/menu-acoes.component';
import { TempoDecorridoPipe } from '../../../shared/pipes/tempo-decorrido.pipe';
import { formatarReal } from '../textos-pedido';

/** O que o lojista pode fazer com um pedido em andamento. */
export type AcaoPedido = 'pronto' | 'entregue' | 'cancelar' | 'valor';

/**
 * Pedido em andamento: quem pediu, o que pediu (o resumo do assistente, sem estrutura fixa), o valor e as ações.
 * "Pronto" avisa o cliente e mantém o pedido na lista; "Entregue" tira da lista e devolve a conversa ao assistente.
 */
@Component({
  selector: 'app-pedido-card',
  imports: [IconeComponent, MenuAcoesComponent, TempoDecorridoPipe, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pedido-card.component.html',
  styleUrl: './pedido-card.component.css',
})
export class PedidoCardComponent {
  readonly pedido = input.required<Pedido>();
  readonly acao = output<AcaoPedido>();

  protected readonly itensMenu: ItemMenuAcoes<AcaoPedido>[] = [
    { id: 'valor', rotulo: 'Editar valor', icone: 'editar' },
    { id: 'cancelar', rotulo: 'Cancelar pedido', icone: 'lixeira', perigo: true },
  ];

  protected readonly nome = computed(() => this.pedido().nomeCliente || this.pedido().whatsapp || 'Cliente');
  protected readonly pronto = computed(() => this.pedido().status === 'PRONTO');
  protected readonly valor = computed(() => formatarReal(this.pedido().valor));
  /** Sinal já pago (só informação: o faturamento usa o valor inteiro). */
  protected readonly pago = computed(() => {
    const pago = this.pedido().valorPago;
    return pago ? formatarReal(pago) : null;
  });
  protected readonly linkWhatsapp = computed(() =>
    this.pedido().whatsapp ? gerarLinkWhatsapp(this.pedido().whatsapp) : null,
  );
  /** O nome já está no topo e o valor no rodapé: o resto do resumo é o pedido em si. */
  protected readonly itens = computed(() =>
    this.pedido().resumo.filter((item) => {
      const campo = item.campo.trim().toLowerCase();
      return !campo.startsWith('nome') && !campo.startsWith('total');
    }),
  );
}
