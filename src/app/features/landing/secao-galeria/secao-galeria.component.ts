import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { EXEMPLOS_GALERIA, ExemploGaleria } from './exemplos-galeria';
import { FaseVitrine, VitrineMiniaturaComponent } from './vitrine-miniatura/vitrine-miniatura.component';

/**
 * Os momentos de cada loja e quanto tempo cada um fica na tela: o topo com as fotos; a página rolada até os feedbacks
 * e o "Como chegar" (quando a loja tem); e, nas lojas com agenda, a aba "Agendar horário" e o fim dela preenchido.
 */
function momentos(exemplo: ExemploGaleria): { fase: FaseVitrine; ms: number }[] {
  const temExtras = !!exemplo.feedbacks?.length || !!exemplo.endereco;
  const lista: { fase: FaseVitrine; ms: number }[] = temExtras
    ? [{ fase: 'trabalhos', ms: 3800 }, { fase: 'topicos', ms: 5200 }]
    : [{ fase: 'trabalhos', ms: exemplo.agenda ? 4500 : 7000 }];
  if (exemplo.agenda) {
    lista.push({ fase: 'agenda', ms: 3200 }, { fase: 'agenda-fim', ms: 4300 });
  }
  return lista;
}

const BENEFICIOS = [
  'Fotos separadas em tópicos, feedbacks dos clientes e o mapa de como chegar',
  'Personalize do seu jeito, com a sua cor e a sua logo',
  'Link para colocar na bio do Instagram',
  'O assistente envia o link quando o cliente pergunta por fotos e exemplos',
  'Para serviços: agenda e horários livres na própria página, para o cliente agendar',
];

/**
 * "Vitrine pública" da landing: o texto com os checks à esquerda e, à direita, a página da loja (/l/{slug}) dentro
 * de um celular, com a conversa em que o assistente envia o link. Troca sozinha entre lojas de exemplo (ou pelas setas
 * embaixo); pausa com o mouse ou o foco em cima e fica parada para quem pediu menos movimento no sistema.
 */
@Component({
  selector: 'app-secao-galeria',
  imports: [RouterLink, IconeComponent, VitrineMiniaturaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secao-galeria.component.html',
  styleUrl: './secao-galeria.component.css',
})
export class SecaoGaleriaComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly beneficios = BENEFICIOS;
  protected readonly indiceAtual = signal(0);
  protected readonly fase = signal<FaseVitrine>('trabalhos');
  protected readonly pausado = signal(false);

  protected readonly exemploAtual = computed(() => EXEMPLOS_GALERIA[this.indiceAtual()]);

  private temporizador: ReturnType<typeof setTimeout> | undefined;
  private etapa = 0;

  ngOnInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    this.agendar();
    this.destroyRef.onDestroy(() => clearTimeout(this.temporizador));
  }

  /** Espera o momento atual acabar e passa para o próximo (a próxima fase ou a próxima loja). */
  private agendar(): void {
    const espera = momentos(this.exemploAtual())[this.etapa].ms;
    this.temporizador = setTimeout(() => {
      if (!this.pausado() && !document.hidden) {
        this.avancar();
      }
      this.agendar();
    }, espera);
  }

  /** Setas embaixo do celular: a loja de exemplo anterior ou a próxima (dá a volta nas pontas). */
  protected anterior(): void {
    this.escolher((this.indiceAtual() - 1 + EXEMPLOS_GALERIA.length) % EXEMPLOS_GALERIA.length);
  }

  protected proximo(): void {
    this.escolher((this.indiceAtual() + 1) % EXEMPLOS_GALERIA.length);
  }

  /** Mostra aquela loja do começo e recomeça a contagem. */
  private escolher(indice: number): void {
    clearTimeout(this.temporizador);
    this.etapa = 0;
    this.fase.set('trabalhos');
    this.indiceAtual.set(indice);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.agendar();
    }
  }

  private avancar(): void {
    if (this.etapa < momentos(this.exemploAtual()).length - 1) {
      this.etapa += 1;
    } else {
      this.etapa = 0;
      this.indiceAtual.update((indice) => (indice + 1) % EXEMPLOS_GALERIA.length);
    }
    this.fase.set(momentos(this.exemploAtual())[this.etapa].fase);
  }
}
