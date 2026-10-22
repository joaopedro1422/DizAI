import { ChangeDetectionStrategy, Component, output } from '@angular/core';

import { IconeComponent } from '../icone/icone.component';

/** Botão pequeno do topo das telas que reabre o vídeo explicativo. */
@Component({
  selector: 'app-botao-video',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="btn btn--pequeno botao-video" (click)="abrir.emit()">
      <app-icone nome="reproduzir" [tamanho]="13" [espessura]="2.2" />
      Vídeo
    </button>
  `,
  styles: `
    .botao-video {
      gap: 6px;
      background: var(--cor-primaria-clara);
      color: var(--cor-primaria);
    }
  `,
})
export class BotaoVideoComponent {
  readonly abrir = output<void>();
}
