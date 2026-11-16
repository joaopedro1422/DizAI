import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';

import { mensagemDoErro } from '../../../core/api/erro-api';
import { PedidoService } from '../../../core/services/pedido.service';
import { ConteudoRamoService } from '../../../core/services/conteudo-ramo.service';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { ClienteDoRegistro, SeletorClienteComponent } from '../../../shared/components/seletor-cliente/seletor-cliente.component';
import { CarrinhoProdutosComponent, ItemCarrinho } from '../carrinho-produtos/carrinho-produtos.component';
import { SeletorDataPedidoComponent } from '../seletor-data-pedido/seletor-data-pedido.component';
import { AnexoPedidoComponent } from '../anexo-pedido/anexo-pedido.component';
import { hojeIso } from '../../../core/utils/datas-agenda';

/** Aceita "70", "70,5" ou "70.50". */
const PADRAO_VALOR = /^\d{1,7}([.,]\d{1,2})?$/;

@Component({
  selector: 'app-registrar-pedido',
  imports: [CarregandoComponent, CarrinhoProdutosComponent, SeletorClienteComponent, SeletorDataPedidoComponent, AnexoPedidoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="formulario" (submit)="$event.preventDefault(); registrar()" novalidate>
      <div class="campo">
        <span class="campo__rotulo">Produtos <span class="campo__rotulo-opcional">(opcional)</span></span>
        <app-carrinho-produtos [itens]="produtos()" (mudou)="produtos.set($event)" />
        <span class="campo__dica">Informe o produto ou apenas descreva abaixo.</span>
      </div>

      <div class="campo">
        <label for="pedido-itens" class="campo__rotulo">Descrição dos itens</label>
        <textarea
          id="pedido-itens"
          class="campo__entrada"
          rows="3"
          maxlength="500"
          [placeholder]="conteudo().itensPedidoManual"
          [value]="itens()"
          (input)="itens.set($any($event.target).value)"
        ></textarea>
        @if (tentou() && !itens().trim()) {
          <span class="campo__erro" role="alert">Escreva os itens do pedido.</span>
        }
      </div>

      <div class="campo">
        <label for="pedido-valor" class="campo__rotulo">Valor do pedido</label>
        <span class="campo-prefixado" [class.campo-prefixado--erro]="tentou() && !valorValido()">
          <span class="campo-prefixado__prefixo">R$</span>
          <input id="pedido-valor" type="text" inputmode="decimal" placeholder="0,00" [value]="valor()" (input)="valor.set($any($event.target).value)">
        </span>
        @if (tentou() && !valorValido()) {
          <span class="campo__erro" role="alert">Informe o valor, por exemplo 150 ou 150,50.</span>
        }
      </div>

      <div class="campo">
        <span class="campo__rotulo">Foto do modelo <span class="campo__rotulo-opcional">(opcional)</span></span>
        <app-anexo-pedido [(anexo)]="anexo" [(enviando)]="enviandoAnexo" />
        <span class="campo__dica">Ex.: {{ conteudo().anexoPedido }}. Ela fica no pedido, na tela Pedidos.</span>
      </div>

      <div class="campo">
        <span class="campo__rotulo">Cliente <span class="campo__rotulo-opcional">(opcional)</span></span>
        <app-seletor-cliente dica="Com o número, você pode avisar o cliente quando o pedido ficar pronto." (mudou)="cliente.set($event)" />
      </div>

      @if (!entregue()) {
        <div class="campo">
          <span class="campo__rotulo">Para quando é o pedido?</span>
          <app-seletor-data-pedido [(valor)]="paraQuando" [erro]="tentou() && !paraQuando()" />
          @if (tentou() && !paraQuando()) {
            <span class="campo__erro" role="alert">Escolha o dia do pedido.</span>
          }
        </div>
      }

      <label class="entregue">
        <input type="checkbox" [checked]="entregue()" (change)="entregue.set($any($event.target).checked)">
        <span>
          <strong>Já foi entregue</strong>
          <span class="entregue__dica">Venda feita na hora: entra direto como entregue, sem passar por "Em preparo".</span>
        </span>
      </label>

      @if (erro()) {
        <span class="campo__erro" role="alert">{{ erro() }}</span>
      }

      <button type="submit" class="btn btn--primario btn--grande btn--bloco" [disabled]="salvando() || enviandoAnexo()" [attr.aria-busy]="salvando()">
        @if (salvando()) {
          <app-carregando modo="inline" variante="claro" [tamanho]="20" />
          Registrando…
        } @else {
          Registrar pedido
        }
      </button>
    </form>
  `,
  styles: `
    .formulario {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .entregue {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 14px;
      border: 1.5px solid var(--cor-borda-suave);
      border-radius: 14px;
      cursor: pointer;
    }

    .entregue input {
      width: 18px;
      height: 18px;
      margin-top: 2px;
      accent-color: var(--cor-primaria);
    }

    .entregue > span {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 14px;
    }

    .entregue__dica {
      font-size: 12.5px;
      color: var(--cor-texto-suave);
    }
  `,
})
export class RegistrarPedidoComponent {
  private readonly pedidoService = inject(PedidoService);
  /** Exemplo dos itens com a cara do negócio. */
  protected readonly conteudo = inject(ConteudoRamoService).conteudo;

  readonly registrado = output<{ entregue: boolean }>();

  protected readonly itens = signal('');
  protected readonly valor = signal('');
  /** Escolhido da lista de Clientes ou novo (nome e WhatsApp digitados). */
  protected readonly cliente = signal<ClienteDoRegistro>({ nome: '', whatsapp: '', id: null });
  protected readonly entregue = signal(false);
  /** O dia da entrega ou retirada ("AAAA-MM-DD"); com "Já foi entregue", hoje. */
  protected readonly paraQuando = signal<string | null>(null);
  /** A foto do modelo (já enviada ao armazenamento: aqui fica a referência). */
  protected readonly anexo = signal<string | null>(null);
  protected readonly enviandoAnexo = signal(false);
  /** O carrinho do pedido (só para os Números). */
  protected readonly produtos = signal<ItemCarrinho[]>([]);
  protected readonly salvando = signal(false);
  protected readonly tentou = signal(false);
  protected readonly erro = signal('');

  protected readonly valorValido = computed(() => PADRAO_VALOR.test(this.valor().trim()));

  protected async registrar(): Promise<void> {
    if (this.salvando() || this.enviandoAnexo()) return;
    this.tentou.set(true);
    this.erro.set('');
    if (!this.itens().trim() || !this.valorValido() || (!this.entregue() && !this.paraQuando())) return;
    this.salvando.set(true);
    try {
      await this.pedidoService.registrarManual({
        itens: this.itens().trim(),
        valor: Number(this.valor().trim().replace(',', '.')),
        whatsapp: this.cliente().whatsapp.trim(),
        nomeCliente: this.cliente().nome.trim(),
        entregue: this.entregue(),
        paraQuando: this.entregue() ? hojeIso() : this.paraQuando()!,
        anexo: this.anexo(),
        produtoId: null,
        produtos: this.produtos(),
      });
      this.registrado.emit({ entregue: this.entregue() });
    } catch (erro) {
      this.erro.set(mensagemDoErro(erro, 'Não foi possível registrar o pedido. Tente de novo.'));
    } finally {
      this.salvando.set(false);
    }
  }
}
