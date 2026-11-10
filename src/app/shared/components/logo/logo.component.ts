import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Símbolo (balão em forma de "D" com os três pontinhos de "digitando") e nome DizAI. */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      class="logo__simbolo"
      [attr.width]="tamanhoSimbolo()"
      [attr.height]="tamanhoSimbolo()"
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <path class="logo__balao" d="M8 6H22A18 17 0 0 1 22 40H16L8 46Z" />
      <circle class="logo__ponto" cx="16" cy="23" r="2.7" />
      <circle class="logo__ponto" cx="23.7" cy="23" r="2.7" />
      <circle class="logo__ponto" cx="31.4" cy="23" r="2.7" />
    </svg>
    @if (mostrarNome()) {
      <span class="logo__nome" [style.font-size.px]="tamanhoTexto()">Diz<span class="logo__ai">AI</span></span>
    } @else {
      <span class="somente-leitor-tela">DizAI</span>
    }
  `,
  styles: `
    /* a marca: no claro, balão azul-noite com os pontinhos amarelos; no escuro, balão amarelo e o "AI" creme */
    :host {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      --logo-balao: var(--cor-noite, #13204a);
      --logo-pontos: var(--cor-gema, #ffc83d);
      --logo-texto: var(--cor-noite, #13204a);
      --logo-ai: #8a94ab;
    }

    :host(.logo--claro) {
      --logo-balao: var(--cor-gema, #ffc83d);
      --logo-pontos: var(--cor-noite, #13204a);
      --logo-texto: #ffffff;
      --logo-ai: #f7eccd;
    }

    .logo__balao {
      fill: var(--logo-balao);
    }

    .logo__ponto {
      fill: var(--logo-pontos);
    }

    .logo__nome {
      font-weight: 800;
      letter-spacing: -0.05em;
      line-height: 1;
      color: var(--logo-texto);
    }

    .logo__ai {
      color: var(--logo-ai);
    }
  `,
  host: {
    '[class.logo--claro]': "variante() === 'claro'",
  },
})
export class LogoComponent {
  readonly variante = input<'escuro' | 'claro'>('escuro');
  readonly tamanhoSimbolo = input(34);
  readonly tamanhoTexto = input(24);
  readonly mostrarNome = input(true);
}
