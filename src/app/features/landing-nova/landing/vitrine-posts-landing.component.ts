import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { semMovimento } from '../movimento';
import { ConteudoLandingNova } from './conteudo-landing-nova';
import { CampanhasLandingComponent } from './campanhas-landing.component';
import { VitrineMockComponent } from './vitrine-mock.component';

const TEMPO_POR_ARTE_MS = 3200;
const POSICOES = ['centro', 'direita', 'esquerda'] as const;

/**
 * "Uma solução completa para o marketing do seu negócio": a vitrine pública (texto + o celular com a vitrine no layout
 * novo; nos serviços, com a aba da agenda online), os posts para as redes (o leque de 3 artes: a da frente troca a cada
 * 3,2 s, para com o mouse em cima e um toque traz qualquer uma) e as campanhas no WhatsApp (`CampanhasLandingComponent`,
 * o 3º bloco, com a tela que passa os passos em slides).
 */
@Component({
  selector: 'app-vitrine-posts-landing',
  imports: [RouterLink, VitrineMockComponent, CampanhasLandingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let c = conteudo();
    <section class="secao faixa vp" id="vitrine">
      <div class="miolo">
        <div class="cabeca cabeca--centro">
          <span class="rotulo">Marketing</span>
          <h2 class="titulo">Uma solução completa<br /><span class="grifo">para o marketing do seu negócio.</span></h2>
          <p class="apoio">Uma página personalizada, posts automáticos para as suas redes sociais e campanhas de marketing no WhatsApp.</p>
        </div>

        <div class="vp__bloco">
          <div class="vp__texto">
            <span class="etiqueta-vp">{{ c.tipo === 'servicos' ? 'Vitrine e agenda online' : 'Vitrine pública' }}</span>
            <h3>Uma página com a cara do seu negócio.</h3>
            <p>{{ c.vitrine.texto }}</p>
            <ul class="lista-checks vp__lista">
              @for (item of c.vitrine.itens; track item) {
                <li><span class="check">✓</span><span>{{ item }}</span></li>
              }
            </ul>
            <a class="btn btn--forte" routerLink="/cadastro" [queryParams]="{ tipo: c.tipo }">Criar a minha vitrine →</a>
          </div>
          <div class="vp__visual"><app-vitrine-mock [variante]="c.tipo" /></div>
        </div>

        <div class="vp__bloco vp__bloco--invertido">
          <div class="vp__texto">
            <span class="etiqueta-vp">Posts para as redes sociais</span>
            <h3>Posts profissionais em 3 toques.</h3>
            <p>{{ c.vitrine.textoPosts }}</p>
            <div class="diferenciais">
              @for (d of c.vitrine.diferenciais; track d[0]; let i = $index) {
                <div class="diferencial"><i>{{ i + 1 }}</i><span><b>{{ d[0] }}</b><small>{{ d[1] }}</small></span></div>
              }
            </div>
            <a class="btn btn--forte" routerLink="/cadastro" [queryParams]="{ tipo: c.tipo }">Criar minhas artes de graça →</a>
          </div>
          <div class="vp__visual">
            <div class="leque" aria-label="Exemplos de artes geradas" (mouseenter)="pausado = true" (mouseleave)="pausado = false">
              @for (arte of c.vitrine.artes; track arte.loja; let i = $index) {
                <button
                  type="button"
                  [class]="'arte arte--' + arte.estilo + ' arte--' + posicao(i)"
                  [style.background-image]="'url(' + arte.foto + ')'"
                  [attr.aria-label]="'Ver a arte da ' + arte.loja"
                  (click)="frente.set(i)"
                >
                  <small>{{ arte.loja }}</small>
                  <b>{{ arte.titulo }}</b>
                  <span>{{ arte.botao }}</span>
                </button>
              }
            </div>
          </div>
        </div>

        <app-campanhas-landing [conteudo]="c" />
      </div>
    </section>
  `,
})
export class VitrinePostsLandingComponent {
  readonly conteudo = input.required<ConteudoLandingNova>();

  protected readonly frente = signal(1);
  protected pausado = false;

  constructor() {
    let relogio: ReturnType<typeof setInterval> | undefined;
    inject(DestroyRef).onDestroy(() => clearInterval(relogio));
    afterNextRender(() => {
      if (semMovimento()) return;
      relogio = setInterval(() => {
        if (!this.pausado && !document.hidden) this.frente.update((i) => (i + 1) % POSICOES.length);
      }, TEMPO_POR_ARTE_MS);
    });
  }

  /** A arte da frente fica no centro; a seguinte à direita e a anterior à esquerda. */
  protected posicao(indice: number): string {
    return POSICOES[(indice - this.frente() + POSICOES.length) % POSICOES.length];
  }
}
