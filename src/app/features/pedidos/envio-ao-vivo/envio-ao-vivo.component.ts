import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface MensagemAoVivo {
  cliente: string;
  texto: string;
}

@Component({
  selector: 'app-envio-ao-vivo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="envio" role="status">
      <div class="envio__topo">
        <span class="envio__avatar" aria-hidden="true">{{ mensagem().cliente.charAt(0) }}</span>
        <span class="envio__nome">
          <b>{{ mensagem().cliente }}</b>
          <small>WhatsApp · agora</small>
        </span>
        <span class="envio__ao-vivo"><i aria-hidden="true"></i>Enviado</span>
      </div>
      <div class="envio__conversa">
        <span class="envio__digitando" aria-hidden="true"><i></i><i></i><i></i></span>
        <p class="envio__balao">
          {{ mensagem().texto }}
          <span class="envio__hora">agora <span class="envio__checks">✓✓</span></span>
        </p>
      </div>
    </div>
  `,
  styles: `
    :host {
      position: fixed;
      right: 16px;
      bottom: calc(16px + env(safe-area-inset-bottom));
      left: 16px;
      z-index: 150;
      display: block;
      animation: subir 0.35s ease-out both;
    }

    .envio {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border-radius: 18px;
      background: #ffffff;
      box-shadow: 0 18px 40px rgba(10, 18, 40, 0.28);
    }

    .envio__topo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: #075E54;
      color: #ffffff;
    }

    .envio__avatar {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #DCF8C6;
      color: #075E54;
      font-weight: 800;
    }

    .envio__nome {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-width: 0;
      font-size: 14px;
    }

    .envio__nome small {
      opacity: 0.8;
      font-size: 11.5px;
    }

    .envio__ao-vivo {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
    }

    .envio__ao-vivo i {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #25D366;
      animation: piscar 1.2s ease-in-out infinite;
    }

    .envio__conversa {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      position: relative;
      min-height: 76px;
      padding: 14px;
      background: #ECE5DD;
    }

    /* os pontinhos ficam por cima, no lugar do balão, e somem quando ele aparece */
    .envio__digitando {
      position: absolute;
      top: 14px;
      right: 14px;
      display: inline-flex;
      gap: 4px;
      padding: 10px 12px;
      border-radius: 12px;
      background: #DCF8C6;
      animation: sumir 0.15s linear 0.9s both;
    }

    .envio__digitando i {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #6B8F5E;
      animation: pular 0.9s ease-in-out infinite;
    }

    .envio__digitando i:nth-child(2) { animation-delay: 0.15s; }
    .envio__digitando i:nth-child(3) { animation-delay: 0.3s; }

    .envio__balao {
      max-width: 88%;
      margin: 0;
      padding: 8px 10px 6px;
      border-radius: 12px 12px 2px 12px;
      background: #DCF8C6;
      color: #111b21;
      font-size: 14px;
      line-height: 1.4;
      animation: aparecer 0.3s ease-out 0.9s both;
    }

    .envio__hora {
      display: block;
      margin-top: 2px;
      color: #667781;
      font-size: 11px;
      text-align: right;
    }

    .envio__checks {
      color: #53BDEB;
      font-weight: 700;
    }

    @media (min-width: 760px) {
      :host {
        left: auto;
        width: 380px;
        right: 24px;
        bottom: 24px;
      }
    }

    @keyframes subir {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: none; }
    }

    @keyframes aparecer {
      from { opacity: 0; transform: scale(0.94); }
      to { opacity: 1; transform: none; }
    }

    @keyframes sumir {
      to { opacity: 0; visibility: hidden; }
    }

    @keyframes pular {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }

    @keyframes piscar {
      50% { opacity: 0.35; }
    }
  `,
})
export class EnvioAoVivoComponent {
  readonly mensagem = input.required<MensagemAoVivo>();
}
