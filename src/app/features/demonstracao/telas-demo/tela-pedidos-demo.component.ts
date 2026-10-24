import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, input, signal } from '@angular/core';

import { primeiroNome } from '../../../core/models/pedido.model';
import { EstadoVazioComponent } from '../../../shared/components/estado-vazio/estado-vazio.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { AGRADECIMENTO_PADRAO, formatarReal, preencherAviso } from '../../pedidos/textos-pedido';
import { PedidoDemo } from '../conversas-demonstracao';

/** lista → toque em "Entregue" → janela "Pedido entregue" → toque em "Marcar como entregue" → lista vazia. */
type Fase = 'lista' | 'toque-entregue' | 'janela' | 'toque-marcar' | 'entregue';

/** Quando o lojista rola a tela até os botões do card (o "Entregue" fica abaixo da dobra no celular). */
const ROLAGEM_MS = 1100;

/** Quando cada fase começa (ms). Cabe no DURACAO_TELA_MS.pedidos do reprodutor. */
const ROTEIRO: [number, Fase][] = [
  [2300, 'toque-entregue'],
  [2700, 'janela'],
  [5600, 'toque-marcar'],
  [6000, 'entregue'],
];

/**
 * A tela Pedidos do painel no celular, no tamanho real: o pedido que acabou de ser confirmado em preparo, o toque em
 * "Entregue" e a janela com o agradecimento que vai pelo WhatsApp. Mesmo HTML e as mesmas classes da tela real
 * (pedidos-page, pedido-card, bottom-sheet, acao-pedido e aviso-cliente; o CSS é a cópia das regras de celular).
 */
@Component({
  selector: 'app-tela-pedidos-demo',
  imports: [IconeComponent, EstadoVazioComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tela-pedidos-demo.component.html',
  styleUrls: ['./tela-pedidos-demo.component.css', './telas-demo.css'],
  // a tela rola por dentro do celular, como a página de verdade (sem barra de rolagem)
  styles: `
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      scrollbar-width: none;
    }
  `,
})
export class TelaPedidosDemoComponent {
  readonly pedido = input.required<PedidoDemo>();

  protected readonly fase = signal<Fase>('lista');
  protected readonly valor = computed(() => formatarReal(this.pedido().valor));
  protected readonly primeiroNome = computed(() => primeiroNome(this.pedido().nome));
  protected readonly agradecimento = computed(() =>
    preencherAviso(AGRADECIMENTO_PADRAO, this.pedido().nome, this.pedido().valor),
  );
  protected readonly janelaAberta = computed(() => this.fase() === 'janela' || this.fase() === 'toque-marcar');

  constructor() {
    const tela = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const temporizadores = ROTEIRO.map(([ms, fase]) => setTimeout(() => this.fase.set(fase), ms));
    temporizadores.push(
      setTimeout(() => {
        const acoes = tela.querySelector<HTMLElement>('.pedido-card .acoes');
        if (acoes) {
          tela.scrollTo({ top: acoes.offsetTop + acoes.offsetHeight + 24 - tela.clientHeight, behavior: 'smooth' });
        }
      }, ROLAGEM_MS),
    );
    inject(DestroyRef).onDestroy(() => temporizadores.forEach(clearTimeout));
  }
}
