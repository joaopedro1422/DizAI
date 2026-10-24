import { ChangeDetectionStrategy, Component, OnInit, computed, inject, output, signal } from '@angular/core';

import { mensagemDoErro } from '../../../core/api/erro-api';
import { Cliente } from '../../../core/models/cliente.model';
import { ClienteService } from '../../../core/services/cliente.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

/** Aceita "70", "70,5" ou "70.50". */
const PADRAO_VALOR = /^\d{1,7}([.,]\d{1,2})?$/;

/**
 * O mesmo cliente com ou sem o 9º dígito e com ou sem o 55: só dígitos, com o 55 na frente quando é um número do
 * Brasil digitado com DDD, e sem o 9 depois do DDD (como o Telefone.chave do backend).
 */
function chaveDoNumero(texto: string): string {
  let digitos = texto.replace(/\D/g, '').replace(/^0+/, '');
  if (digitos.length === 10 || digitos.length === 11) digitos = '55' + digitos;
  if (digitos.length === 13 && digitos.startsWith('55') && digitos[4] === '9') {
    digitos = digitos.slice(0, 4) + digitos.slice(5);
  }
  return digitos;
}

/**
 * "Registrar pedido" (tela Pedidos): pedido que chegou fora do assistente. Itens em texto livre, o valor (é o que
 * entra nos Números), o WhatsApp e o nome (opcionais). Ao digitar o número de um cliente que já existe (conversou,
 * pediu…), o nome vem preenchido sozinho.
 */
@Component({
  selector: 'app-registrar-pedido',
  imports: [IconeComponent, CarregandoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="formulario" (submit)="$event.preventDefault(); registrar()" novalidate>
      <div class="campo">
        <label for="pedido-itens" class="campo__rotulo">Itens do pedido</label>
        <textarea
          id="pedido-itens"
          class="campo__entrada"
          rows="3"
          maxlength="500"
          placeholder="Ex.: 50 coxinhas, 50 pastéis e 50 churros"
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
        } @else {
          <span class="campo__dica">É este valor que entra nos números dos pedidos.</span>
        }
      </div>

      <div class="campo">
        <label for="pedido-whatsapp" class="campo__rotulo">WhatsApp do cliente <span class="campo__rotulo-opcional">(opcional)</span></label>
        <input
          id="pedido-whatsapp"
          class="campo__entrada"
          type="tel"
          inputmode="tel"
          autocomplete="off"
          placeholder="(83) 99999-0000"
          [value]="whatsapp()"
          (input)="digitarNumero($any($event.target).value)"
        >
        @if (clienteEncontrado(); as cliente) {
          <span class="encontrado">
            <app-icone nome="check" [tamanho]="13" [espessura]="3" />
            Cliente já cadastrado: <strong>{{ cliente.nome }}</strong>
          </span>
        } @else {
          <span class="campo__dica">Com o número, você pode avisar o cliente quando o pedido ficar pronto.</span>
        }
      </div>

      <div class="campo">
        <label for="pedido-nome" class="campo__rotulo">Nome do cliente <span class="campo__rotulo-opcional">(opcional)</span></label>
        <input
          id="pedido-nome"
          class="campo__entrada"
          type="text"
          maxlength="100"
          placeholder="Ex.: Maria Souza"
          [value]="nome()"
          (input)="nome.set($any($event.target).value)"
        >
      </div>

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

      <button type="submit" class="btn btn--primario btn--grande btn--bloco" [disabled]="salvando()" [attr.aria-busy]="salvando()">
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

    .encontrado {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--cor-ativo);
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
export class RegistrarPedidoComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly clienteService = inject(ClienteService);

  readonly registrado = output<{ entregue: boolean }>();

  protected readonly itens = signal('');
  protected readonly valor = signal('');
  protected readonly whatsapp = signal('');
  protected readonly nome = signal('');
  protected readonly entregue = signal(false);
  protected readonly salvando = signal(false);
  protected readonly tentou = signal(false);
  protected readonly erro = signal('');

  protected readonly valorValido = computed(() => PADRAO_VALOR.test(this.valor().trim()));

  /** O cliente com este número (com DDD completo), entre os que já conversaram ou pediram. */
  protected readonly clienteEncontrado = computed<Cliente | null>(() => {
    const chave = chaveDoNumero(this.whatsapp());
    if (chave.length < 12) return null;
    return this.clienteService.clientes().find((c) => c.numero && chaveDoNumero(c.numero) === chave) ?? null;
  });
  /** Último nome preenchido sozinho: se o lojista não mexeu nele, troca quando o número muda. */
  private nomeAutomatico = '';

  ngOnInit(): void {
    // a lista de clientes alimenta o "Cliente já cadastrado"; se falhar, o lojista só digita o nome
    this.clienteService.carregar().catch(() => undefined);
  }

  protected digitarNumero(valor: string): void {
    this.whatsapp.set(valor);
    const cliente = this.clienteEncontrado();
    if (cliente && (!this.nome().trim() || this.nome() === this.nomeAutomatico)) {
      this.nome.set(cliente.nome);
      this.nomeAutomatico = cliente.nome;
    } else if (!cliente && this.nome() === this.nomeAutomatico) {
      this.nome.set('');
      this.nomeAutomatico = '';
    }
  }

  protected async registrar(): Promise<void> {
    if (this.salvando()) return;
    this.tentou.set(true);
    this.erro.set('');
    if (!this.itens().trim() || !this.valorValido()) return;
    this.salvando.set(true);
    try {
      await this.pedidoService.registrarManual({
        itens: this.itens().trim(),
        valor: Number(this.valor().trim().replace(',', '.')),
        whatsapp: this.whatsapp().trim(),
        nomeCliente: this.nome().trim(),
        entregue: this.entregue(),
      });
      this.registrado.emit({ entregue: this.entregue() });
    } catch (erro) {
      this.erro.set(mensagemDoErro(erro, 'Não foi possível registrar o pedido. Tente de novo.'));
    } finally {
      this.salvando.set(false);
    }
  }
}
