import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, input, signal } from '@angular/core';

import { primeiroNome } from '../../../core/models/pedido.model';
import { EstadoVazioComponent } from '../../../shared/components/estado-vazio/estado-vazio.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { AGRADECIMENTO_PADRAO, AVISO_PRONTO_PADRAO, formatarReal, preencherAviso } from '../../pedidos/textos-pedido';
import { PedidoDemo } from '../conversas-demonstracao';

/**
 * lista → toque no botão da ação → janela (com a mensagem que vai para o cliente) → toque em "Marcar como…" → feito.
 * Pronto: o pedido passa para "Prontos". Entregue: sai da lista.
 */
type Fase = 'lista' | 'toque-acao' | 'janela' | 'toque-marcar' | 'feito';

/** Quando o lojista rola a tela até os botões do card (o "Entregue" fica abaixo da dobra no celular). */
const ROLAGEM_MS = 1100;

/** Quando cada fase começa (ms). Cabe no DURACAO_TELA_MS.pedidos do reprodutor. */
const ROTEIRO: [number, Fase][] = [
  [2300, 'toque-acao'],
  [2700, 'janela'],
  [5600, 'toque-marcar'],
  [6000, 'feito'],
];

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
  /** O que o lojista toca: "Pedido pronto" (o pedido está em preparo) ou "Entregue" (já está pronto). */
  readonly acao = input<'pronto' | 'entregue'>('entregue');

  protected readonly fase = signal<Fase>('lista');
  protected readonly valor = computed(() => formatarReal(this.pedido().valor));
  protected readonly primeiroNome = computed(() => primeiroNome(this.pedido().nome));
  protected readonly agradecimento = computed(() =>
    preencherAviso(this.acao() === 'pronto' ? AVISO_PRONTO_PADRAO : AGRADECIMENTO_PADRAO, this.pedido().nome, this.pedido().valor),
  );
  /** Pronto: antes do toque está em preparo e depois, pronto. Entregue: já começa pronto. */
  protected readonly estaPronto = computed(() => this.acao() === 'entregue' || this.fase() === 'feito');
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
