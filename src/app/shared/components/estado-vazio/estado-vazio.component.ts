import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconeComponent } from '../icone/icone.component';
import { NomeIcone } from '../icone/icones';

/** Mensagem para listas vazias, com espaço para uma ação. */
@Component({
  selector: 'app-estado-vazio',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="estado-vazio__icone">
      <app-icone [nome]="icone()" [tamanho]="28" />
    </span>
    <p class="estado-vazio__titulo">{{ titulo() }}</p>
    @if (descricao()) {
      <p class="estado-vazio__descricao">{{ descricao() }}</p>
    }
    <ng-content />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      margin-top: 40px;
      text-align: center;
    }

    .estado-vazio__icone {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--cor-primaria-clara);
      color: var(--cor-primaria);
    }

    .estado-vazio__titulo {
      font-size: 17px;
      font-weight: 700;
    }

    .estado-vazio__descricao {
      max-width: 280px;
      font-size: 14px;
      line-height: 1.5;
      color: var(--cor-texto-suave);
    }
  `,
})
export class EstadoVazioComponent {
  readonly icone = input<NomeIcone>('check');
  readonly titulo = input.required<string>();
  readonly descricao = input('');
}
