import { ChangeDetectionStrategy, Component, ElementRef, OnInit, computed, inject, input, output, signal } from '@angular/core';

import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { ProdutoService } from '../../../core/services/produto.service';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

/** A partir de quantos produtos aparece a busca. */
const BUSCA_A_PARTIR_DE = 7;

/**
 * "Produto vendido" nos modais de pedido ("Confirmar pedido", "Já entregue" e "Registrar pedido"): dropdown próprio
 * com os produtos cadastrados (foto, nome e categoria). Opcional: só serve para os "Produtos que mais vendem" dos
 * Números; não aparece no pedido.
 */
@Component({
  selector: 'app-seletor-produto',
  imports: [IconeComponent, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'fecharSeForFora($event)', '(keydown.escape)': 'aberto.set(false)' },
  template: `
    <button
      type="button"
      class="gatilho"
      [class.gatilho--aberto]="aberto()"
      [class.gatilho--vazio]="!escolhido()"
      aria-haspopup="listbox"
      [attr.aria-expanded]="aberto()"
      [attr.aria-label]="'Produto vendido: ' + (escolhido()?.nome ?? 'nenhum')"
      (click)="abrir()"
    >
      @if (escolhido(); as produto) {
        @if (produto.fotoUrl) {
          <img class="foto" [src]="produto.fotoUrl | urlImagem" alt="">
        } @else {
          <span class="foto foto--vazia" aria-hidden="true"><app-icone nome="caixa" [tamanho]="16" /></span>
        }
        <span class="gatilho__texto">{{ produto.nome }}</span>
      } @else {
        <span class="foto foto--vazia" aria-hidden="true"><app-icone nome="caixa" [tamanho]="16" /></span>
        <span class="gatilho__texto">Escolha o produto</span>
      }
      <span class="gatilho__seta" aria-hidden="true"><app-icone nome="setaBaixo" [tamanho]="16" [espessura]="2.4" /></span>
    </button>

    @if (aberto()) {
      <div class="lista" role="listbox" aria-label="Produtos cadastrados">
        @if (produtos().length >= buscaAPartirDe) {
          <input class="busca" type="search" placeholder="Buscar produto" aria-label="Buscar produto" [value]="busca()" (input)="busca.set($any($event.target).value)">
        }
        <div class="lista__opcoes">
          @if (valor() !== null) {
            <button type="button" role="option" class="opcao opcao--limpar" [attr.aria-selected]="false" (click)="escolher(null)">
              <span class="opcao__nome">Nenhum produto</span>
            </button>
          }
          @for (produto of filtrados(); track produto.id) {
            @let marcado = produto.id === valor();
            <button type="button" role="option" class="opcao" [class.opcao--marcada]="marcado" [attr.aria-selected]="marcado" (click)="escolher(produto.id)">
              @if (produto.fotoUrl) {
                <img class="foto" [src]="produto.fotoUrl | urlImagem" alt="" loading="lazy">
              } @else {
                <span class="foto foto--vazia" aria-hidden="true"><app-icone nome="caixa" [tamanho]="16" /></span>
              }
              <span class="opcao__textos">
                <span class="opcao__nome">{{ produto.nome }}</span>
                <span class="opcao__categoria">{{ produto.categoria }}</span>
              </span>
              @if (marcado) {
                <span class="opcao__check"><app-icone nome="check" [tamanho]="15" [espessura]="2.6" /></span>
              }
            </button>
          } @empty {
            <p class="lista__vazia">{{ produtos().length === 0 ? 'Nenhum produto cadastrado.' : 'Nenhum produto com esse nome.' }}</p>
          }
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      position: relative;
      display: block;
    }

    .gatilho {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      min-height: 50px;
      padding: 0 12px 0 8px;
      border: 1px solid var(--cor-borda);
      border-radius: 12px;
      background: var(--cor-fundo);
      color: var(--cor-texto);
      font: inherit;
      font-size: 15px;
      text-align: left;
      cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .gatilho:hover,
    .gatilho--aberto {
      border-color: var(--cor-primaria);
    }

    .gatilho--aberto {
      box-shadow: 0 0 0 3px var(--cor-primaria-clara);
    }

    .gatilho__texto {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .gatilho--vazio .gatilho__texto {
      font-weight: 500;
      color: #8a93a5;
    }

    .gatilho__seta {
      display: inline-flex;
      flex: none;
      color: var(--cor-texto-suave);
      transition: transform 0.15s ease;
    }

    .gatilho--aberto .gatilho__seta {
      transform: rotate(180deg);
    }

    .foto {
      flex: none;
      width: 34px;
      height: 34px;
      border-radius: 9px;
      object-fit: cover;
    }

    .foto--vazia {
      display: grid;
      place-items: center;
      background: var(--cor-fundo-suave);
      color: var(--cor-texto-suave);
    }

    .lista {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      z-index: 20;
      overflow: hidden;
      border: 1px solid var(--cor-borda);
      border-radius: 14px;
      background: var(--cor-fundo);
      box-shadow: 0 14px 34px rgba(15, 23, 42, 0.16);
      animation: abrir 0.14s ease-out;
    }

    .busca {
      width: calc(100% - 12px);
      margin: 6px 6px 2px;
      min-height: 40px;
      padding: 0 12px;
      border: 1px solid var(--cor-borda);
      border-radius: 10px;
      font-size: 14px;
    }

    .busca:focus {
      outline: none;
      border-color: var(--cor-primaria);
    }

    .lista__opcoes {
      display: flex;
      flex-direction: column;
      max-height: 260px;
      overflow-y: auto;
      padding: 4px;
    }

    .lista__vazia {
      padding: 14px 10px;
      color: var(--cor-texto-suave);
      font-size: 14px;
    }

    .opcao {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 48px;
      padding: 4px 10px 4px 6px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--cor-texto);
      font: inherit;
      text-align: left;
      cursor: pointer;
    }

    .opcao:hover {
      background: var(--cor-fundo-suave);
    }

    .opcao--marcada {
      background: var(--cor-primaria-clara);
    }

    .opcao--limpar .opcao__nome {
      padding-left: 4px;
      color: var(--cor-texto-suave);
      font-weight: 500;
    }

    .opcao__textos {
      display: flex;
      flex: 1;
      min-width: 0;
      flex-direction: column;
    }

    .opcao__nome {
      overflow: hidden;
      font-size: 14.5px;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .opcao__categoria {
      font-size: 12px;
      color: var(--cor-texto-suave);
    }

    .opcao__check {
      display: inline-flex;
      flex: none;
      color: var(--cor-primaria);
    }

    @keyframes abrir {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
    }
  `,
})
export class SeletorProdutoComponent implements OnInit {
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly produtoService = inject(ProdutoService);

  /** O id escolhido; null = nenhum. */
  readonly valor = input<number | null>(null);
  readonly escolher$ = output<number | null>({ alias: 'escolher' });

  protected readonly buscaAPartirDe = BUSCA_A_PARTIR_DE;
  protected readonly aberto = signal(false);
  protected readonly busca = signal('');
  /** Os produtos da loja, sem os "produtos à venda" dos negócios de serviço. */
  protected readonly produtos = computed(() => this.produtoService.produtos().filter((p) => !p.produtoAVenda));
  protected readonly escolhido = computed(() => this.produtos().find((p) => p.id === this.valor()) ?? null);
  protected readonly filtrados = computed(() => {
    const termo = semAcento(this.busca().trim());
    return termo ? this.produtos().filter((p) => semAcento(p.nome).includes(termo)) : this.produtos();
  });

  ngOnInit(): void {
    this.produtoService.carregar().catch(() => undefined);
  }

  protected abrir(): void {
    this.busca.set('');
    this.aberto.set(!this.aberto());
  }

  protected escolher(id: number | null): void {
    this.escolher$.emit(id);
    this.aberto.set(false);
  }

  /** Tocou fora do seletor: fecha a lista. */
  protected fecharSeForFora(evento: Event): void {
    if (this.aberto() && !this.elemento.nativeElement.contains(evento.target as Node)) {
      this.aberto.set(false);
    }
  }
}

function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}
