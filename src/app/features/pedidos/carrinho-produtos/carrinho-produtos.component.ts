import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { ProdutoService } from '../../../core/services/produto.service';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { SeletorProdutoComponent } from '../seletor-produto/seletor-produto.component';

/** Um produto do carrinho do pedido. */
export interface ItemCarrinho {
  produtoId: number;
  quantidade: number;
}

const MAXIMO_ITENS = 30;
const MAXIMO_QUANTIDADE = 99999;

/**
 * "Produtos vendidos" do pedido, como um carrinho: quantos produtos quiser, cada um com a quantidade (− e +, ou digitada).
 * O seletor de produto embaixo adiciona (escolher um que já está no carrinho soma 1). Só para os Números.
 */
@Component({
  selector: 'app-carrinho-produtos',
  imports: [IconeComponent, UrlImagemPipe, SeletorProdutoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (linhas().length > 0) {
      <ul class="carrinho" aria-label="Produtos do pedido">
        @for (linha of linhas(); track linha.produtoId) {
          <li class="item">
            @if (linha.foto) {
              <img class="item__foto" [src]="linha.foto | urlImagem" alt="">
            } @else {
              <span class="item__foto item__foto--vazia" aria-hidden="true"><app-icone nome="caixa" [tamanho]="16" /></span>
            }
            <span class="item__nome">{{ linha.nome }}</span>
            <span class="qtd" role="group" [attr.aria-label]="'Quantidade de ' + linha.nome">
              <button type="button" class="qtd__botao" aria-label="Menos um" (click)="mudar(linha.produtoId, linha.quantidade - 1)">
                <app-icone [nome]="linha.quantidade === 1 ? 'lixeira' : 'menos'" [tamanho]="15" [espessura]="2.2" />
              </button>
              <input
                class="qtd__valor"
                type="text"
                inputmode="numeric"
                [attr.aria-label]="'Quantidade de ' + linha.nome"
                [value]="linha.quantidade"
                (change)="digitar(linha.produtoId, $any($event.target))"
              />
              <button type="button" class="qtd__botao" aria-label="Mais um" (click)="mudar(linha.produtoId, linha.quantidade + 1)">
                <app-icone nome="mais" [tamanho]="15" [espessura]="2.2" />
              </button>
            </span>
          </li>
        }
      </ul>
    }
    @if (itens().length < maximo) {
      <app-seletor-produto
        [valor]="null"
        [rotuloVazio]="itens().length ? 'Adicionar outro produto' : 'Adicionar produto'"
        (escolher)="adicionar($event)"
      />
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .carrinho {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 8px 8px 10px;
      border: 1px solid var(--cor-borda-suave);
      border-radius: var(--raio-medio);
      background: var(--cor-fundo);
    }

    .item__foto {
      width: 36px;
      height: 36px;
      flex: none;
      border-radius: 10px;
      object-fit: cover;
    }

    .item__foto--vazia {
      display: grid;
      place-items: center;
      background: var(--cor-fundo-suave);
      color: var(--cor-texto-suave);
    }

    .item__nome {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      color: var(--cor-texto);
      font-size: 14.5px;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .qtd {
      display: flex;
      align-items: center;
      flex: none;
      border: 1px solid var(--cor-borda);
      border-radius: var(--raio-pilula);
      background: var(--cor-fundo);
    }

    .qtd__botao {
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: var(--cor-noite);
      cursor: pointer;
    }

    .qtd__botao:hover {
      background: var(--cor-fundo-suave);
    }

    .qtd__valor {
      width: 44px;
      border: 0;
      background: transparent;
      color: var(--cor-noite);
      font-family: var(--fonte-numero);
      font-size: 15px;
      font-weight: 600;
      text-align: center;
    }
  `,
})
export class CarrinhoProdutosComponent {
  private readonly produtoService = inject(ProdutoService);

  readonly itens = input<ItemCarrinho[]>([]);
  readonly mudou = output<ItemCarrinho[]>();

  protected readonly maximo = MAXIMO_ITENS;

  /** Os itens com o nome e a foto do cadastro (produto apagado some da lista). */
  protected readonly linhas = computed(() => {
    const produtos = this.produtoService.produtos();
    return this.itens().flatMap((item) => {
      const produto = produtos.find((p) => p.id === item.produtoId);
      return produto ? [{ ...item, nome: produto.nome, foto: produto.fotoUrl ?? null }] : [];
    });
  });

  protected adicionar(produtoId: number | null): void {
    if (produtoId === null) return;
    const existente = this.itens().find((i) => i.produtoId === produtoId);
    this.mudou.emit(
      existente
        ? this.itens().map((i) => (i.produtoId === produtoId ? { ...i, quantidade: Math.min(i.quantidade + 1, MAXIMO_QUANTIDADE) } : i))
        : [...this.itens(), { produtoId, quantidade: 1 }],
    );
  }

  /** Quantidade 0 tira o produto do carrinho. */
  protected mudar(produtoId: number, quantidade: number): void {
    const nova = Math.min(Math.max(Math.round(quantidade), 0), MAXIMO_QUANTIDADE);
    this.mudou.emit(
      nova === 0
        ? this.itens().filter((i) => i.produtoId !== produtoId)
        : this.itens().map((i) => (i.produtoId === produtoId ? { ...i, quantidade: nova } : i)),
    );
  }

  protected digitar(produtoId: number, campo: HTMLInputElement): void {
    const numero = Number(campo.value.replace(/\D/g, ''));
    const atual = this.itens().find((i) => i.produtoId === produtoId)?.quantidade ?? 1;
    const nova = Number.isFinite(numero) && numero > 0 ? numero : atual;
    campo.value = String(Math.min(nova, MAXIMO_QUANTIDADE));
    this.mudar(produtoId, nova);
  }
}
