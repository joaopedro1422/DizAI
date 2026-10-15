import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { Produto } from '../../../core/models/produto.model';
import { pluralizar } from '../../../core/utils/colecao.utils';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { ItemMenuAcoes, MenuAcoesComponent } from '../../../shared/components/menu-acoes/menu-acoes.component';
import { PrecoProdutoPipe } from '../../../shared/pipes/preco-produto.pipe';

type AcaoProduto = 'editar';

@Component({
  selector: 'app-produto-card',
  imports: [IconeComponent, MenuAcoesComponent, PrecoProdutoPipe, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (produto().fotoUrl; as fotoUrl) {
      <img class="produto__foto" [src]="fotoUrl | urlImagem" alt="">
    } @else {
      <span class="produto__foto foto-vazia" aria-hidden="true">
        <app-icone nome="caixa" [tamanho]="24" />
      </span>
    }

    <div class="produto__textos">
      <span class="produto__categoria">{{ produto().categoria }}</span>
      <h2 class="produto__nome">{{ produto().nome }}</h2>
      <p class="produto__descricao">{{ produto().descricao }}</p>
      <div class="produto__rodape">
        <span class="produto__preco">{{ produto() | precoProduto }}</span>
        <span class="produto__opcoes">{{ resumoOpcoes() }}</span>
      </div>
    </div>

    <app-menu-acoes
      class="produto__menu"
      rotuloBotao="Opções do produto"
      [itens]="itensMenu"
      (escolher)="aoEscolherAcao($event)"
    />
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 14px;
      border: 1px solid var(--cor-borda);
      border-radius: 16px;
      background: var(--cor-fundo);
    }

    .produto__foto {
      flex: none;
      width: 72px;
      height: 72px;
      border-radius: 12px;
      object-fit: cover;
    }

    .produto__textos {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .produto__categoria {
      font-size: 11px;
      font-weight: 700;
      color: var(--cor-texto-suave);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .produto__nome {
      font-size: 15px;
      font-weight: 700;
      line-height: 1.3;
    }

    .produto__descricao {
      font-size: 13px;
      line-height: 1.45;
      color: var(--cor-texto-suave);
    }

    .produto__rodape {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-top: 2px;
    }

    .produto__preco {
      font-size: 14px;
      font-weight: 700;
    }

    .produto__opcoes {
      font-size: 12px;
      color: var(--cor-texto-suave);
    }

    .produto__menu {
      width: 36px;
      height: 36px;
      margin: -6px -6px 0 0;
    }
  `,
})
export class ProdutoCardComponent {
  readonly produto = input.required<Produto>();
  readonly editar = output<Produto>();

  protected readonly itensMenu: ItemMenuAcoes<AcaoProduto>[] = [
    { id: 'editar', rotulo: 'Editar', icone: 'editar' },
  ];
  protected readonly resumoOpcoes = computed(() => {
    const total = this.produto().atributos.length;
    return total === 0 ? 'Sem opções' : pluralizar(total, 'opção', 'opções');
  });

  protected aoEscolherAcao(acao: AcaoProduto): void {
    if (acao === 'editar') {
      this.editar.emit(this.produto());
    }
  }
}
