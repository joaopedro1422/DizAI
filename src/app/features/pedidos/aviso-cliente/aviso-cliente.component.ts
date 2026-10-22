import { ChangeDetectionStrategy, Component, OnInit, inject, input, model } from '@angular/core';

import { MensagemPronta } from '../../../core/models/agenda.model';
import { PedidoService } from '../../../core/services/pedido.service';
import { preencherAviso } from '../textos-pedido';

/**
 * "Avisar o cliente pelo WhatsApp" nas ações do pedido (pronto, entregue): liga/desliga, o texto já preenchido e as
 * mensagens prontas dos pedidos com um toque. O texto que fica no campo é o que vai, já com o nome trocado.
 */
@Component({
  selector: 'app-aviso-cliente',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aviso-cliente.component.html',
  styleUrl: './aviso-cliente.component.css',
})
export class AvisoClienteComponent implements OnInit {
  /** Ex.: "Avisar o cliente que está pronto". */
  readonly rotulo = input.required<string>();
  readonly textoPadrao = input.required<string>();
  readonly nomeCliente = input('');
  readonly valor = input<number | null>(null);
  readonly enviar = model(true);
  readonly texto = model('');

  private readonly pedidoService = inject(PedidoService);
  protected readonly mensagens = this.pedidoService.mensagensProntas;

  ngOnInit(): void {
    this.texto.set(this.preencher(this.textoPadrao()));
    if (this.mensagens().length === 0) {
      this.pedidoService.carregarMensagensProntas().catch(() => undefined);   // sem elas, segue com o texto padrão
    }
  }

  protected usar(mensagem: MensagemPronta | null): void {
    this.texto.set(this.preencher(mensagem ? mensagem.texto : this.textoPadrao()));
    this.enviar.set(true);
  }

  protected digitar(evento: Event): void {
    this.texto.set((evento.target as HTMLTextAreaElement).value);
  }

  protected alternar(evento: Event): void {
    this.enviar.set((evento.target as HTMLInputElement).checked);
  }

  private preencher(texto: string): string {
    return preencherAviso(texto, this.nomeCliente(), this.valor());
  }
}
