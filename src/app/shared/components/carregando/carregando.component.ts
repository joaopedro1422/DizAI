import { ChangeDetectionStrategy, Component, input } from '@angular/core';

let proximoIdRecorte = 0;

/**
 * Animação de carregamento com o símbolo do DizAI: o balão vai se enchendo de azul
 * enquanto os três pontinhos "digitam".
 *
 * - `bloco`: centralizado no espaço da seção (listas carregando).
 * - `tela`: cobre a tela toda (criar loja, entrar, abrir o painel).
 * - `inline`: pequeno, ao lado do texto de um botão.
 */
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
