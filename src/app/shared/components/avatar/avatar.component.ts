import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { obterIniciais } from '../../../core/utils/texto.utils';

const CORES_AVATAR = ['#E9D7D1', '#DCE6F7', '#F3E6CC', '#E3E7EE', '#F1E4E0', '#DDEBDF'];

/** Círculo com as iniciais do nome. A cor é sempre a mesma para o mesmo nome. */
@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `{{ iniciais() }}`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      border-radius: 50%;
      color: var(--cor-texto);
      font-weight: 700;
    }
  `,
  host: {
    'aria-hidden': 'true',
    '[style.width.px]': 'tamanho()',
    '[style.height.px]': 'tamanho()',
    '[style.font-size.px]': 'tamanho() * 0.33',
    '[style.background]': 'cor()',
  },
})
export class AvatarComponent {
  readonly nome = input.required<string>();
  readonly tamanho = input(42);

  protected readonly iniciais = computed(() => obterIniciais(this.nome()));

  protected readonly cor = computed(() => {
    const soma = [...this.nome()].reduce((total, letra) => total + letra.charCodeAt(0), 0);
    return CORES_AVATAR[soma % CORES_AVATAR.length];
  });
}
