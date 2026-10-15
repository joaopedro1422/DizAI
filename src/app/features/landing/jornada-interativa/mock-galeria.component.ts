import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { TelefoneDemoComponent } from './telefone-demo.component';

type EtapaDemoGaleria = 'inicial' | 'fotos' | 'salvando' | 'atualizada' | 'cor';

@Component({
  selector: 'app-mock-galeria-jornada',
  imports: [IconeComponent, TelefoneDemoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mock-galeria.component.html',
  styleUrl: './mock-galeria.component.css',
})
export class MockGaleriaJornadaComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly temporizadores: number[] = [];

  protected readonly etapa = signal<EtapaDemoGaleria>('inicial');
  protected readonly fotoAdicionada = '/landing/galeria/bolos/09.webp';

  ngOnInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.etapa.set('cor');
      return;
    }

    this.agendarEtapa('fotos', 700);
    this.agendarEtapa('salvando', 2400);
    this.agendarEtapa('atualizada', 3300);
    this.agendarEtapa('cor', 4100);
    this.destroyRef.onDestroy(() => this.temporizadores.forEach((temporizador) => window.clearTimeout(temporizador)));
  }

  private agendarEtapa(etapa: EtapaDemoGaleria, atraso: number): void {
    this.temporizadores.push(window.setTimeout(() => this.etapa.set(etapa), atraso));
  }
}
