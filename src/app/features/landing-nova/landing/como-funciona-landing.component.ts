import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject, input, signal } from '@angular/core';

import { semMovimento } from '../movimento';
import { ConteudoLandingNova } from './conteudo-landing-nova';

const TEMPO_POR_SLIDE_MS = 3800;

/**
 * "Pronto em 3 passos": cadastro → WhatsApp conectado → ele atende. Os exemplos do passo 1 (o produto cadastrado)
 * e do passo 3 (a pergunta respondida com o que foi cadastrado) trocam juntos: bolo, salgados e buquê | gel, barbearia e estética.
 */
@Component({
  selector: 'app-como-funciona-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="secao faixa" id="como">
      <div class="miolo">
        <div class="cabeca cabeca--centro">
          <span class="rotulo">Apenas 3 passos</span>
          <h2 class="titulo">Como funciona o <span class="grifo">assistente de IA</span></h2>
          <p class="apoio">Você não precisa entender de tecnologia. Se você usa o WhatsApp, você usa o DizAI.</p>
        </div>

        <div class="passos-curtos">
          <article class="curto">
            <div class="curto__texto">
              <span class="curto__num"><b>1</b>Passo 1</span>
              <h3>{{ conteudo().como.cadastro[0] }}</h3>
              <p>{{ conteudo().como.cadastro[1] }}</p>
            </div>
            <div class="curto__tela">
              <div class="slides">
                @for (s of conteudo().como.slides; track s.produto; let i = $index) {
                  <div class="slide" [class.ativo]="i === atual()" [attr.aria-hidden]="i !== atual()">
                    <div class="campo-mock"><b>{{ s.produto }}</b><small class="mono">{{ s.preco }}</small></div>
                    <div class="opcao-mock">
                      <div class="opcao-mock__topo"><b>{{ s.opcao }}</b><span>{{ s.regra }}</span></div>
                      <div class="chips">
                        @for (v of s.valores; track v) {
                          <span>{{ v }}</span>
                        }
                      </div>
                    </div>
                    <div class="campo-mock"><span>{{ s.extra[0] }}</span><small class="mono">{{ s.extra[1] }}</small></div>
                  </div>
                }
              </div>
              <ng-container *ngTemplateOutlet="pontos" />
            </div>
          </article>

          <article class="curto">
            <div class="curto__texto">
              <span class="curto__num"><b>2</b>Passo 2</span>
              <h3>Conecte o seu WhatsApp</h3>
              <p>O mesmo número de sempre. Contatos pessoais ficam de fora.</p>
            </div>
            <div class="curto__tela">
              <div class="conectado">
                <span class="conectado__ok">✓</span>
                <b>WhatsApp conectado</b>
                <small>O assistente já está atendendo</small>
              </div>
            </div>
          </article>

          <article class="curto">
            <div class="curto__texto">
              <span class="curto__num"><b>3</b>Passo 3</span>
              <h3>{{ conteudo().como.atende[0] }}</h3>
              <p>{{ conteudo().como.atende[1] }}</p>
            </div>
            <div class="curto__tela curto__tela--wpp">
              <div class="slides">
                @for (s of conteudo().como.slides; track s.produto; let i = $index) {
                  <div class="slide slide--wpp" [class.ativo]="i === atual()" [attr.aria-hidden]="i !== atual()">
                    <span class="msg msg--cliente">{{ s.pergunta }}</span>
                    <span class="msg msg--loja">{{ s.resposta }}</span>
                    <span class="selo-ok">{{ conteudo().como.selo }}</span>
                  </div>
                }
              </div>
              <ng-container *ngTemplateOutlet="pontos" />
            </div>
          </article>
        </div>
        @if (conteudo().tipo === 'produtos') {
          <p class="tempo-total">Um cadastro simples e guiado, pensado para não tomar o seu tempo.</p>
        } @else {
          <p class="tempo-total">Do cadastro ao primeiro atendimento: <b>poucos minutos.</b></p>
        }
      </div>
    </section>

    <ng-template #pontos>
      <div class="pontos-slide" aria-hidden="true">
        @for (s of conteudo().como.slides; track s.produto; let i = $index) {
          <i [class.ativo]="i === atual()"></i>
        }
      </div>
    </ng-template>
  `,
  imports: [NgTemplateOutlet],
})
export class ComoFuncionaLandingComponent {
  readonly conteudo = input.required<ConteudoLandingNova>();
  protected readonly atual = signal(0);

  constructor() {
    let relogio: ReturnType<typeof setInterval> | undefined;
    inject(DestroyRef).onDestroy(() => clearInterval(relogio));
    afterNextRender(() => {
      if (semMovimento()) return;
      relogio = setInterval(() => {
        if (!document.hidden) this.atual.update((i) => (i + 1) % this.conteudo().como.slides.length);
      }, TEMPO_POR_SLIDE_MS);
    });
  }
}
