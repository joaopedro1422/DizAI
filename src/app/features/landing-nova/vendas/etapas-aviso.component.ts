import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { esperar, quandoAparecer, semMovimento } from '../movimento';
import { EtapaAviso } from './conteudo-vendas';

/** Tempo de cada etapa à vista (a barrinha da etapa atual enche nesse tempo). */
const TEMPO_POR_ETAPA_MS = 3800;

type Fase = 'digitando' | 'mensagem' | 'enviada';

/**
 * As mensagens automáticas de status do pedido: as etapas (Confirmado → Pronto → Entregue) avançam sozinhas e, a
 * cada uma, a mensagem daquela etapa sai para o cliente: "digitando…", a mensagem chega e aparece o
 * "✓✓ Enviada pelo WhatsApp". Começa quando entra na tela; avisa a etapa atual (o card do pedido acompanha).
 */
@Component({
  selector: 'app-etapas-aviso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="etapas-aviso__etapas" aria-label="Etapas do pedido">
      @for (e of etapas(); track e.nome; let i = $index) {
        <li [class.feita]="i < etapa()" [class.atual]="i === etapa()" [attr.aria-current]="i === etapa() ? 'step' : null">
          <span class="mono">{{ i + 1 }}</span>{{ e.nome }}
          @if (i === etapa() && rodando()) {
            <i class="etapas-aviso__tempo" [style.animation-duration.ms]="tempo" aria-hidden="true"></i>
          }
        </li>
      }
    </ol>
    <div class="etapas-aviso__conversa" aria-live="polite">
      <small class="etapas-aviso__rotulo">Mensagem automática · {{ atual().nome }}</small>
      @if (fase() === 'digitando') {
        <span class="msg msg--digitando" aria-label="enviando"><i></i><i></i><i></i></span>
      } @else {
        @for (chave of [etapa()]; track chave) {
          <span class="msg msg--loja msg--entra">{{ atual().mensagem }}<time>{{ hora() }}</time></span>
        }
      }
      <small class="etapas-aviso__enviada" [class.visivel]="fase() === 'enviada'">✓✓ Enviada pelo WhatsApp</small>
    </div>
  `,
  host: { class: 'etapas-aviso' },
})
export class EtapasAvisoComponent {
  readonly etapas = input.required<EtapaAviso[]>();
  readonly hora = input('14:52');
  /** A etapa que está à vista (0, 1, 2...). */
  readonly etapaMudou = output<number>();

  protected readonly tempo = TEMPO_POR_ETAPA_MS;
  protected readonly etapa = signal(0);
  protected readonly fase = signal<Fase>('enviada');
  protected readonly rodando = signal(false);
  protected readonly atual = computed(() => this.etapas()[this.etapa()]);

  private ativo = true;

  constructor() {
    const elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    let parar = (): void => undefined;
    inject(DestroyRef).onDestroy(() => {
      this.ativo = false;
      parar();
    });
    afterNextRender(() => {
      if (!semMovimento()) {
        parar = quandoAparecer(elemento, () => void this.tocar());
      }
    });
  }

  private async tocar(): Promise<void> {
    this.rodando.set(true);
    while (this.ativo) {
      this.etapaMudou.emit(this.etapa());
      this.fase.set('digitando');
      await esperar(650);
      if (!this.ativo) return;
      this.fase.set('mensagem');
      await esperar(700);
      if (!this.ativo) return;
      this.fase.set('enviada');
      await esperar(TEMPO_POR_ETAPA_MS - 1350);
      // aba escondida: espera voltar, para a pessoa não perder o ciclo
      while (this.ativo && document.hidden) {
        await esperar(500);
      }
      if (!this.ativo) return;
      this.etapa.update((i) => (i + 1) % this.etapas().length);
    }
  }
}
