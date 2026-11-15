import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, linkedSignal, signal } from '@angular/core';

import { esperar, quandoAparecer, semMovimento } from '../movimento';
import { ConteudoLandingNova, ExemploProva } from './conteudo-landing-nova';

interface ItemProva {
  id: number;
  tipo: 'c' | 'l' | 't' | 'fim';
  texto: string;
  hora: string;
}

/**
 * A prova (estudo do MIT) na faixa azul-noite: o 21× e, ao lado, uma janelinha do WhatsApp que mostra a conversa SEM o DizAI
 * (o cliente esperando e indo embora) e depois COM o DizAI (respondido e anotado), repetindo. Começa quando entra
 * na tela.
 */
@Component({
  selector: 'app-prova-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="secao faixa mit sobre-noite">
      <div class="miolo">
        <div class="mit__texto">
          <div class="mit__numero">21<small>×</small></div>
          <span class="mit__estudo">Estudo do MIT sobre o comportamento de clientes</span>
          <h2>Responder em até <span class="grifo">5 minutos</span> deixa a chance de {{ conteudo().prova.objetivo }} <span class="grifo">21 vezes maior</span>.</h2>
          <p>E a chance de o cliente ainda estar lá para conversar é <strong>100 vezes maior</strong>. O estudo analisou mais de 15 mil contatos ao longo de 3 anos.</p>
          <cite>Fonte: "Lead Response Management Study", Dr. James Oldroyd (MIT) e InsideSales, 2007.</cite>
        </div>

        <div class="mit__palco">
          <span class="mit__selo" [class.mit__selo--com]="comDizai()">{{ comDizai() ? '✓ Com o assistente DizAI' : '✕ Sem o assistente DizAI' }}</span>
          <div class="mit__janela">
            <div class="wpp-topo">
              <img [src]="exemplo().logo" alt="" />
              <span>
                <b>{{ exemplo().loja }}</b>
                <small [class.dig]="digitando()">{{ digitando() ? 'digitando…' : comDizai() ? 'online' : 'visto por último hoje' }}</small>
              </span>
            </div>
            <div class="wpp-msgs" aria-live="polite">
              @for (item of itens(); track item.id) {
                @switch (item.tipo) {
                  @case ('t') {
                    <span class="marca-tempo msg--entra">{{ item.texto }}</span>
                  }
                  @case ('fim') {
                    <span class="mit__fim msg--entra" [class.mit__fim--com]="comDizai()">{{ item.texto }}</span>
                  }
                  @default {
                    <span class="msg msg--entra" [class.msg--cliente]="item.tipo === 'c'" [class.msg--loja]="item.tipo === 'l'">{{ item.texto }}<time>{{ item.hora }}</time></span>
                  }
                }
              }
              @if (digitando()) {
                <span class="msg msg--digitando"><i></i><i></i><i></i></span>
              }
            </div>
            <div class="wpp-campo" aria-hidden="true"><span>Mensagem</span><i></i></div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ProvaLandingComponent {
  readonly conteudo = input.required<ConteudoLandingNova>();
  protected readonly comDizai = signal(false);
  protected readonly digitando = signal(false);
  protected readonly itens = signal<ItemProva[]>([]);
  /** Os negócios em sequência (cada um: sem → com) e o da vez. */
  private readonly exemplos = computed<ExemploProva[]>(() => this.conteudo().prova.exemplos ?? [this.conteudo().prova]);
  protected readonly exemplo = linkedSignal<ExemploProva>(() => this.exemplos()[0]);

  private ativo = true;
  private proximoId = 0;

  constructor() {
    const elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    let parar = () => undefined as void;
    inject(DestroyRef).onDestroy(() => {
      this.ativo = false;
      parar();
    });
    afterNextRender(() => {
      if (semMovimento()) {
        this.comDizai.set(true);
        const prova = this.exemplos()[0];
        this.exemplo.set(prova);
        this.itens.set([...prova.com.map(([de, t, h]) => this.item(de, t, h)), this.item('fim', prova.fimCom)]);
        return;
      }
      parar = quandoAparecer(elemento, () => void this.tocar());
    });
  }

  private async tocar(): Promise<void> {
    let vez = 0;
    while (this.ativo) {
      const prova = this.exemplos()[vez++ % this.exemplos().length];
      this.exemplo.set(prova);
      this.comDizai.set(false);
      this.itens.set([]);
      for (const [de, texto, hora] of prova.sem) {
        await esperar(de === 't' ? 900 : 1200);
        if (de === 'l') {
          // a loja só responde depois ("No outro dia de manhã")
          this.digitando.set(true);
          await esperar(1100);
          this.digitando.set(false);
        }
        if (!this.ativo) return;
        this.adicionar(this.item(de, texto, hora));
      }
      await esperar(900);
      this.adicionar(this.item('fim', prova.fimSem));
      await esperar(3200);
      if (!this.ativo) return;

      this.comDizai.set(true);
      this.itens.set([]);
      for (const [de, texto, hora] of prova.com) {
        if (de === 'l') {
          this.digitando.set(true);
          await esperar(1200);
          this.digitando.set(false);
        } else {
          await esperar(1000);
        }
        if (!this.ativo) return;
        this.adicionar(this.item(de, texto, hora));
      }
      await esperar(800);
      this.adicionar(this.item('fim', prova.fimCom));
      await esperar(4200);
    }
  }

  private adicionar(item: ItemProva): void {
    this.itens.update((lista) => [...lista, item]);
  }

  private item(tipo: ItemProva['tipo'], texto: string, hora = ''): ItemProva {
    return { id: this.proximoId++, tipo, texto, hora };
  }
}
