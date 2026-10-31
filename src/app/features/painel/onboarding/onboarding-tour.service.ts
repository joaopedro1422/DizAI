import { Injectable } from '@angular/core';

export type AlvoTour =
  | 'perfil'
  | 'produtos'
  | 'perguntas'
  | 'galeria'
  | 'contatos'
  | 'modo-pedido'
  | 'chats'
  | 'agenda-pedidos'
  // tour da agenda (AgendaPageComponent fornece o próprio OnboardingTourService)
  | 'agenda-menu'
  | 'agenda-secoes'
  | 'agenda-configuracoes'
  | 'agenda-online'
  | 'agenda-dias'
  | 'agenda-dia'
  | 'agenda-agendar'
  | 'agenda-agendar-pc'
  | 'agenda-semana'
  | 'agenda-mensagens';

/**
 * Guarda os elementos da tela que o tour destaca.
 * É fornecido pelo PainelPageComponent e pelo AgendaPageComponent, então existe só enquanto a tela está aberta.
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
