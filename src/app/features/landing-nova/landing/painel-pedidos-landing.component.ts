import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';

/** Largura em que a tela do computador é desenhada; ela é reduzida para caber no card (sem aumentar a altura dele). */
const LARGURA_TELA = 900;

interface PedidoTela {
  nome: string;
  detalhe: string;
  itens: [string, string][];
  valor: string;
  pago?: string;
}

const EM_PREPARO: PedidoTela[] = [
  {
    nome: 'Ana Souza',
    detalhe: '(83) 98812-4410 · confirmado há 2 h',
    itens: [['Itens', '100 coxinhas + 50 kibes'], ['Retirada', 'Sábado, 15:00'], ['Pagamento', 'Pix na retirada']],
    valor: 'R$ 135,00',
  },
  {
    nome: 'Carlos Lima',
    detalhe: '(83) 99654-3321 · confirmado há 5 h',
    itens: [['Itens', 'Bolo de ninho 2 kg'], ['Entrega', 'Sexta, 18:00'], ['Endereço', 'Rua das Flores, 120']],
    valor: 'R$ 160,00',
    pago: 'R$ 80,00',
  },
];

const PRONTOS: PedidoTela[] = [
  {
    nome: 'Fernanda Rocha',
    detalhe: '(83) 98620-7781 · confirmado há 1 dia',
    itens: [['Itens', '200 salgados sortidos'], ['Retirada', 'Hoje, 17:00']],
    valor: 'R$ 170,00',
  },
];

/**
 * "O seu painel" no card do gerenciador de pedidos: a tela Pedidos como ela é no computador (menu lateral com
 * Pedidos, Números e Mensagens, o "Registrar pedido" no topo e o quadro Em preparo | Prontos para entregar com os
 * cards de verdade), desenhada em 900 px e reduzida para a largura do card. Ocupa o espaço livre do card; o que não
 * couber fica cortado embaixo, como numa janela.
 */
@Component({
  selector: 'app-painel-pedidos-landing',
  imports: [NgTemplateOutlet, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="painel__titulo">O seu painel</span>
    <div class="moldura" [style.height.px]="altura()">
      <div class="tela" [style.--escala]="escala()" aria-hidden="true">
        <div class="janela">
          <span class="janela__pontos"><i></i><i></i><i></i></span>
          <span class="janela__url">dizai.com/painel/pedidos</span>
        </div>
        <div class="painel">
          <aside class="menu">
            <div class="menu__topo"><small>Pedidos</small><b>Super Salgados</b></div>
            <span class="menu__item menu__item--ativo"><app-icone nome="caixa" [tamanho]="15" />Pedidos</span>
            <span class="menu__item"><app-icone nome="grafico" [tamanho]="15" />Números</span>
            <span class="menu__item"><app-icone nome="conversa" [tamanho]="15" />Mensagens</span>
            <div class="menu__chats">
              <span class="menu__chats-icone"><app-icone nome="conversa" [tamanho]="14" [espessura]="2" /></span>
              <span><b>Pedidos esperando no Chats</b><small>Confirme lá e eles vêm para cá</small></span>
            </div>
          </aside>
          <main class="conteudo">
            <div class="conteudo__topo">
              <span>
                <small>Pedidos</small>
                <b>Pedidos</b>
                <em>Os pedidos confirmados, do preparo à entrega.</em>
              </span>
              <span class="botao"><app-icone nome="mais" [tamanho]="13" [espessura]="2.4" />Registrar pedido</span>
            </div>
            <div class="quadro">
              <section class="coluna">
                <h4><i class="ponto"></i>Em preparo <span class="contador">{{ emPreparo.length }}</span></h4>
                @for (pedido of emPreparo; track pedido.nome) {
                  <ng-container [ngTemplateOutlet]="cartao" [ngTemplateOutletContext]="{ $implicit: pedido, pronto: false }" />
                }
              </section>
              <section class="coluna coluna--prontos">
                <h4><i class="ponto"></i>Prontos para entregar <span class="contador">{{ prontos.length }}</span></h4>
                @for (pedido of prontos; track pedido.nome) {
                  <ng-container [ngTemplateOutlet]="cartao" [ngTemplateOutletContext]="{ $implicit: pedido, pronto: true }" />
                }
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>

    <!-- cópia do pedido-card (topo, selo, resumo, valor e ações) -->
    <ng-template #cartao let-pedido let-pronto="pronto">
      <article class="card">
        <div class="card__topo">
          <span><b>{{ pedido.nome }}</b><small>{{ pedido.detalhe }}</small></span>
          <app-icone nome="maisOpcoes" [tamanho]="16" [espessura]="2.6" />
        </div>
        <span class="selo" [class.selo--pronto]="pronto"><i></i>{{ pronto ? 'Pronto' : 'Em preparo' }}</span>
        <dl class="resumo">
          @for (item of pedido.itens; track item[0]) {
            <div><dt>{{ item[0] }}</dt><dd>{{ item[1] }}</dd></div>
          }
        </dl>
        <div class="card__rodape">
          <span><b>{{ pedido.valor }}</b>@if (pedido.pago) {<small>Pago: {{ pedido.pago }}</small>}</span>
          <span class="whats"><app-icone nome="conversa" [tamanho]="13" /></span>
        </div>
        <div class="acoes">
          @if (!pronto) {
            <span class="acao"><app-icone nome="sino" [tamanho]="12" />Pedido pronto</span>
          }
          <span class="acao acao--sucesso"><app-icone nome="check" [tamanho]="12" [espessura]="2.4" />Entregue</span>
        </div>
      </article>
    </ng-template>
  `,
  styleUrl: './painel-pedidos-landing.css',
})
export class PainelPedidosLandingComponent {
  protected readonly emPreparo = EM_PREPARO;
  protected readonly prontos = PRONTOS;
  protected readonly escala = signal(0.4);
  /** A altura da tela reduzida: a moldura fica exatamente do tamanho dela (sem sobra branca embaixo). */
  protected readonly altura = signal<number | null>(null);

  constructor() {
    const elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    let observador: ResizeObserver | undefined;
    inject(DestroyRef).onDestroy(() => observador?.disconnect());
    afterNextRender(() => {
      const moldura = elemento.querySelector<HTMLElement>('.moldura');
      if (!moldura) return;
      const tela = elemento.querySelector<HTMLElement>('.tela');
      const medir = () => {
        const escala = moldura.clientWidth / LARGURA_TELA || 0.4;
        this.escala.set(escala);
        if (tela) this.altura.set(Math.round(tela.offsetHeight * escala));
      };
      medir();
      observador = new ResizeObserver(medir);
      observador.observe(moldura);
    });
  }
}
