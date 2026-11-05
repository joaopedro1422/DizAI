import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { obterIniciais } from '../../../core/utils/texto.utils';
import { IconeComponent } from '../icone/icone.component';

const CORES_AVATAR = ['#E9D7D1', '#DCE6F7', '#F3E6CC', '#E3E7EE', '#F1E4E0', '#DDEBDF'];

@Component({
  selector: 'app-avatar',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (modo() === 'icone') {
      <app-icone nome="pessoa" [tamanho]="tamanho() * 0.48" [espessura]="2" />
    } @else {
      {{ iniciais() }}
    }
  `,
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
    '[style.color]': "modo() === 'icone' ? 'var(--cor-primaria)' : null",
  },
})
export class AvatarComponent {
  readonly nome = input.required<string>();
  readonly tamanho = input(42);
  readonly modo = input<'iniciais' | 'icone'>('iniciais');

  protected readonly iniciais = computed(() => obterIniciais(this.nome()));

  protected readonly cor = computed(() => {
    if (this.modo() === 'icone') {
      return 'var(--cor-primaria-clara)';
    }
    const soma = [...this.nome()].reduce((total, letra) => total + letra.charCodeAt(0), 0);
    return CORES_AVATAR[soma % CORES_AVATAR.length];
  });
}
