import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChildren,
} from '@angular/core';

import { CenaPratica, ETAPAS_PRATICA, PASSOS_PRATICA } from './conteudo-vendas';
import { EtapasAvisoComponent } from './etapas-aviso.component';

/**
 * "Na prática": do primeiro "oi" ao pedido entregue, em 5 passos. No computador o palco fica preso à direita e
 * troca a cena pelo passo que está no meio da tela; no celular, a cena de cada passo vem embaixo dele.
 * O passo 4 mostra as mensagens automáticas de status saindo para o cliente.
 */
@Component({
  selector: 'app-na-pratica-vendas',
  imports: [NgTemplateOutlet, EtapasAvisoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="secao faixa nevoa" id="pratica">
      <div class="miolo">
        <div class="cabeca">
          <span class="rotulo">Na prática</span>
          <h2 class="titulo">Do primeiro "oi"<br /><span class="grifo">ao pedido entregue.</span></h2>
        </div>

        <div class="historia__grade">
          <div>
            @for (p of passos; track p.titulo; let i = $index) {
              <article class="passo" #passo [attr.data-passo]="i" [class.ativo]="i === ativo()">
                <span class="passo__num">{{ i + 1 }} de {{ passos.length }}</span>
                <h3>{{ p.titulo }}</h3>
                <p>{{ p.texto }}</p>
                <div class="cena cena-inline" [class.cena--wpp]="ehConversa(p.cena)">
                  <div class="cena__largura"><ng-container *ngTemplateOutlet="cena; context: { $implicit: p.cena }" /></div>
                </div>
              </article>
            }
          </div>

          <div class="palco" aria-hidden="true">
            <div class="palco__moldura">
              @for (p of passos; track p.titulo; let i = $index) {
                <div class="cena" [class.cena--wpp]="ehConversa(p.cena)" [class.ativa]="i === ativo()">
                  <div class="cena__largura"><ng-container *ngTemplateOutlet="cena; context: { $implicit: p.cena }" /></div>
                </div>
              }
              <div class="palco__progresso">
                @for (p of passos; track p.titulo; let i = $index) {
                  <i [class.ativo]="i === ativo()"></i>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <ng-template #cena let-tipo>
      @switch (tipo) {
        @case ('conversa') {
          <span class="cena__selo">Respondido em <b class="mono">30 s</b></span>
          <span class="msg msg--cliente">Oi! Quanto fica um bolo para 20 pessoas?<time>08:41</time></span>
          <span class="msg msg--loja">O bolo M serve 20 pessoas e fica R$ 150,00. Te mando o cardápio de sabores aqui embaixo.<time>08:41</time></span>
          <span class="msg msg--arquivo"><span class="pdf">PDF</span><span><b>Cardápio de sabores.pdf</b><small>enviado agora</small></span></span>
        }
        @case ('resumo') {
          <div class="cartao">
            <div class="cartao__topo"><span>Resumo do pedido</span><span class="mono">R$ 160,00</span></div>
            <div class="linha-dado"><span>Bolo M</span><span>20 pessoas</span></div>
            <div class="linha-dado"><span>Recheio</span><span>Ninho e morango</span></div>
            <div class="linha-dado"><span>Adicional</span><span>Crocante</span></div>
            <div class="linha-dado"><span>Retirada</span><span>Sábado, 15:00</span></div>
          </div>
          <span class="cena__selo cena__selo--verde">✓ Prazo de preparo conferido</span>
        }
        @case ('confirmar') {
          <div class="cartao">
            <div class="cartao__topo"><span>Ana Souza</span><span class="status status--pronto">Para confirmar</span></div>
            <div class="linha-dado"><span>Itens</span><span>Bolo M · ninho e morango</span></div>
            <div class="linha-dado"><span>Total</span><span class="mono">R$ 160,00</span></div>
            <div class="acoes-cartao">
              <span class="btn btn--escuro btn--pequeno btn--toque">✓ Confirmar pedido</span>
              <span class="btn btn--linha btn--pequeno">Abrir conversa</span>
            </div>
          </div>
          <span class="cena__selo">Quem confirma é você</span>
        }
        @case ('etapas') {
          <app-etapas-aviso [etapas]="etapasPratica" hora="14:52" />
        }
        @case ('numeros') {
          <div class="cartao">
            <div class="cartao__topo"><span class="cartao__legenda">Faturamento · 30 dias</span></div>
            <div class="valor-grande">R$ 4.820,00</div>
            <div class="barras">
              @for (altura of barras; track $index) {
                <i [class.alta]="altura === 100" [style.height.%]="altura" [style.--i]="$index"></i>
              }
            </div>
          </div>
          <span class="insight">Sábado é o dia que mais vende</span>
          <span class="insight">Melhor cliente: Ana, 6 pedidos</span>
        }
      }
    </ng-template>
  `,
})
export class NaPraticaVendasComponent {
  protected readonly passos = PASSOS_PRATICA;
  protected readonly etapasPratica = ETAPAS_PRATICA;
  protected readonly barras = [38, 30, 52, 46, 74, 100, 22];
  protected readonly ativo = signal(0);

  private readonly elementosPasso = viewChildren('passo', { read: ElementRef });

  constructor() {
    let observador: IntersectionObserver | undefined;
    inject(DestroyRef).onDestroy(() => observador?.disconnect());
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      // o passo que cruza a faixa do meio da tela escolhe a cena do palco
      observador = new IntersectionObserver(
        (entradas) => {
          for (const entrada of entradas) {
            if (entrada.isIntersecting) {
              this.ativo.set(Number((entrada.target as HTMLElement).dataset['passo']));
            }
          }
        },
        { rootMargin: '-45% 0px -45% 0px' },
      );
      for (const passo of this.elementosPasso()) {
        observador.observe(passo.nativeElement as HTMLElement);
      }
    });
  }

  protected ehConversa(cena: CenaPratica): boolean {
    return cena === 'conversa' || cena === 'etapas';
  }
}
