import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';

import { mensagemDoErro } from '../../../core/api/erro-api';
import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { VendaProduto } from '../../../core/models/agenda.model';
import { AgendaService } from '../../../core/services/agenda.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { pluralizar } from '../../../core/utils/colecao.utils';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { formatarReal } from '../../pedidos/textos-pedido';

@Component({
  selector: 'app-registrar-venda',
  imports: [IconeComponent, CarregandoComponent, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="venda">
      <div class="lista">
        @for (produto of produtos(); track produto.id) {
          @let quantidade = quantidades()[produto.id] ?? 0;
          <div class="item" [class.item--escolhido]="quantidade > 0">
            @if (produto.fotoUrl) {
              <img class="item__foto" [src]="produto.fotoUrl | urlImagem" alt="">
            } @else {
              <span class="item__foto item__foto--vazia" aria-hidden="true"><app-icone nome="caixa" [tamanho]="20" /></span>
            }
            <span class="item__textos">
              <span class="item__nome">{{ produto.nome }}</span>
              <span class="item__preco">{{ real(produto.preco ?? 0) }}</span>
            </span>
            <span class="item__quantidade">
              @if (quantidade > 0) {
                <button type="button" class="item__botao" [attr.aria-label]="'Tirar um ' + produto.nome" (click)="mudar(produto.id, -1)">
                  <app-icone nome="menos" [tamanho]="16" [espessura]="2.4" />
                </button>
                <span class="item__numero" aria-live="polite">{{ quantidade }}</span>
              }
              <button type="button" class="item__botao item__botao--mais" [attr.aria-label]="'Adicionar um ' + produto.nome" (click)="mudar(produto.id, 1)">
                <app-icone nome="mais" [tamanho]="16" [espessura]="2.4" />
              </button>
            </span>
          </div>
        } @empty {
          <p class="vazio">Cadastre produtos à venda em Serviços → "Adicionar produto" para registrar vendas.</p>
        }
      </div>

      <div class="rodape">
        <span class="rodape__total">
          <span class="rodape__rotulo">{{ totalItens() === 0 ? 'Nenhum produto' : rotuloItens() }}</span>
          <strong>{{ real(total()) }}</strong>
        </span>
        @if (erro()) {
          <span class="campo__erro" role="alert">{{ erro() }}</span>
        }
        <button type="button" class="btn btn--primario btn--grande btn--bloco" [disabled]="totalItens() === 0 || salvando()" [attr.aria-busy]="salvando()" (click)="registrar()">
          @if (salvando()) {
            <app-carregando modo="inline" [tamanho]="18" />
          } @else {
            Registrar
          }
        </button>
      </div>
    </div>
  `,
  styles: `
    .venda {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .lista {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 10px 8px 8px;
      border: 1px solid var(--cor-borda-suave);
      border-radius: var(--raio-grande);
      background: var(--cor-fundo);
      transition: border-color 0.15s ease;
    }

    .item--escolhido {
      border-color: var(--cor-primaria);
    }

    .item__foto {
      flex: none;
      width: 48px;
      height: 56px;
      border-radius: 10px;
      object-fit: cover;
      background: var(--cor-fundo-suave);
    }

    .item__foto--vazia {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--cor-texto-suave);
    }

    .item__textos {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .item__nome {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 14px;
      font-weight: 700;
    }

    .item__preco {
      font-size: 13px;
      color: var(--cor-texto-suave);
    }

    .item__quantidade {
      display: flex;
      flex: none;
      align-items: center;
      gap: 8px;
    }

    .item__botao {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      padding: 0;
      border: 1px solid var(--cor-borda);
      border-radius: 50%;
      background: var(--cor-fundo);
      color: var(--cor-texto);
      cursor: pointer;
    }

    .item__botao--mais {
      border-color: var(--cor-primaria);
      background: var(--cor-primaria);
      color: #ffffff;
    }

    .item__numero {
      min-width: 18px;
      font-size: 15px;
      font-weight: 800;
      text-align: center;
      font-variant-numeric: tabular-nums;
    }

    .vazio {
      font-size: 14px;
      line-height: 1.5;
      color: var(--cor-texto-suave);
    }

    .rodape {
      position: sticky;
      bottom: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding-top: 12px;
      border-top: 1px solid var(--cor-borda-suave);
      background: var(--cor-fundo);
    }

    .rodape__total {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      font-size: 18px;
    }

    .rodape__rotulo {
      font-size: 14px;
      color: var(--cor-texto-suave);
    }
  `,
})
export class RegistrarVendaComponent {
  private readonly agendaService = inject(AgendaService);
  private readonly produtoService = inject(ProdutoService);

  readonly registrada = output<VendaProduto>();

  /** Os produtos à venda disponíveis (a agenda já carrega a lista de produtos). */
  protected readonly produtos = computed(() =>
    this.produtoService.produtos().filter((produto) => produto.produtoAVenda && produto.disponivel),
  );
  /** id do produto -> quantidade escolhida. */
  protected readonly quantidades = signal<Partial<Record<number, number>>>({});
  protected readonly salvando = signal(false);
  protected readonly erro = signal('');

  protected readonly totalItens = computed(() => Object.values(this.quantidades()).reduce((soma: number, n) => soma + (n ?? 0), 0));
  protected readonly rotuloItens = computed(() => pluralizar(this.totalItens(), 'produto', 'produtos'));
  protected readonly total = computed(() =>
    this.produtos().reduce((soma, produto) => soma + (produto.preco ?? 0) * (this.quantidades()[produto.id] ?? 0), 0),
  );

  protected mudar(produtoId: number, passo: 1 | -1): void {
    this.quantidades.update((atual) => {
      const quantidade = Math.max(0, Math.min(999, (atual[produtoId] ?? 0) + passo));
      const proximo = { ...atual, [produtoId]: quantidade };
      if (quantidade === 0) {
        delete proximo[produtoId];
      }
      return proximo;
    });
  }

  protected real(valor: number): string {
    return formatarReal(Number(valor));
  }

  protected async registrar(): Promise<void> {
    if (this.totalItens() === 0 || this.salvando()) {
      return;
    }
    this.salvando.set(true);
    this.erro.set('');
    try {
      const itens = Object.entries(this.quantidades()).map(([id, quantidade]) => ({ produtoId: Number(id), quantidade: quantidade ?? 0 }));
      this.registrada.emit(await this.agendaService.registrarVenda(itens));
    } catch (erro) {
      this.erro.set(mensagemDoErro(erro, 'Não foi possível registrar a venda. Tente de novo.'));
    } finally {
      this.salvando.set(false);
    }
  }
}
