import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

import { IconeComponent } from '../../../../shared/components/icone/icone.component';
import type { TipoNegocio } from '../secao-recursos.component';
import { GANHOS_NEGOCIO } from './ganhos-negocio';

/** Arrastar mais que isso no cartão (celular) troca de ganho. */
const ARRASTE_MINIMO = 48;

/**
 * Recursos → "O que muda no seu negócio": os ganhos do tipo escolhido (Produtos | Serviços), um por vez, num cartão
 * quadrado que passa sozinho. O tempo de cada um é a própria animação da barrinha de progresso (`animationend` passa
 * para o próximo), então pausar é só parar a animação: mouse em cima, foco no teclado ou a seção fora da tela.
 * No computador, à esquerda, o título e o índice dos ganhos (tocar em um vai direto a ele).
 */
@Component({
  selector: 'app-ganhos-negocio',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ganhos-negocio.component.html',
  styleUrls: ['./ganhos-negocio.component.css', './ganhos-cartao.css'],
  host: {
    '[class.pausado]': 'pausado()',
    '(mouseenter)': 'sobre.set(true)',
    '(mouseleave)': 'sobre.set(false)',
    '(focusin)': 'focado.set(true)',
    '(focusout)': 'focado.set(false)',
  },
})
export class GanhosNegocioComponent {
  readonly tipo = input.required<TipoNegocio>();

  protected readonly ganhos = computed(() => GANHOS_NEGOCIO[this.tipo()]);
  protected readonly indice = signal(0);
  protected readonly atual = computed(() => this.ganhos()[this.indice()]);

  protected readonly sobre = signal(false);
  protected readonly focado = signal(false);
  private readonly naTela = signal(false);
  protected readonly pausado = computed(() => this.sobre() || this.focado() || !this.naTela());

  private inicioDoArraste: number | null = null;

  constructor() {
    // trocou Produtos | Serviços: começa do primeiro
    effect(() => {
      this.tipo();
      this.indice.set(0);
    });
    const elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    let observador: IntersectionObserver | undefined;
    afterNextRender(() => {
      observador = new IntersectionObserver(([entrada]) => this.naTela.set(entrada.isIntersecting), { threshold: 0.35 });
      observador.observe(elemento);
    });
    inject(DestroyRef).onDestroy(() => observador?.disconnect());
  }

  protected numero(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  /** No índice os títulos vão sem o ponto final (no cartão ele fica, como frase de impacto). */
  protected semPonto(titulo: string): string {
    return titulo.replace(/\.$/, '');
  }

  protected irPara(i: number): void {
    const total = this.ganhos().length;
    this.indice.set((i + total) % total);
  }

  protected proximo(): void {
    this.irPara(this.indice() + 1);
  }

  protected anterior(): void {
    this.irPara(this.indice() - 1);
  }

  protected comecarArraste(evento: PointerEvent): void {
    this.inicioDoArraste = evento.clientX;
  }

  protected terminarArraste(evento: PointerEvent): void {
    if (this.inicioDoArraste === null) return;
    const distancia = evento.clientX - this.inicioDoArraste;
    this.inicioDoArraste = null;
    if (Math.abs(distancia) < ARRASTE_MINIMO) return;
    if (distancia < 0) this.proximo();
    else this.anterior();
  }
}
