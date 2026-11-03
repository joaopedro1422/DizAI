import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { TelefoneDemoComponent } from '../jornada-interativa/telefone-demo.component';
import { PASSOS_COMO_FUNCIONA, ROTEIROS_COMO_FUNCIONA, TipoComoFunciona } from './como-funciona';

/**
 * "Como funciona" (no lugar dos 3 cartões e da demonstração longa): os 3 passos à esquerda e o celular à direita, um
 * passo por vez (~20 s o ciclo). Cada passo é uma tela com um movimento: o cadastro preenchido virando "Salvo" e,
 * deslizando por cima, os horários da agenda (serviços) ou a pergunta frequente de pagamento (produtos); o WhatsApp
 * conectado; e uma conversa relâmpago com o que foi cadastrado, terminando no aviso.
 * Todo o tempo é CSS: a barrinha do passo é o relógio (`animationend` passa para o próximo) e as telas animam com
 * `animation-delay`. Pausar (mouse no celular, foco pelo teclado, fora da tela) para só a barrinha: as telas sempre
 * terminam a animação (pausar a tela nova deixava o celular em branco).
 */
@Component({
  selector: 'app-como-funciona',
  imports: [IconeComponent, TelefoneDemoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './como-funciona.component.html',
  styleUrls: [
    './como-funciona.component.css',
    './como-funciona-telas.css',
    './como-funciona-extra.css',
    './como-funciona-conversa.css',
  ],
  host: {
    '[class.pausado]': 'pausado()',
    '(focusin)': 'aoFocar($event)',
    '(focusout)': 'focado.set(false)',
  },
})
export class ComoFuncionaComponent {
  protected readonly tipo = signal<TipoComoFunciona>('servicos');
  protected readonly indice = signal(0);

  protected readonly passos = computed(() => PASSOS_COMO_FUNCIONA[this.tipo()]);
  protected readonly passo = computed(() => this.passos()[this.indice()]);
  protected readonly roteiro = computed(() => ROTEIROS_COMO_FUNCIONA[this.tipo()]);
  /** Muda a cada troca de passo ou de tipo: as telas são recriadas e as animações começam do zero. */
  protected readonly chaveTela = computed(() => `${this.tipo()}-${this.indice()}`);

  protected readonly sobre = signal(false);
  protected readonly focado = signal(false);
  private readonly naTela = signal(false);
  protected readonly pausado = computed(() => this.sobre() || this.focado() || !this.naTela());

  constructor() {
    const elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    let observador: IntersectionObserver | undefined;
    afterNextRender(() => {
      observador = new IntersectionObserver(([entrada]) => this.naTela.set(entrada.isIntersecting), { threshold: 0.3 });
      observador.observe(elemento);
    });
    inject(DestroyRef).onDestroy(() => observador?.disconnect());
  }

  /** Só o foco pelo teclado pausa: o clique num passo também dá foco ao botão e não deve travar a troca. */
  protected aoFocar(evento: FocusEvent): void {
    const alvo = evento.target as HTMLElement | null;
    this.focado.set(!!alvo?.matches(':focus-visible'));
  }

  protected escolherTipo(tipo: TipoComoFunciona): void {
    if (tipo === this.tipo()) return;
    this.tipo.set(tipo);
    this.indice.set(0);
  }

  protected irPara(i: number): void {
    this.indice.set(i);
  }

  protected proximo(): void {
    this.indice.update((i) => (i + 1) % this.passos().length);
  }

  protected numero(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
}
