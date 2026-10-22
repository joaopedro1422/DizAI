import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { EXEMPLOS_GALERIA } from './exemplos-galeria';
import { FaseVitrine, VitrineMiniaturaComponent } from './vitrine-miniatura/vitrine-miniatura.component';

/** Quanto tempo cada momento fica na tela. Lojas com agenda mostram a galeria e depois a aba "Agendar horário". */
const TEMPO_GALERIA_MS = 7000;
const TEMPOS_COM_AGENDA: { fase: FaseVitrine; ms: number }[] = [
  { fase: 'trabalhos', ms: 4500 },
  { fase: 'agenda', ms: 3200 },
  { fase: 'agenda-fim', ms: 4300 },
];

const BENEFICIOS = [
  'Fotos separadas por tópico.',
  'Com a sua logo, a sua capa e a cor da sua marca.',
  'Para serviços: o cliente escolhe o horário na própria página.',
  'Link que pode ser utilizado na bio do instagram e outros canais',
];

/**
 * Seção da landing que mostra a galeria pública da loja dentro de um celular (a mesma página de /l/{slug}),
 * com a conversa em que o assistente envia o link. Troca sozinha entre lojas de exemplo; pausa com o mouse
 * ou o foco em cima e fica parada para quem pediu menos movimento no sistema.
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
    const comAgenda = !!this.exemploAtual().agenda;
    const espera = comAgenda ? TEMPOS_COM_AGENDA[this.etapa].ms : TEMPO_GALERIA_MS;
    this.temporizador = setTimeout(() => {
      if (!this.pausado() && !document.hidden) {
        this.avancar(comAgenda);
      }
      this.agendar();
    }, espera);
  }

  private avancar(comAgenda: boolean): void {
    if (comAgenda && this.etapa < TEMPOS_COM_AGENDA.length - 1) {
      this.etapa += 1;
    } else {
      this.etapa = 0;
      this.indiceAtual.update((indice) => (indice + 1) % EXEMPLOS_GALERIA.length);
    }
    this.fase.set(TEMPOS_COM_AGENDA[this.etapa].fase);
  }
}
