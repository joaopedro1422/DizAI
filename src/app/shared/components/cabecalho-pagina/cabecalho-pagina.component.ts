import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SessaoService } from '../../../core/auth/sessao.service';
import { IconeComponent } from '../icone/icone.component';

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
        </a>
        <ng-content select="[acoesTopo]" />
      </div>

      <div class="cabecalho__textos">
        <div class="cabecalho__linha-titulo">
          <h1 class="titulo-pagina">{{ titulo() }}</h1>
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

    .cabecalho__subtitulo {
      font-size: 14px;
      line-height: 1.5;
      color: var(--cor-texto-suave);
    }
  `,
})
export class CabecalhoPaginaComponent {
  readonly titulo = input.required<string>();
  readonly subtitulo = input('');
  /** Sem valor, volta para a tela inicial do painel da loja logada. */
  readonly linkVoltar = input<string | null>(null);
  readonly rotuloVoltar = input('Voltar para o painel');
  readonly comDivisor = input(false);

  private readonly inicioDoPainel = inject(SessaoService).caminhoPainel;
  protected readonly destinoVoltar = computed(() => this.linkVoltar() ?? this.inicioDoPainel());
}
