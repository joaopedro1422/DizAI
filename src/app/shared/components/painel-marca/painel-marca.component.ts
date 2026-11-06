import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-painel-marca',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LogoComponent],
  template: `
    <svg class="marca__balao" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M8 6H22A18 17 0 0 1 22 40H16L8 46Z" />
    </svg>

    <app-logo class="logo--claro marca__logo" [tamanhoSimbolo]="34" [tamanhoTexto]="25" />

    <h2 class="marca__titulo">{{ titulo() }}</h2>
  `,
  styles: `
    :host {
      display: none;
    }

    @media (min-width: 1024px) {
      :host {
        position: sticky;
        top: 0;
        align-self: start;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100dvh;
        min-height: 640px;
        padding: 40px clamp(40px, 5vw, 72px);
        overflow: hidden;
        background: linear-gradient(160deg, #1E3A72 0%, #19325F 60%, #142849 100%);
        color: #ffffff;
      }
    }

    /* o balão da logo, bem grande e quase invisível, saindo pelo canto */
    .marca__balao {
      position: absolute;
      right: -120px;
      bottom: -90px;
      width: 460px;
      height: 460px;
      fill: rgba(255, 255, 255, 0.04);
      pointer-events: none;
    }

    .marca__logo {
      position: absolute;
      top: 40px;
      left: clamp(40px, 5vw, 72px);
    }

    .marca__titulo {
      position: relative;
      max-width: 520px;
      font-size: clamp(34px, 3.2vw, 46px);
      font-weight: 800;
      letter-spacing: -0.04em;
      line-height: 1.1;
      text-align: center;
      text-wrap: balance;
    }
  `,
})
export class PainelMarcaComponent {
  readonly titulo = input('Seus clientes atendidos na hora, mesmo quando você está ocupado.');
}
