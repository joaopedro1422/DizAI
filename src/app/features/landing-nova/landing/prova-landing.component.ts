import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, linkedSignal, signal } from '@angular/core';

import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { esperar, quandoAparecer, semMovimento } from '../movimento';
import { CenaGestao, CenasGestaoComponent } from './cenas-gestao.component';
import { ConteudoLandingNova, ExemploProva } from './conteudo-landing-nova';

interface ItemProva {
  id: number;
  tipo: 'c' | 'l' | 't' | 'fim';
  texto: string;
  hora: string;
}

type Cena = 'conversa' | CenaGestao;

/** As abas embaixo da janela na "A solução": uma por cena. */
const CENAS: { id: Cena; rotulo: string }[] = [
  { id: 'conversa', rotulo: 'Atendimento' },
  { id: 'pedidos', rotulo: 'Pedidos' },
  { id: 'financeiro', rotulo: 'Financeiro' },
];

/**
 * A faixa azul-noite depois do problema. Agendamentos: a prova (estudo do MIT) com o 21× e, ao lado, uma janelinha do
 * WhatsApp que mostra a conversa SEM o DizAI (o cliente esperando e indo embora) e depois COM o DizAI. Vendas
 * (`prova.solucao`): vira "A solução" (logo, título e descrição) e a janela passa também pelos pedidos (caderno ×
 * painel) e pelo financeiro (conta de cabeça × Números). Começa quando entra na tela.
 */
@Component({
  selector: 'app-prova-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LogoComponent, CenasGestaoComponent],
  template: `
    <section class="secao faixa mit sobre-noite" [class.mit--solucao]="!!conteudo().prova.solucao">
      <div class="miolo">
        @if (conteudo().prova.solucao; as solucao) {
          <div class="mit__texto solucao-mit">
            <span class="solucao-mit__rotulo">A solução</span>
            <app-logo class="solucao-mit__logo" [tamanhoSimbolo]="62" [tamanhoTexto]="46" />
            <h2>{{ solucao.titulo[0] }}<br /><span class="grifo">{{ solucao.titulo[1] }}</span></h2>
            <p>{{ solucao.descricao }}</p>
          </div>
        } @else {
        <div class="mit__texto">
          <div class="mit__numero">21<small>×</small></div>
          <span class="mit__estudo">Estudo do MIT sobre o comportamento de clientes</span>
          <h2>Responder em até <span class="grifo">5 minutos</span> deixa a chance de {{ conteudo().prova.objetivo }} <span class="grifo">21 vezes maior</span>.</h2>
          <p>E a chance de o cliente ainda estar lá para conversar é <strong>100 vezes maior</strong>. O estudo analisou mais de 15 mil contatos ao longo de 3 anos.</p>
          <cite><a href="https://www.mortech.com/hs-fs/hub/25649/file-13535879-pdf/docs/mit_study.pdf" target="_blank" rel="noopener">Fonte: "Lead Response Management Study", Dr. James Oldroyd (MIT) e InsideSales, 2007 ↗</a></cite>
        </div>
        }

        <div class="mit__palco">
          <span class="mit__selo" [class.mit__selo--com]="comDizai()">{{ textoSelo() }}</span>
          <div class="mit__janela" [class.mit__janela--tela]="cena() !== 'conversa'">
            @if (cena() !== 'conversa') {
              <app-cenas-gestao [cena]="cenaGestao()" [com]="comDizai()" />
            } @else {
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
            }
          </div>
          @if (conteudo().prova.solucao) {
            <div class="mit__cenas" aria-hidden="true">
              @for (item of cenas; track item.id) {
                <span [class.ativa]="item.id === cena()">{{ item.rotulo }}</span>
              }
            </div>
          }
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
  /** A cena da janela: a conversa ou, na "A solução", os pedidos e o financeiro. */
  protected readonly cena = signal<Cena>('conversa');
  protected readonly cenaGestao = computed<CenaGestao>(() => (this.cena() === 'financeiro' ? 'financeiro' : 'pedidos'));
  protected readonly cenas = CENAS;
  protected readonly textoSelo = computed(() => {
    const nome = this.conteudo().prova.solucao ? 'o DizAI' : 'o assistente DizAI';
    return this.comDizai() ? `✓ Com ${nome}` : `✕ Sem ${nome}`;
  });

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
      // começa quando a janela (não a seção) está bem visível, e só depois de 1 s
      const palco = elemento.querySelector('.mit__palco') ?? elemento;
      parar = quandoAparecer(palco, () => void esperar(1000).then(() => this.tocar()), 0.6);
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

      // "A solução": depois da conversa, os pedidos e o financeiro (sem → com); a animação de cada uma é do CSS
      if (this.conteudo().prova.solucao) {
        for (const [cena, sem, com] of [['pedidos', 6400, 12400], ['financeiro', 6000, 10500]] as const) {
          if (!this.ativo) return;
          this.cena.set(cena);
          this.comDizai.set(false);
          await esperar(sem);
          if (!this.ativo) return;
          this.comDizai.set(true);
          await esperar(com);
        }
        this.cena.set('conversa');
      }
    }
  }

  private adicionar(item: ItemProva): void {
    this.itens.update((lista) => [...lista, item]);
  }

  private item(tipo: ItemProva['tipo'], texto: string, hora = ''): ItemProva {
    return { id: this.proximoId++, tipo, texto, hora };
  }
}
