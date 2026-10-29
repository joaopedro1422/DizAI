import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';

import { FeedbackPublico } from '../../../core/models/loja-publica.model';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

/** Tempo de cada feedback na tela antes de passar para o próximo. */
const TEMPO_POR_SLIDE_MS = 6000;

/**
 * Tópico de feedbacks na vitrine pública: um depoimento por vez, passando sozinho (pausa com o mouse em cima, com o
 * foco num botão ou com a aba escondida; sem animação para quem pediu menos movimento), com < e >, pontinhos e o
 * gesto de arrastar no celular. As cores e a fonte vêm da vitrine (--vitrine-destaque, --vitrine-fonte).
 */
@Component({
  selector: 'app-carrossel-feedbacks',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(mouseenter)': 'pausado.set(true)',
    '(mouseleave)': 'pausado.set(false)',
    '(focusin)': 'pausado.set(true)',
    '(focusout)': 'pausado.set(false)',
  },
  template: `
    <div class="carrossel" role="region" aria-roledescription="carrossel" aria-label="Feedbacks de clientes">
      <div class="janela" (touchstart)="inicioToque($event)" (touchend)="fimToque($event)">
        <ul class="trilho" [style.transform]="'translateX(-' + atual() * 100 + '%)'">
          @for (feedback of feedbacks(); track feedback.id; let i = $index) {
            <li
              class="slide"
              role="group"
              aria-roledescription="slide"
              [attr.aria-label]="(i + 1) + ' de ' + feedbacks().length"
              [attr.aria-hidden]="i !== atual()"
            >
              <figure class="cartao">
                <span class="cartao__aspas" aria-hidden="true">“</span>
                <span class="cartao__estrelas" [attr.aria-label]="feedback.estrelas + ' de 5 estrelas'">
                  @for (n of estrelas; track n) {
                    <span [class.cartao__estrela--apagada]="n > feedback.estrelas">★</span>
                  }
                </span>
                <blockquote class="cartao__texto">{{ feedback.texto }}</blockquote>
                <figcaption class="cartao__autor">
                  <span class="cartao__inicial" aria-hidden="true">{{ inicial(feedback.nome) }}</span>
                  <span class="cartao__quem">
                    <strong class="cartao__nome">{{ feedback.nome }}</strong>
                    @if (feedback.data) {
                      <span class="cartao__data">{{ dataPorExtenso(feedback.data) }}</span>
                    }
                  </span>
                </figcaption>
              </figure>
            </li>
          }
        </ul>
      </div>

      @if (feedbacks().length > 1) {
        <div class="controles">
          <button type="button" class="seta" aria-label="Feedback anterior" (click)="anterior()">
            <app-icone nome="voltar" [tamanho]="18" [espessura]="2.2" />
          </button>
          <div class="pontos">
            @for (feedback of feedbacks(); track feedback.id; let i = $index) {
              <button
                type="button"
                class="ponto"
                [class.ponto--ativo]="i === atual()"
                [attr.aria-label]="'Ver feedback ' + (i + 1)"
                [attr.aria-current]="i === atual() ? 'true' : null"
                (click)="irPara(i)"
              ></button>
            }
          </div>
          <button type="button" class="seta" aria-label="Próximo feedback" (click)="proximo()">
            <app-icone nome="avancar" [tamanho]="18" [espessura]="2.2" />
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .carrossel {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .janela {
      overflow: hidden;
      margin: -12px -6px;
      padding: 12px 0px 26px;
      touch-action: pan-y;
    }

    .trilho {
      display: flex;
      margin: 0;
      padding: 0;
      list-style: none;
      transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .slide {
      flex: 0 0 100%;
      display: flex;
      padding: 0 6px;
    }

    .cartao {
      position: relative;
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 16px;
      margin: 0;
      padding: 30px 26px 24px;
      overflow: hidden;
      border: 1.5px solid color-mix(in srgb, var(--vitrine-destaque, #1c1a19) 20%, transparent);
      border-radius: 24px;
      background:
        radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--vitrine-destaque, #1c1a19) 7%, transparent) 0%, transparent 55%),
        var(--vitrine-cartao, #ffffff);
      box-shadow: 0 18px 20px -22px color-mix(in srgb, var(--vitrine-destaque, #1c1a19) 45%, transparent),
        0 2px 6px rgba(15, 23, 42, 0.05);
    }

    /* aspas grandes no canto, na cor de destaque da loja */
    .cartao__aspas {
      position: absolute;
      top: -18px;
      right: 18px;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 140px;
      line-height: 1;
      color: var(--vitrine-destaque, #1c1a19);
      opacity: 0.1;
      pointer-events: none;
    }

    .cartao__estrelas {
      font-size: 19px;
      letter-spacing: 3px;
      color: #F2B01E;
    }

    .cartao__estrela--apagada {
      color: var(--vitrine-borda, #E3E1DE);
    }

    .cartao__texto {
      margin: 0;
      font-size: 15.5px;
      line-height: 1.6;
      color: var(--vitrine-texto, #2a2724);
      white-space: pre-line;
      overflow-wrap: anywhere;
    }

    .cartao__autor {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: auto;
      padding-top: 6px;
    }

    .cartao__inicial {
      display: grid;
      place-items: center;
      flex: none;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: var(--vitrine-destaque-fundo, var(--vitrine-destaque, #1c1a19));
      color: #ffffff;
      font-family: var(--vitrine-fonte, inherit);
      font-size: 17px;
      font-weight: 700;
    }

    .cartao__quem {
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }

    .cartao__nome {
      font-family: var(--vitrine-fonte, inherit);
      font-size: 15.5px;
      color: var(--vitrine-texto, #1c1a19);
    }

    .cartao__data {
      font-size: 12.5px;
      color: var(--vitrine-suave, #8a847e);
    }

    /* < pontinhos > */
    .controles {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }

    .seta {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      padding: 0;
      border: 1px solid color-mix(in srgb, var(--vitrine-destaque, #1c1a19) 18%, transparent);
      border-radius: 50%;
      background: var(--vitrine-cartao, #ffffff);
      color: var(--vitrine-destaque, #1c1a19);
      cursor: pointer;
      transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
    }

    .seta:hover {
      background: var(--vitrine-destaque-fundo, var(--vitrine-destaque, #1c1a19));
      color: #ffffff;
    }

    .seta:active {
      transform: scale(0.94);
    }

    .pontos {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .ponto {
      width: 7px;
      height: 7px;
      padding: 0;
      border: none;
      border-radius: 999px;
      background: color-mix(in srgb, var(--vitrine-destaque, #1c1a19) 22%, transparent);
      cursor: pointer;
      transition: width 0.3s ease, background-color 0.3s ease;
    }

    .ponto--ativo {
      width: 22px;
      background: var(--vitrine-destaque, #1c1a19);
    }

    @media (min-width: 720px) {
      .cartao {
        padding: 38px 40px 30px;
      }

      .cartao__texto {
        font-size: 17px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .trilho {
        transition: none;
      }
    }
  `,
})
export class CarrosselFeedbacksComponent implements OnInit {
  readonly feedbacks = input.required<FeedbackPublico[]>();

  protected readonly atual = signal(0);
  protected readonly pausado = signal(false);
  protected readonly estrelas = [1, 2, 3, 4, 5];
  private readonly total = computed(() => this.feedbacks().length);
  private readonly destroyRef = inject(DestroyRef);
  private inicioDoToque: number | null = null;

  ngOnInit(): void {
    const poucoMovimento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (poucoMovimento) {
      return;
    }
    const temporizador = setInterval(() => {
      if (!this.pausado() && !document.hidden && this.total() > 1) {
        this.proximo();
      }
    }, TEMPO_POR_SLIDE_MS);
    this.destroyRef.onDestroy(() => clearInterval(temporizador));
  }

  protected proximo(): void {
    this.atual.update((i) => (i + 1) % this.total());
  }

  protected anterior(): void {
    this.atual.update((i) => (i - 1 + this.total()) % this.total());
  }

  protected irPara(indice: number): void {
    this.atual.set(indice);
  }

  protected inicioToque(evento: TouchEvent): void {
    this.inicioDoToque = evento.touches[0]?.clientX ?? null;
  }

  /** Arrastar para o lado (mais de 40 px) troca o feedback. */
  protected fimToque(evento: TouchEvent): void {
    const fim = evento.changedTouches[0]?.clientX;
    if (this.inicioDoToque === null || fim === undefined) {
      return;
    }
    const distancia = fim - this.inicioDoToque;
    this.inicioDoToque = null;
    if (Math.abs(distancia) > 40) {
      if (distancia < 0) {
        this.proximo();
      } else {
        this.anterior();
      }
    }
  }

  protected inicial(nome: string): string {
    return nome.trim().charAt(0).toUpperCase();
  }

  /** "2026-10-20" -> "20 de outubro de 2026". */
  protected dataPorExtenso(data: string): string {
    const [ano, mes, dia] = data.split('-').map(Number);
    return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
