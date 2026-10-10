import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { filter, map, of, switchMap, timer } from 'rxjs';

import { CarregandoComponent } from './shared/components/carregando/carregando.component';
import { ToastHostComponent } from './shared/components/toast-host/toast-host.component';

/** Só mostra o carregando de troca de tela se ela demorar mais que isso (evita piscar). */
const ESPERA_PARA_MOSTRAR_CARREGANDO_MS = 250;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHostComponent, CarregandoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  /** Verdadeiro enquanto uma tela (carregada sob demanda) ainda está sendo baixada. */
  protected readonly trocandoDeTela = toSignal(
    inject(Router).events.pipe(
      filter(
        (evento) =>
          evento instanceof NavigationStart ||
          evento instanceof NavigationEnd ||
          evento instanceof NavigationCancel ||
          evento instanceof NavigationError,
      ),
      map((evento) => evento instanceof NavigationStart),
      switchMap((iniciou) => (iniciou ? timer(ESPERA_PARA_MOSTRAR_CARREGANDO_MS).pipe(map(() => true)) : of(false))),
    ),
    { initialValue: false },
  );
}
