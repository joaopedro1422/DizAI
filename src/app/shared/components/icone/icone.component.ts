import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ICONES, NomeIcone } from './icones';

/** Ícone decorativo. Use `aria-label` no botão que o contém quando for o único conteúdo. */
@Component({
  selector: 'app-icone',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="tamanho()"
      [attr.height]="tamanho()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="espessura()"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      @for (caminho of caminhos(); track $index) {
        <path [attr.d]="caminho" />
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
    }
  `,
})
export class IconeComponent {
  readonly nome = input.required<NomeIcone>();
  readonly tamanho = input(20);
  readonly espessura = input(1.8);

  protected readonly caminhos = computed(() => ICONES[this.nome()]);
}
