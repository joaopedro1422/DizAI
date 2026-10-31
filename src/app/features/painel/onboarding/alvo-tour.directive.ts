import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';

import { AlvoTour, OnboardingTourService } from './onboarding-tour.service';

/** Marca um elemento para ser destacado pelo tour: `<a appAlvoTour="produtos">`. */
@Directive({
  selector: '[appAlvoTour]',
})
export class AlvoTourDirective implements OnInit, OnDestroy {
  /** Vazio = não marca nada (ex.: grupo do menu lateral sem passo no tour). */
  readonly alvo = input.required<AlvoTour | null | undefined>({ alias: 'appAlvoTour' });

  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly tourService = inject(OnboardingTourService);

  ngOnInit(): void {
    const alvo = this.alvo();
    if (alvo) {
      this.tourService.registrar(alvo, this.elemento.nativeElement);
    }
  }

  ngOnDestroy(): void {
    const alvo = this.alvo();
    if (alvo) {
      this.tourService.remover(alvo, this.elemento.nativeElement);
    }
  }
}
