import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { MockConversaJornadaComponent } from './mock-conversa.component';
import { MockGaleriaJornadaComponent } from './mock-galeria.component';
import { MockPainelJornadaComponent } from './mock-painel.component';
import { MockVitrineJornadaComponent } from './mock-vitrine.component';

const INTERVALO_CENA_MS = 9000;

interface CenaJornada {
  titulo: string;
  descricao: string;
  rotulo: string;
}

const CENAS: CenaJornada[] = [
  {
    rotulo: '01 · Cadastre',
    titulo: 'Cadastre um produto ou serviço',
    descricao: 'A descrição é digitada no painel e o produto é salvo, com sabores e massas para o assistente consultar.',
  },
  {
    rotulo: '02 · Atenda',
    titulo: 'Uma pergunta. Uma resposta precisa.',
    descricao: 'O cliente pergunta pelos sabores da torta para 20 pessoas. O assistente responde com as opções cadastradas.',
  },
  {
    rotulo: '03 · Oriente',
    titulo: 'Defina uma regra do seu negócio',
    descricao: 'Escreva a instrução no painel. O assistente vai respeitá-la durante os atendimentos.',
  },
  {
    rotulo: '04 · Aplique',
    titulo: 'A regra é respeitada na conversa',
    descricao: 'Quando o cliente pergunta sobre uma entrega no domingo, o assistente explica que não é possível.',
  },
  {
    rotulo: '05 · Apresente',
    titulo: 'Organize sua galeria',
    descricao: 'A tela da galeria reúne seus tópicos, fotos e a personalização da vitrine.',
  },
  {
    rotulo: '06 · Compartilhe',
    titulo: 'Suas fotos chegam com um link',
    descricao: 'Quando o cliente pede para ver seus trabalhos, o assistente responde com o link da galeria.',
  },
  {
    rotulo: '07 · Encante',
    titulo: 'A galeria pública da sua loja',
    descricao: 'O cliente abre o link e encontra seus trabalhos organizados em uma página com a identidade da sua loja.',
  },
  {
    rotulo: '08 · Configure',
    titulo: 'Escolha como fechar os pedidos',
    descricao: 'Defina que o assistente deve coletar os dados do pedido e escreva o que precisa saber: nome, retirada ou entrega e data.',
  },
  {
    rotulo: '09 · Feche',
    titulo: 'O assistente coleta os dados',
    descricao: 'Quando o cliente decide comprar, a IA pede as informações que você configurou para organizar o pedido.',
  },
];

@Component({
  selector: 'app-jornada-interativa',
  imports: [IconeComponent, MockConversaJornadaComponent, MockGaleriaJornadaComponent, MockPainelJornadaComponent, MockVitrineJornadaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './jornada-interativa.component.html',
  styleUrl: './jornada-interativa.component.css',
})
export class JornadaInterativaComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private temporizador?: number;
  private observer?: IntersectionObserver;
  private movimentoReduzido = false;

  @ViewChild('secaoJornada') private secaoJornada!: ElementRef<HTMLElement>;

  protected readonly cenas = CENAS;
  protected readonly indiceCena = signal(0);
  protected readonly iniciada = signal(false);
  protected readonly pausada = signal(true);
  protected readonly cenaAtual = computed(() => this.cenas[this.indiceCena()]);

  ngAfterViewInit(): void {
    this.movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.observer = new IntersectionObserver((entradas) => {
      if (entradas.some((entrada) => entrada.isIntersecting)) {
        this.iniciada.set(true);
        this.iniciarTemporizador();
        if (!this.movimentoReduzido) {
          this.pausada.set(false);
        }
        this.observer?.disconnect();
      }
    });
    this.observer.observe(this.secaoJornada.nativeElement);

    this.destroyRef.onDestroy(() => {
      if (this.temporizador !== undefined) {
        clearInterval(this.temporizador);
      }
      this.observer?.disconnect();
    });
  }

  protected selecionarCena(indice: number): void {
    this.indiceCena.set(indice);
  }

  protected alternarReproducao(): void {
    this.iniciada.set(true);
    this.iniciarTemporizador();
    this.pausada.update((valor) => !valor);
  }

  protected anterior(): void {
    this.indiceCena.update((indice) => (indice - 1 + this.cenas.length) % this.cenas.length);
  }

  protected avancar(): void {
    this.indiceCena.update((indice) => (indice + 1) % this.cenas.length);
  }

  private iniciarTemporizador(): void {
    if (this.temporizador !== undefined) {
      return;
    }

    this.temporizador = window.setInterval(() => {
      if (!this.pausada() && !document.hidden) {
        this.avancar();
      }
    }, INTERVALO_CENA_MS);
  }
}
