import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-telefone-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="telefone">
      <div class="telefone__tela">

        <div class="telefone__conteudo"><ng-content /></div>
        <span class="telefone__gesto" aria-hidden="true"></span>
      </div>
    </figure>
  `,
  styles: `
    :host {
      display: block;
      width: min(100%, 355px);
      animation: telefone-entrada 0.35s ease both;
    }

    .telefone {
      height: 680px;
      padding: 8px;
      overflow: hidden;
      border: 2px solid #25272b;
      border-radius: 42px;
      background: #1d1f22;
      box-shadow: 0 28px 65px rgba(24, 32, 47, 0.22), inset 0 0 0 1px #55585e;
    }

    .telefone__tela {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      border-radius: 32px;
      background: #ffffff;
      color: #141a26;
    }

    .telefone__status {
      position: relative;
      z-index: 3;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex: none;
      height: 29px;
      padding: 4px 20px 0;
      background: #ffffff;
      font-size: 10px;
      font-weight: 800;
    }

    .telefone__ilha {
      position: absolute;
      top: 4px;
      left: 50%;
      width: 76px;
      height: 17px;
      border-radius: 12px;
      background: #151619;
      transform: translateX(-50%);
    }

    .telefone__indicadores {
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .telefone__indicadores i:first-child {
      width: 12px;
      height: 8px;
      border: 1px solid currentColor;
      border-radius: 2px;
    }

    .telefone__indicadores i:last-child {
      width: 15px;
      height: 8px;
      border: 1px solid currentColor;
      border-radius: 2px;
      background: linear-gradient(90deg, currentColor 70%, transparent 70%);
    }

    .telefone__conteudo {
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    .telefone__gesto {
      position: absolute;
      z-index: 5;
      bottom: 7px;
      left: 50%;
      width: 94px;
      height: 4px;
      border-radius: 4px;
      background: #141a26;
      transform: translateX(-50%);
    }

    @keyframes telefone-entrada {
      from { opacity: 0; transform: translateY(7px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 720px) {
      .telefone { height: 650px; }
    }

    @media (max-width: 420px) {
      :host { width: min(100%, 340px); }
    }
  `,
})
export class TelefoneDemoComponent {}
