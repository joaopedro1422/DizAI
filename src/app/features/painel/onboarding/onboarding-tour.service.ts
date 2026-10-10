import { Injectable } from '@angular/core';

export type AlvoTour = 'perfil' | 'produtos' | 'perguntas' | 'galeria' | 'contatos' | 'modo-pedido';

/**
 * Guarda os elementos da tela que o tour destaca.
 * É fornecido pelo PainelPageComponent, então existe só enquanto o painel está aberto.
 */
@Injectable()
export class OnboardingTourService {
  private readonly alvos = new Map<AlvoTour, HTMLElement>();

  registrar(alvo: AlvoTour, elemento: HTMLElement): void {
    this.alvos.set(alvo, elemento);
  }

  remover(alvo: AlvoTour): void {
    this.alvos.delete(alvo);
  }

  obterElemento(alvo: AlvoTour): HTMLElement | undefined {
    return this.alvos.get(alvo);
  }
}
