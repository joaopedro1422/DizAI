import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { IconeComponent } from '../icone/icone.component';

@Component({
  selector: 'app-mapa-loja',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mapa">
      <iframe
        class="mapa__quadro"
        [style.height.px]="altura()"
        [src]="urlDoMapa()"
        [title]="'Mapa: ' + endereco()"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
      <div class="mapa__rodape">
        <span class="mapa__endereco">
          <span class="mapa__pino" aria-hidden="true">📍</span>
          {{ endereco() }}
        </span>
        @if (comBotoes()) {
          <div class="mapa__acoes">
            <a class="mapa__botao mapa__botao--principal" [href]="linkRota()" target="_blank" rel="noopener">
              <app-icone nome="seta" [tamanho]="16" [espessura]="2" />
              Traçar rota
            </a>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .mapa {
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--vitrine-destaque, #1c1a19) 10%, transparent);
      border-radius: 20px;
      background: var(--vitrine-cartao, #ffffff);
      box-shadow: 0 14px 34px -22px color-mix(in srgb, var(--vitrine-destaque, #1c1a19) 45%, transparent);
    }

    .mapa__quadro {
      display: block;
      width: 100%;
      border: 0;
      background: #eef0f3;
    }

    .mapa__rodape {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 14px 16px 16px;
    }

    .mapa__endereco {
      display: flex;
      gap: 8px;
      font-size: 14.5px;
      line-height: 1.5;
      color: var(--vitrine-texto, #2a2724);
    }

    .mapa__acoes {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .mapa__botao {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 14px;
      border: 1px solid color-mix(in srgb, var(--vitrine-destaque, #1c1a19) 18%, transparent);
      border-radius: 999px;
      color: var(--vitrine-destaque, #1c1a19);
      font-size: 13.5px;
      font-weight: 700;
      text-decoration: none;
    }

    .mapa__botao--principal {
      border-color: transparent;
      background: var(--vitrine-destaque-fundo, var(--vitrine-destaque, #1c1a19));
      color: #ffffff;
    }
  `,
})
export class MapaLojaComponent {
  readonly endereco = input.required<string>();
  readonly altura = input(280);
  /** Na prévia do painel não precisa dos botões. */
  readonly comBotoes = input(true);

  private readonly sanitizer = inject(DomSanitizer);
  private readonly consulta = computed(() => encodeURIComponent(this.endereco()));

  protected readonly urlDoMapa = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.google.com/maps?q=${this.consulta()}&output=embed`),
  );
  protected readonly linkRota = computed(() => `https://www.google.com/maps/dir/?api=1&destination=${this.consulta()}`);
}
