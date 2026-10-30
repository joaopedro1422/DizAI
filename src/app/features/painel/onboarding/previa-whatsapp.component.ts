import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { LinhaPrevia } from './previas-onboarding';

/** Pedacinho de conversa do WhatsApp (ou o aviso que chega no celular) usado no onboarding. */
@Component({
  selector: 'app-previa-whatsapp',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (linha of linhas(); track $index) {
      @if (linha.de === 'aviso') {
        <span class="aviso">
          <span class="aviso__icone"><app-icone nome="sino" [tamanho]="14" [espessura]="2" /></span>
          {{ linha.texto }}
        </span>
      } @else {
        <span class="balao" [class.balao--cliente]="linha.de === 'cliente'">{{ linha.texto }}</span>
      }
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 10px;
      border-radius: 14px;
      background: #EFEAE2;
    }

    .balao {
      align-self: flex-start;
      max-width: 88%;
      padding: 7px 10px;
      border-radius: 10px 10px 10px 3px;
      background: #ffffff;
      color: #111B21;
      font-size: 13px;
      line-height: 1.4;
      box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13);
    }

    .balao--cliente {
      align-self: flex-end;
      border-radius: 10px 10px 3px 10px;
      background: #D9FDD3;
    }

    /* o aviso no celular: pedido para fechar, cliente esperando... */
    .aviso {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 12px;
      background: #111827;
      color: #ffffff;
      font-size: 13px;
      font-weight: 600;
    }

    .aviso__icone {
      display: grid;
      place-items: center;
      flex: none;
      width: 26px;
      height: 26px;
      border-radius: 8px;
      background: var(--cor-primaria);
    }
  `,
})
export class PreviaWhatsappComponent {
  readonly linhas = input.required<LinhaPrevia[]>();
}
