import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Chave liga/desliga (role="switch"). O pai decide o estado: o componente só avisa o clique,
 * para dar tempo de salvar no backend antes de mudar.
 */
@Component({
  selector: 'app-interruptor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      role="switch"
      class="interruptor"
      [class.interruptor--ligado]="ligado()"
      [attr.aria-checked]="ligado()"
      [attr.aria-label]="rotulo()"
      [attr.aria-busy]="ocupado()"
      [disabled]="ocupado()"
      (click)="alternar.emit(!ligado())"
    >
      <span class="interruptor__botao" aria-hidden="true"></span>
    </button>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
    }

    .interruptor {
      position: relative;
      width: 48px;
      height: 28px;
      padding: 0;
      border: none;
      border-radius: 999px;
      background: var(--cor-borda-forte);
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .interruptor:focus-visible {
      outline: 2px solid var(--cor-primaria);
      outline-offset: 2px;
    }

    .interruptor:disabled {
      cursor: progress;
      opacity: 0.6;
    }

    .interruptor--ligado {
      background: var(--cor-ativo);
    }

    .interruptor__botao {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--cor-fundo);
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.25);
      transition: transform 0.2s ease;
    }

    .interruptor--ligado .interruptor__botao {
      transform: translateX(20px);
    }

    @media (prefers-reduced-motion: reduce) {
      .interruptor,
      .interruptor__botao {
        transition: none;
      }
    }
  `,
})
export class InterruptorComponent {
  readonly ligado = input.required<boolean>();
  /** Texto lido pelo leitor de tela. */
  readonly rotulo = input.required<string>();
  /** Enquanto salva, o clique fica bloqueado. */
  readonly ocupado = input(false);
  readonly alternar = output<boolean>();
}
