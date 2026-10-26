import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';

import { mensagemDoErro } from '../../../core/api/erro-api';
import { Pedido, SituacaoAviso, primeiroNome } from '../../../core/models/pedido.model';
import { PedidoService } from '../../../core/services/pedido.service';
import { ToastService } from '../../../core/services/toast.service';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { AvisoClienteComponent } from '../aviso-cliente/aviso-cliente.component';
import { AcaoPedido } from '../pedido-card/pedido-card.component';
import { AGRADECIMENTO_PADRAO, AVISO_PRONTO_PADRAO, formatarReal, lerValorPago } from '../textos-pedido';

const PADRAO_VALOR = /^\d{1,7}([.,]\d{1,2})?$/;

/** Conteúdo do modal de cada ação da tela de pedidos: pronto, entregue, cancelar ou editar o valor. */
@Component({
  selector: 'app-acao-pedido',
  imports: [CarregandoComponent, AvisoClienteComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './acao-pedido.component.html',
  styleUrl: './acao-pedido.component.css',
})
export class AcaoPedidoComponent {
  readonly pedido = input.required<Pedido>();
  readonly acao = input.required<AcaoPedido>();
  readonly concluido = output<void>();

  private readonly pedidoService = inject(PedidoService);
  private readonly toastService = inject(ToastService);

  protected readonly avisoPronto = AVISO_PRONTO_PADRAO;
  protected readonly agradecimento = AGRADECIMENTO_PADRAO;
  protected readonly salvando = signal(false);
  protected readonly avisar = signal(true);
  protected readonly textoAviso = signal('');
  protected readonly valorDigitado = signal<string | null>(null);
  protected readonly tentouSalvar = signal(false);

  protected readonly nome = computed(() => primeiroNome(this.pedido().nomeCliente) || 'o cliente');
  protected readonly valorAtual = computed(() => formatarReal(this.pedido().valor));
  protected readonly valorTexto = computed(
    () => this.valorDigitado() ?? this.pedido().valor.toFixed(2).replace('.', ','),
  );
  protected readonly novoValor = computed(() => {
    const texto = this.valorTexto().trim();
    return PADRAO_VALOR.test(texto) ? Number(texto.replace(',', '.')) : null;
  });
  protected readonly erroValor = computed(() => this.tentouSalvar() && this.novoValor() === null);
  /** "Já pago" (sinal): vem com o que já estava no pedido; vazio = nada pago. */
  protected readonly pagoDigitado = signal<string | null>(null);
  protected readonly pagoTexto = computed(() => {
    const salvo = this.pedido().valorPago;
    return this.pagoDigitado() ?? (salvo ? salvo.toFixed(2).replace('.', ',') : '');
  });
  private readonly pago = computed(() => lerValorPago(this.pagoTexto(), this.novoValor()));
  protected readonly erroPago = computed(() => this.pago().erro);

  protected digitarValor(evento: Event): void {
    this.valorDigitado.set((evento.target as HTMLInputElement).value);
  }

  protected async confirmar(): Promise<void> {
    if (this.salvando()) {
      return;
    }
    this.tentouSalvar.set(true);
    const id = this.pedido().id;
    const mensagem = this.avisar() ? this.textoAviso().trim() || null : null;
    this.salvando.set(true);
    try {
      switch (this.acao()) {
        case 'pronto':
          this.avisarResultado((await this.pedidoService.marcarPronto(id, mensagem)).aviso, 'Pedido marcado como pronto');
          break;
        case 'entregue':
          this.avisarResultado(
            (await this.pedidoService.marcarEntregue(id, mensagem)).aviso,
            `Pedido entregue: o assistente voltou a atender ${this.nome()}`,
          );
          break;
        case 'cancelar':
          await this.pedidoService.cancelar(id);
          this.toastService.mostrar('Pedido cancelado');
          break;
        case 'valor': {
          const valor = this.novoValor();
          if (valor === null || this.erroPago()) {
            return;
          }
          await this.pedidoService.atualizarValor(id, valor, this.pago().pago);
          this.toastService.mostrar('Valor atualizado');
          break;
        }
      }
      this.concluido.emit();
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível atualizar o pedido. Tente de novo.'));
    } finally {
      this.salvando.set(false);
    }
  }

  private avisarResultado(aviso: SituacaoAviso, sucesso: string): void {
    this.toastService.mostrar(
      aviso === 'NAO_ENVIADO'
        ? 'Pedido atualizado, mas o WhatsApp não aceitou o aviso (passou de 24 h da última mensagem do cliente). Avise pelo botão do WhatsApp no card.'
        : sucesso,
    );
  }
}
