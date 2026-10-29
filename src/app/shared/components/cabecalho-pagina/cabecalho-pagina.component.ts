import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SessaoService } from '../../../core/auth/sessao.service';
import { IconeComponent } from '../icone/icone.component';
import { NomeIcone } from '../icone/icones';

/**
 * Cabeçalho das telas internas do painel: voltar, título, subtítulo
 * e espaço para ações (`[acoesTopo]` ao lado do voltar, `[acaoTitulo]` ao lado do título
 * e conteúdo livre abaixo do título).
 */
@Component({
  selector: 'app-cabecalho-pagina',
  imports: [RouterLink, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="cabecalho" [class.cabecalho--com-divisor]="comDivisor()">
      <div class="cabecalho__topo">
        <a class="btn-icone btn-icone--sem-borda cabecalho__voltar" [routerLink]="destinoVoltar()" [attr.aria-label]="rotuloVoltar()">
          <app-icone nome="voltar" [tamanho]="22" />
          <span class="cabecalho__voltar-texto" aria-hidden="true">Voltar</span>
        </a>
        <ng-content select="[acoesTopo]" />
      </div>

      <div class="cabecalho__textos">
        <div class="cabecalho__linha-titulo">
          <h1 class="titulo-pagina cabecalho__titulo">
            @if (icone(); as nome) {
              <span class="cabecalho__icone" aria-hidden="true"><app-icone [nome]="nome" [tamanho]="26" [espessura]="2" /></span>
            }
            {{ titulo() }}
          </h1>
          <ng-content select="[acaoTitulo]" />
        </div>
        @if (subtitulo()) {
          <p class="cabecalho__subtitulo">{{ subtitulo() }}</p>
        }
      </div>

      <ng-content />
    </header>
  `,
  styles: `
    .cabecalho {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 24px 18px;
    }

    .cabecalho--com-divisor {
      border-bottom: 1px solid var(--cor-borda-suave);
    }

    .cabecalho__topo {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .cabecalho__voltar {
      margin-left: -10px;
      color: var(--cor-texto);
    }

    .cabecalho__textos {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .cabecalho__linha-titulo {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .cabecalho__titulo {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .cabecalho__icone {
      display: inline-flex;
      flex: none;
      color: var(--cor-texto);
    }

    .cabecalho__subtitulo {
      font-size: 14px;
      line-height: 1.5;
      color: var(--cor-texto-suave);
    }

    .cabecalho__voltar-texto {
      display: none;
    }

    /*
     * Computador: faixa branca na largura toda, com o conteúdo alinhado à coluna central da tela (--margem-pc, de
     * styles.css). Título à esquerda e as ações da tela (o conteúdo livre) à direita, na mesma linha.
     */
    @media (min-width: 1024px) {
      :host {
        display: block;
        border-bottom: 1px solid var(--cor-borda-suave);
        background: var(--cor-fundo);
      }

      .cabecalho {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: end;
        gap: 10px 40px;
        padding: 18px var(--margem-pc, 40px) 28px;
      }

      .cabecalho--com-divisor {
        border-bottom: none;
      }

      .cabecalho__topo {
        grid-column: 1 / -1;
        min-height: 36px;
      }

      .cabecalho__voltar {
        width: auto;
        height: 36px;
        gap: 6px;
        margin-left: -8px;
        padding: 0 14px 0 8px;
        border-radius: var(--raio-pilula);
        color: var(--cor-texto-suave);
        font-size: 14px;
        font-weight: 700;
        transition: background-color 0.15s ease, color 0.15s ease;
      }

      .cabecalho__voltar:hover {
        background: var(--cor-fundo-suave);
        color: var(--cor-texto);
      }

      .cabecalho__voltar-texto {
        display: inline;
      }

      .cabecalho__textos {
        grid-column: 1;
        gap: 8px;
      }

      .cabecalho__linha-titulo {
        justify-content: flex-start;
        gap: 18px;
      }

      .cabecalho__titulo {
        font-size: 34px;
        line-height: 1.1;
      }

      .cabecalho__subtitulo {
        max-width: 640px;
        font-size: 15px;
      }

      /* as ações da tela (botões de adicionar, períodos...) ficam à direita do título */
      .cabecalho > ::ng-deep :not(.cabecalho__topo):not(.cabecalho__textos) {
        grid-column: 2;
        grid-row: 2;
        justify-self: end;
      }
    }
  `,
})
export class CabecalhoPaginaComponent {
  readonly titulo = input.required<string>();
  readonly subtitulo = input('');
  /** Ícone opcional à esquerda do título. */
  readonly icone = input<NomeIcone | null>(null);
  /** Sem valor, volta para a tela inicial do painel da loja logada. */
  readonly linkVoltar = input<string | null>(null);
  readonly rotuloVoltar = input('Voltar para o painel');
  readonly comDivisor = input(false);

  private readonly inicioDoPainel = inject(SessaoService).caminhoPainel;
  protected readonly destinoVoltar = computed(() => this.linkVoltar() ?? this.inicioDoPainel());
}
