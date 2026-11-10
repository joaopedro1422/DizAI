import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastService } from '../../../core/services/toast.service';
import { IconeComponent } from '../icone/icone.component';

/** Exibe as mensagens do ToastService. Fica uma única vez no AppComponent. */
@Component({
  selector: 'app-toast-host',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="regiao" role="status" aria-live="polite">
      @if (toastService.mensagem(); as mensagem) {
        <div class="toast" [attr.data-id]="mensagem.id">
          <app-icone nome="check" [tamanho]="18" [espessura]="2.2" />
          <span>{{ mensagem.texto }}</span>
        </div>
      }
    </div>
  `,
  styles: `
    .regiao {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 24px;
      z-index: 300;
      display: flex;
      justify-content: center;
      padding: 0 16px;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      max-width: 448px;
      padding: 14px 16px;
      border-radius: var(--raio-medio);
      background: var(--cor-noite);
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      box-shadow: var(--sombra-flutuante);
      animation: entrar 0.25s ease-out both;
    }

    @keyframes entrar {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: none; }
    }
  `,
})
export class ToastHostComponent {
  protected readonly toastService = inject(ToastService);
}
