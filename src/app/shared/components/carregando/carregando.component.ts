import { ChangeDetectionStrategy, Component, input } from '@angular/core';

let proximoIdRecorte = 0;

@Component({
  selector: 'app-carregando',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './carregando.component.html',
  styleUrl: './carregando.component.css',
  host: {
    role: 'status',
    'aria-live': 'polite',
    '[class]': "'carregando carregando--' + modo() + ' carregando--' + variante()",
  },
})
export class CarregandoComponent {
  readonly modo = input<'bloco' | 'tela' | 'inline'>('bloco');
  /** `claro` para usar sobre fundo azul (dentro de botões primários). */
  readonly variante = input<'escuro' | 'claro'>('escuro');
  readonly tamanho = input(44);
  readonly texto = input('');

  protected readonly idRecorte = `carregando-recorte-${++proximoIdRecorte}`;
}
