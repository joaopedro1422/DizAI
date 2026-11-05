import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  TemplateRef,
  computed,
  contentChild,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { IconeComponent } from '../icone/icone.component';

export interface CenaVideo {
  nome: string;
  /** Quanto tempo a cena fica na tela, em milissegundos. */
  duracao: number;
}

/** Contexto dos templates de cena: o índice da cena atual. */
export interface ContextoCena {
  $implicit: number;
}

@Component({
  selector: 'app-video-tutorial',
  imports: [IconeComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-tutorial.component.html',
  styleUrl: './video-tutorial.component.css',
  host: {
    '(document:keydown.escape)': 'fechar.emit()',
  },
})
export class VideoTutorialComponent implements AfterViewInit, OnDestroy {
  readonly titulo = input.required<string>();
  readonly cenas = input.required<CenaVideo[]>();
  readonly rotuloBotao = input('Entendi');
  readonly confirmar = output<void>();
  readonly fechar = output<void>();

  protected readonly templateLegenda = contentChild.required<TemplateRef<ContextoCena>>('legenda');
  protected readonly templateTela = contentChild.required<TemplateRef<ContextoCena>>('tela');

  protected readonly tocando = signal(false);
  private readonly tempo = signal(0);
  /** Muda a cada salto na barra para recriar a cena e reiniciar as animações dela. */
  private readonly reinicios = signal(0);

  private readonly inicioDasCenas = computed(() => {
    let soma = 0;
    return this.cenas().map((cena) => {
      const inicio = soma;
      soma += cena.duracao;
      return inicio;
    });
  });
  private readonly duracaoTotal = computed(() => this.cenas().reduce((soma, cena) => soma + cena.duracao, 0));

  protected readonly cenaAtual = computed(() => {
    const tempo = this.tempo();
    const proxima = this.inicioDasCenas().findIndex((inicio) => inicio > tempo);
    return proxima === -1 ? this.cenas().length - 1 : proxima - 1;
  });
  protected readonly chaveCena = computed(() => `${this.cenaAtual()}-${this.reinicios()}`);
  protected readonly terminou = computed(() => this.tempo() >= this.duracaoTotal());

  /** Quanto de cada segmento da barra já foi preenchido (0 a 1). */
  protected readonly progressoDasCenas = computed(() => {
    const tempo = this.tempo();
    const inicios = this.inicioDasCenas();
    return this.cenas().map((cena, indice) => Math.min(Math.max((tempo - inicios[indice]) / cena.duracao, 0), 1));
  });
  protected readonly tempoLegivel = computed(
    () => `${formatarTempo(this.tempo())} / ${formatarTempo(this.duracaoTotal())}`,
  );
  /** Ex.: "Vídeo rápido · 45 s" ou "Vídeo rápido · 1 min". */
  protected readonly sobretitulo = computed(() => {
    const segundos = Math.round(this.duracaoTotal() / 1000);
    return `Vídeo rápido · ${segundos < 60 ? `${segundos} s` : `${Math.round(segundos / 60)} min`}`;
  });

  private readonly botao = viewChild.required<ElementRef<HTMLButtonElement>>('botao');
  private quadro = 0;
  private ultimoInstante = 0;
  private overflowAnteriorDoBody = '';

  ngAfterViewInit(): void {
    this.overflowAnteriorDoBody = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.botao().nativeElement.focus({ preventScroll: true });
    this.tocar();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.quadro);
    document.body.style.overflow = this.overflowAnteriorDoBody;
  }

  protected alternar(): void {
    if (this.tocando()) {
      this.pausar();
    } else {
      this.tocar();
    }
  }

  protected irParaCena(indice: number): void {
    this.tempo.set(this.inicioDasCenas()[indice]);
    this.reinicios.update((valor) => valor + 1);
    if (!this.tocando()) {
      this.tocar();
    }
  }

  private tocar(): void {
    if (this.terminou()) {
      this.irParaCena(0);
      return;
    }
    this.tocando.set(true);
    this.ultimoInstante = performance.now();
    this.quadro = requestAnimationFrame(this.avancar);
  }

  private pausar(): void {
    this.tocando.set(false);
    cancelAnimationFrame(this.quadro);
  }

  private readonly avancar = (agora: number): void => {
    this.tempo.update((tempo) => Math.min(tempo + agora - this.ultimoInstante, this.duracaoTotal()));
    this.ultimoInstante = agora;
    if (this.terminou()) {
      this.tocando.set(false);
      return;
    }
    this.quadro = requestAnimationFrame(this.avancar);
  };
}

function formatarTempo(milissegundos: number): string {
  const segundos = Math.floor(milissegundos / 1000);
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`;
}
