import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { FeedbackPublico } from '../../../core/models/loja-publica.model';

/** Tópico de feedbacks da vitrine: a nota média em destaque e os depoimentos em cartões (rolagem para o lado). */
@Component({
  selector: 'app-avaliacoes-vitrine',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="resumo">
      <strong class="resumo__nota">{{ nota() }}</strong>
      <span class="resumo__textos">
        <span class="estrelas" [attr.aria-label]="'Nota ' + nota() + ' de 5'">
          @for (n of cinco; track n) {
            <span [class.estrela--apagada]="n > notaArredondada()">★</span>
          }
        </span>
        <span class="resumo__total">{{ total() }}</span>
      </span>
    </div>

    <ul class="lista" [class.lista--uma]="feedbacks().length === 1">
      @for (feedback of feedbacks(); track feedback.id) {
        <li class="cartao">
          <span class="estrelas estrelas--pequenas" [attr.aria-label]="feedback.estrelas + ' de 5 estrelas'">
            @for (n of cinco; track n) {
              <span [class.estrela--apagada]="n > feedback.estrelas">★</span>
            }
          </span>
          <blockquote class="cartao__texto">“{{ feedback.texto }}”</blockquote>
          <span class="cartao__autor">
            <span class="cartao__inicial" aria-hidden="true">{{ inicial(feedback.nome) }}</span>
            <span>
              <strong>{{ feedback.nome }}</strong>
              @if (feedback.data) {
                <small>{{ mesAno(feedback.data) }}</small>
              }
            </span>
          </span>
        </li>
      }
    </ul>
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 14px; }
    .resumo { display: flex; align-items: center; gap: 14px; }
    .resumo__nota { font-family: var(--vitrine-fonte); font-size: 44px; font-weight: 600; line-height: 1; color: var(--vitrine-texto); }
    .resumo__textos { display: flex; flex-direction: column; gap: 3px; }
    .resumo__total { font-size: 13px; color: var(--vitrine-suave); }
    .estrelas { color: #e2a400; font-size: 17px; letter-spacing: 1px; line-height: 1; }
    .estrelas--pequenas { font-size: 14px; }
    .estrela--apagada { color: color-mix(in srgb, var(--vitrine-suave) 35%, transparent); }
    .lista {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 84%;
      gap: 10px;
      margin: 0 -24px;
      padding: 2px 24px 6px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-padding: 0 24px;
      scrollbar-width: none;
      list-style: none;
    }
    .lista::-webkit-scrollbar { display: none; }
    .lista--uma { grid-auto-columns: 100%; }
    .cartao {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 16px;
      border: 1px solid var(--vitrine-borda);
      border-radius: 18px;
      background: var(--vitrine-cartao, #ffffff);
      scroll-snap-align: start;
    }
    .cartao__texto { flex: 1; margin: 0; font-size: 14.5px; line-height: 1.55; color: var(--vitrine-texto); }
    .cartao__autor { display: flex; align-items: center; gap: 10px; font-size: 13.5px; }
    .cartao__autor strong { display: block; color: var(--vitrine-texto); }
    .cartao__autor small { display: block; font-size: 12px; color: var(--vitrine-suave); }
    .cartao__inicial {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      flex: none;
      border-radius: 50%;
      background: var(--vitrine-destaque-fundo, var(--vitrine-destaque));
      color: #ffffff;
      font-size: 13px;
      font-weight: 700;
    }
  `,
})
export class AvaliacoesVitrineComponent {
  readonly feedbacks = input.required<FeedbackPublico[]>();

  protected readonly cinco = [1, 2, 3, 4, 5];
  private readonly media = computed(() => {
    const lista = this.feedbacks();
    return lista.reduce((soma, f) => soma + f.estrelas, 0) / Math.max(1, lista.length);
  });
  protected readonly nota = computed(() =>
    this.media().toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
  );
  protected readonly notaArredondada = computed(() => Math.round(this.media()));
  protected readonly total = computed(() => {
    const n = this.feedbacks().length;
    return `${n} ${n === 1 ? 'avaliação' : 'avaliações'}`;
  });

  protected inicial(nome: string): string {
    return nome.trim().charAt(0).toUpperCase();
  }

  /** "2026-03-14" -> "março de 2026". */
  protected mesAno(data: string): string {
    const [ano, mes] = data.split('-').map(Number);
    return new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }
}
