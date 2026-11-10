import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject, input, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CelularMockComponent } from '../celular-mock.component';
import { esperar, semMovimento } from '../movimento';
import { TituloDigitandoComponent } from '../titulo-digitando.component';
import { ConteudoLandingNova, ConversaHero, DeMensagem } from './conteudo-landing-nova';

interface MensagemNaTela {
  id: number;
  de: DeMensagem;
  texto: string;
  hora: string | null;
}

/** No celular cabem 7 mensagens; as mais antigas saem por cima. */
const MAXIMO_NA_TELA = 7;

/**
 * Topo das landings da marca nova (azul-noite): o título que digita, os botões, as garantias e o celular com a conversa
 * ao vivo. As mensagens chegam uma a uma, com o "digitando…" antes de cada resposta da loja; no fim, o aviso
 * ("Pedido anotado" / "Novo horário na agenda") e a conversa recomeça. Os segmentos embaixo trocam a loja.
 */
@Component({
  selector: 'app-hero-landing',
  imports: [RouterLink, CelularMockComponent, TituloDigitandoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero faixa" id="topo">
      <div class="miolo">
        <div class="hero__texto">
          <span class="hero__selo"><i></i>Assistente de IA para o seu WhatsApp</span>
          <h1 class="hero__titulo" aria-label="Nenhum cliente sem resposta"><app-titulo-digitando /></h1>
          <p class="hero__desc">{{ conteudo().hero.descricao }}</p>
          <div class="hero__acoes">
            <a class="btn btn--forte" routerLink="/cadastro" [queryParams]="{ tipo: conteudo().tipo }">Testar de graça →</a>
            <a class="btn btn--claro" [routerLink]="conteudo().rota" fragment="como">Ver como funciona</a>
          </div>
          <ul class="hero__garantias">
            @for (garantia of conteudo().hero.garantias; track garantia) {
              <li><span class="check">✓</span>{{ garantia }}</li>
            }
          </ul>
        </div>

        <div class="palco-hero">
          @if (conversa(); as atual) {
          <app-celular-mock [cortado]="true" style="--celular-largura: 350px; --celular-altura: 590px">
            <div class="wpp-topo">
              <img [src]="atual.logo" alt="" />
              <span>
                <b>{{ atual.loja }}</b>
                <small [class.dig]="digitando()">{{ digitando() ? 'digitando…' : 'online' }}</small>
              </span>
            </div>
            <div class="wpp-msgs" aria-live="polite">
              @for (m of mensagens(); track m.id) {
                @if (m.de === 'a') {
                  <span class="msg msg--arquivo msg--entra"><span class="pdf">PDF</span><span><b>{{ m.texto }}</b><small>enviado agora</small></span></span>
                } @else {
                  <span class="msg msg--entra" [class.msg--cliente]="m.de === 'c'" [class.msg--loja]="m.de === 'l'">{{ m.texto }}<time>{{ m.hora }}</time></span>
                }
              }
              @if (digitando()) {
                <span class="msg msg--digitando" aria-label="digitando"><i></i><i></i><i></i></span>
              }
            </div>
            <div class="wpp-campo" aria-hidden="true"><span>Mensagem</span><i></i></div>
          </app-celular-mock>

          <div class="aviso-flutuante" [class.visivel]="avisoVisivel()" aria-hidden="true">
            <span class="aviso-flutuante__icone">✓</span>
            <span><b>{{ atual.aviso[0] }}</b><small>{{ atual.aviso[1] }}</small></span>
          </div>
          }

          <div class="seg" role="group" aria-label="Exemplo de negócio">
            @for (c of conteudo().hero.conversas; track c.chave) {
              <button type="button" [attr.aria-pressed]="c.chave === conversa().chave" (click)="tocar(c)">{{ c.rotulo }}</button>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HeroLandingComponent {
  readonly conteudo = input.required<ConteudoLandingNova>();

  /** A conversa à vista (nasce com a primeira do tipo; os segmentos trocam). */
  protected readonly conversa = linkedSignal<ConversaHero>(() => this.conteudo().hero.conversas[0]);
  protected readonly mensagens = signal<MensagemNaTela[]>([]);
  protected readonly digitando = signal(false);
  protected readonly avisoVisivel = signal(false);

  /** Cada toque num segmento começa uma execução nova; a antiga para no próximo passo. */
  private execucao = 0;
  private ativo = true;
  private proximoId = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.ativo = false;
      this.execucao++;
    });
    afterNextRender(() => void this.tocar(this.conteudo().hero.conversas[0]));
  }

  protected async tocar(conversa: ConversaHero): Promise<void> {
    const minha = ++this.execucao;
    const vale = () => this.ativo && minha === this.execucao;
    this.conversa.set(conversa);
    this.mensagens.set([]);
    this.digitando.set(false);
    this.avisoVisivel.set(false);
    const hora = (i: number) => `10:${String(14 + i).padStart(2, '0')}`;

    if (semMovimento()) {
      this.mensagens.set(conversa.msgs.map(([de, texto], i) => this.nova(de, texto, de === 'a' ? null : hora(i))));
      this.avisoVisivel.set(true);
      return;
    }

    for (let i = 0; i < conversa.msgs.length; i++) {
      const [de, texto] = conversa.msgs[i];
      if (de !== 'c') {
        this.digitando.set(true);
        await esperar(de === 'a' ? 700 : 1300);
        if (!vale()) return;
        this.digitando.set(false);
      } else {
        await esperar(i === 0 ? 500 : 1100);
        if (!vale()) return;
      }
      this.mensagens.update((lista) => [...lista, this.nova(de, texto, de === 'a' ? null : hora(i))].slice(-MAXIMO_NA_TELA));
    }
    await esperar(600);
    if (!vale()) return;
    this.avisoVisivel.set(true);
    await esperar(5200);
    if (!vale()) return;
    void this.tocar(conversa);
  }

  private nova(de: DeMensagem, texto: string, hora: string | null): MensagemNaTela {
    return { id: this.proximoId++, de, texto, hora };
  }
}
