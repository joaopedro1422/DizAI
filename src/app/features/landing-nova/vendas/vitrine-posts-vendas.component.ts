import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { semMovimento } from '../movimento';
import { ARTES_POSTS } from './conteudo-vendas';
import { VitrineMockComponent } from './vitrine-mock.component';

const TEMPO_POR_ARTE_MS = 3200;
const POSICOES = ['centro', 'direita', 'esquerda'] as const;

/**
 * "E ainda vem junto": a vitrine pública (texto + o celular com a vitrine no layout novo) e os posts para as redes
 * (o leque de 3 artes: a da frente troca a cada 3,2 s, para com o mouse em cima e um toque traz qualquer uma).
 */
@Component({
  selector: 'app-vitrine-posts-vendas',
  imports: [RouterLink, VitrineMockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="secao faixa vp" id="vitrine">
      <div class="miolo">
        <div class="cabeca cabeca--centro">
          <span class="rotulo">E ainda vem junto</span>
          <h2 class="titulo">A sua vitrine e os seus posts,<br /><span class="grifo">prontos para o Instagram.</span></h2>
          <p class="apoio">Tudo com a sua logo, as suas cores e as suas fotos. De graça, mesmo sem ligar o assistente.</p>
        </div>

        <div class="vp__bloco">
          <div class="vp__texto">
            <span class="etiqueta-vp">Vitrine pública</span>
            <h3>Uma página com a cara do seu negócio.</h3>
            <p>O link para a bio do Instagram e para mandar no WhatsApp. O cliente vê os seus trabalhos, as avaliações e o horário, e já faz a encomenda.</p>
            <ul class="lista-checks vp__lista">
              @for (item of itensVitrine; track item) {
                <li><span class="check">✓</span><span>{{ item }}</span></li>
              }
            </ul>
            <a class="btn btn--forte" routerLink="/cadastro" [queryParams]="{ tipo: 'produtos' }">Criar a minha vitrine →</a>
          </div>
          <div class="vp__visual"><app-vitrine-mock /></div>
        </div>

        <div class="vp__bloco vp__bloco--invertido">
          <div class="vp__texto">
            <span class="etiqueta-vp">Posts para as redes sociais</span>
            <h3>Posts profissionais em 3 toques.</h3>
            <p>Escolha o que divulgar e receba as artes prontas para o feed e o story, com a legenda escrita.</p>
            <div class="diferenciais">
              @for (d of diferenciais; track d[0]; let i = $index) {
                <div class="diferencial"><i>{{ i + 1 }}</i><span><b>{{ d[0] }}</b><small>{{ d[1] }}</small></span></div>
              }
            </div>
            <a class="btn btn--forte" routerLink="/cadastro" [queryParams]="{ tipo: 'produtos' }">Criar minhas artes de graça →</a>
          </div>
          <div class="vp__visual">
            <div class="leque" aria-label="Exemplos de artes geradas" (mouseenter)="pausado = true" (mouseleave)="pausado = false">
              @for (arte of artes; track arte.loja; let i = $index) {
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
      </div>
    </section>
  `,
})
export class VitrinePostsVendasComponent {
  protected readonly artes = ARTES_POSTS;
  protected readonly frente = signal(1);
  protected pausado = false;
  protected readonly itensVitrine = [
    'Portfólio com as fotos separadas por tema',
    'Avaliações dos clientes, com estrelas',
    'Horário, pagamento e entrega à vista',
    'Endereço com mapa e o botão do WhatsApp',
  ];
  protected readonly diferenciais: [string, string][] = [
    ['Com a sua identidade', 'A sua logo, as suas cores, as suas fotos e a fonte da sua vitrine.'],
    ['Com os seus dados de verdade', 'Preços, cardápio e encomendas abertas, tirados do seu cadastro.'],
    ['Legenda pronta', 'Título, chamada e hashtags. É baixar e postar.'],
  ];

  constructor() {
    let relogio: ReturnType<typeof setInterval> | undefined;
    inject(DestroyRef).onDestroy(() => clearInterval(relogio));
    afterNextRender(() => {
      if (semMovimento()) return;
      relogio = setInterval(() => {
        if (!this.pausado && !document.hidden) this.frente.update((i) => (i + 1) % ARTES_POSTS.length);
      }, TEMPO_POR_ARTE_MS);
    });
  }

  /** A arte da frente fica no centro; a seguinte à direita e a anterior à esquerda. */
  protected posicao(indice: number): string {
    return POSICOES[(indice - this.frente() + ARTES_POSTS.length) % ARTES_POSTS.length];
  }
}
