import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { Produto } from '../../../core/models/produto.model';
import { pluralizar } from '../../../core/utils/colecao.utils';
import { formatarDuracao } from '../../../core/utils/datas-agenda';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { ItemMenuAcoes, MenuAcoesComponent } from '../../../shared/components/menu-acoes/menu-acoes.component';
import { PrecoProdutoPipe } from '../../../shared/pipes/preco-produto.pipe';
import { PerfilService } from '../../../core/services/perfil.service';
import { ICONES_SEGMENTO } from '../../painel/onboarding/icones-segmento';

type AcaoProduto = 'editar' | 'duplicar' | 'excluir';

@Component({
  selector: 'app-produto-card',
  host: { '[class.compacto]': '!produto().fotoUrl' },
  imports: [IconeComponent, MenuAcoesComponent, PrecoProdutoPipe, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (produto().fotoUrl; as fotoUrl) {
      <img class="produto__foto" [src]="fotoUrl | urlImagem" alt="">
    } @else {
      <!-- sem foto: o ícone pequeno, na altura da categoria + nome -->
      <span class="produto__foto foto-vazia" aria-hidden="true">
        @if (iconeDoSegmento(); as caminhos) {
          <!-- serviço: o ícone do tipo de negócio (o mesmo da escolha do segmento) -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
            stroke-linecap="round" stroke-linejoin="round" focusable="false">
            @for (caminho of caminhos; track $index) {
              <path [attr.d]="caminho" />
            }
          </svg>
        } @else {
          <app-icone [nome]="servico() ? 'ferramenta' : 'caixa'" [tamanho]="18" />
        }
      </span>
    }

    <div class="produto__cabeca">
      <span class="produto__categoria">
        {{ produto().categoria }}
        @if (produto().produtoAVenda) {
          <span class="produto__selo">Produto à venda</span>
        }
      </span>
      <h2 class="produto__nome">{{ produto().nome }}</h2>
    </div>

    <div class="produto__textos">
      @if (produto().descricao) {
        <p class="produto__descricao">{{ produto().descricao }}</p>
      }
      <div class="produto__rodape">
        <span class="produto__preco">{{ produto() | precoProduto }}</span>
        @if (duracao(); as tempo) {
          <span class="produto__duracao">
            <app-icone nome="relogio" [tamanho]="14" />
            {{ tempo }}
          </span>
        } @else if (!servico() && !produto().produtoAVenda) {
          <!-- só os produtos têm opções que o cliente escolhe -->
          <span class="produto__opcoes">{{ resumoOpcoes() }}</span>
        }
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
    /* com foto: a foto ocupa a altura toda à esquerda; sem foto: o ícone pequeno ao lado da categoria + nome e o
       resto (descrição, preço, duração) na largura toda do card */
    :host {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      grid-template-areas:
        'foto cabeca menu'
        'foto textos textos';
      align-items: start;
      column-gap: 14px;
      row-gap: 6px;
      padding: 14px;
      border: 1px solid var(--cor-borda);
      border-radius: 16px;
      background: var(--cor-fundo);
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.05);
    }

    :host(.compacto) {
      grid-template-areas:
        'foto cabeca menu'
        'textos textos textos';
      column-gap: 12px;
      row-gap: 8px;
    }

    .produto__foto {
      grid-area: foto;
      width: 72px;
      height: 72px;
      border-radius: 12px;
      object-fit: cover;
    }

    /* o ícone dos itens sem foto: pequeno, na altura da categoria + nome */
    :host(.compacto) .produto__foto {
      display: grid;
      place-items: center;
      align-self: center;
      width: 40px;
      height: 40px;
      border-radius: 11px;
      background: var(--cor-primaria-clara);
      color: var(--cor-primaria);
    }

    .produto__cabeca {
      grid-area: cabeca;
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }

    .produto__textos {
      grid-area: textos;
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

    .produto__selo {
      margin-left: 6px;
      padding: 2px 7px;
      border-radius: 999px;
      background: var(--cor-primaria-clara);
      color: var(--cor-primaria);
      font-size: 10px;
      letter-spacing: 0.04em;
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

    .produto__duracao {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      color: var(--cor-texto-secundario);
    }

    .produto__menu {
      grid-area: menu;
      width: 36px;
      height: 36px;
      margin: -6px -6px 0 0;
    }
  `,
})
export class ProdutoCardComponent {
  readonly produto = input.required<Produto>();
  /** Serviço (não o produto à venda): sem foto, o ícone é o do segmento (sem segmento, a ferramenta). */
  readonly servico = input(false);
  private readonly perfil = inject(PerfilService).perfil;
  private readonly segmento = computed(() => this.perfil().segmento ?? null);
  readonly editar = output<Produto>();
  /** Cadastrar um novo a partir deste (o formulário abre preenchido com os dados dele). */
  readonly duplicar = output<Produto>();
  readonly excluir = output<Produto>();

  protected readonly itensMenu: ItemMenuAcoes<AcaoProduto>[] = [
    { id: 'editar', rotulo: 'Editar', icone: 'editar' },
    { id: 'duplicar', rotulo: 'Duplicar', icone: 'copiar' },
    { id: 'excluir', rotulo: 'Excluir', icone: 'lixeira', perigo: true },
  ];
  protected readonly resumoOpcoes = computed(() => {
    const total = this.produto().atributos.length;
    return total === 0 ? 'Sem opções' : pluralizar(total, 'opção', 'opções');
  });

  protected readonly iconeDoSegmento = computed(() => {
    const segmento = this.segmento();
    return this.servico() && segmento ? ICONES_SEGMENTO[segmento] ?? null : null;
  });

  protected readonly duracao = computed(() => {
    const minutos = this.produto().duracaoMinutos;
    return minutos ? formatarDuracao(minutos) : null;
  });

  protected aoEscolherAcao(acao: AcaoProduto): void {
    if (acao === 'editar') {
      this.editar.emit(this.produto());
    } else if (acao === 'duplicar') {
      this.duplicar.emit(this.produto());
    } else {
      this.excluir.emit(this.produto());
    }
  }
}
