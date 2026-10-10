import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';

import { AlvoTour, OnboardingTourService } from './onboarding-tour.service';

/** Marca um elemento para ser destacado pelo tour: `<a appAlvoTour="produtos">`. */
@Directive({
  selector: '[appAlvoTour]',
})
export class AlvoTourDirective implements OnInit, OnDestroy {
  readonly alvo = input.required<AlvoTour>({ alias: 'appAlvoTour' });

  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly tourService = inject(OnboardingTourService);

  ngOnInit(): void {
    this.tourService.registrar(this.alvo(), this.elemento.nativeElement);
  }

  ngOnDestroy(): void {
    this.tourService.remover(this.alvo());
  }
}
