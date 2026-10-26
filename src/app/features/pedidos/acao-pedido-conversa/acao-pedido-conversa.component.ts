import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';

import { mensagemDoErro } from '../../../core/api/erro-api';
import { Conversa } from '../../../core/models/conversa.model';
import { SituacaoAviso, primeiroNome, totalDoResumo } from '../../../core/models/pedido.model';
import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { ArmazenamentoFotosService } from '../../../core/services/armazenamento-fotos.service';
import { ConversaService } from '../../../core/services/conversa.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { ToastService } from '../../../core/services/toast.service';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { AvisoClienteComponent } from '../aviso-cliente/aviso-cliente.component';
import { SeletorProdutoComponent } from '../seletor-produto/seletor-produto.component';
import { AGRADECIMENTO_PADRAO, lerValorPago } from '../textos-pedido';

/** confirmar: vai para a tela Pedidos; entregar: já entra no faturamento; recusar: só devolve ao assistente. */
export type AcaoPedidoConversa = 'confirmar' | 'entregar' | 'recusar';

const PADRAO_VALOR = /^\d{1,7}([.,]\d{1,2})?$/;
const TAMANHO_MAXIMO_ANEXO_BYTES = 5 * 1024 * 1024;

/**
 * Conteúdo do modal das ações de pedido no card da conversa ("Aguardando você"). O valor vem preenchido com o total
 * que o assistente calculou; é o que o lojista confirmar aqui que entra no faturamento.
 */
@Component({
  selector: 'app-acao-pedido-conversa',
  imports: [CarregandoComponent, AvisoClienteComponent, IconeComponent, UrlImagemPipe, SeletorProdutoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './acao-pedido-conversa.component.html',
  styleUrl: './acao-pedido-conversa.component.css',
})
export class AcaoPedidoConversaComponent {
  readonly conversa = input.required<Conversa>();
  readonly acao = input.required<AcaoPedidoConversa>();
  readonly concluido = output<void>();

  private readonly pedidoService = inject(PedidoService);
  private readonly conversaService = inject(ConversaService);
  private readonly toastService = inject(ToastService);
  private readonly armazenamento = inject(ArmazenamentoFotosService);

  protected readonly agradecimentoPadrao = AGRADECIMENTO_PADRAO;
  protected readonly salvando = signal(false);
  protected readonly tentouSalvar = signal(false);
  protected readonly valorDigitado = signal<string | null>(null);
  protected readonly avisar = signal(true);
  protected readonly textoAviso = signal('');
  /** Foto do modelo (opcional, só ao confirmar): já enviada ao armazenamento, aqui fica a referência. */
  protected readonly anexo = signal<string | null>(null);
  protected readonly enviandoAnexo = signal(false);
  /** O produto vendido (opcional): só para os "Produtos que mais vendem" dos Números. */
  protected readonly produtoId = signal<number | null>(null);

  protected readonly nome = computed(() => {
    const doResumo = this.conversa().resumoPedido.find((item) => item.campo.trim().toLowerCase().startsWith('nome'));
    return doResumo?.valor || this.conversa().nomeCliente || '';
  });
  protected readonly primeiroNome = computed(() => primeiroNome(this.nome()) || 'o cliente');
  /** O que está no campo: o que o lojista digitou ou, de início, o total do resumo. */
  protected readonly valorTexto = computed(() => {
    const digitado = this.valorDigitado();
    if (digitado !== null) {
      return digitado;
    }
    const total = totalDoResumo(this.conversa().resumoPedido);
    return total === null ? '' : total.toFixed(2).replace('.', ',');
  });
  protected readonly valor = computed(() => {
    const texto = this.valorTexto().trim();
    return PADRAO_VALOR.test(texto) ? Number(texto.replace(',', '.')) : null;
  });
  protected readonly erroValor = computed(() => this.acao() !== 'recusar' && this.tentouSalvar() && this.valor() === null);
  /** "Já pago" (só ao confirmar): o sinal que o cliente já pagou. Não entra no faturamento. */
  protected readonly pagoTexto = signal('');
  private readonly pago = computed(() => lerValorPago(this.pagoTexto(), this.valor()));
  protected readonly erroPago = computed(() => (this.acao() === 'confirmar' ? this.pago().erro : ''));

  /** Envia a imagem escolhida na hora: no "Confirmar pedido" só vai a referência. */
  protected async aoEscolherAnexo(evento: Event): Promise<void> {
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
    if (arquivo.size > TAMANHO_MAXIMO_ANEXO_BYTES) {
      this.toastService.mostrar('A imagem é muito grande. Use uma de até 5 MB.');
      return;
    }
    this.enviandoAnexo.set(true);
    try {
      const [referencia] = await this.armazenamento.enviar([arquivo], { tipo: 'PEDIDOS' });
      this.anexo.set(referencia);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível enviar a imagem. Tente de novo.'));
    } finally {
      this.enviandoAnexo.set(false);
    }
  }

  protected digitarValor(evento: Event): void {
    this.valorDigitado.set((evento.target as HTMLInputElement).value);
  }

  protected async confirmar(): Promise<void> {
    if (this.salvando() || this.enviandoAnexo()) {
      return;
    }
    this.tentouSalvar.set(true);
    const acao = this.acao();
    const valor = this.valor();
    if (acao !== 'recusar' && (valor === null || this.erroPago())) {
      return;
    }
    this.salvando.set(true);
    try {
      if (acao === 'recusar') {
        await this.conversaService.marcarComoResolvida(this.conversa().id);
        this.toastService.mostrar(`O assistente voltou a atender ${this.primeiroNome()}`);
      } else {
        const entregue = acao === 'entregar';
        const mensagem = entregue && this.avisar() ? this.textoAviso().trim() || null : null;
        const anexo = entregue ? null : this.anexo();
        const resultado = await this.pedidoService.criarDaConversa(
          this.conversa().id,
          entregue,
          valor!,
          mensagem,
          anexo,
          this.produtoId(),
          entregue ? null : this.pago().pago,
        );
        this.toastService.mostrar(this.textoSucesso(entregue, resultado.aviso));
      }
      this.concluido.emit();
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível atualizar o pedido. Tente de novo.'));
    } finally {
      this.salvando.set(false);
    }
  }

  private textoSucesso(entregue: boolean, aviso: SituacaoAviso): string {
    if (aviso === 'NAO_ENVIADO') {
      return 'Pedido salvo, mas o WhatsApp não aceitou o aviso (passou de 24 h da última mensagem do cliente). Avise pelo "Ir ao WhatsApp".';
    }
    return entregue ? 'Pedido entregue e o assistente voltou a atender' : 'Pedido confirmado: ele está na tela Pedidos';
  }
}
