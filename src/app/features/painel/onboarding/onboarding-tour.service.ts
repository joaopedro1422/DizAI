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
  | 'redes-sociais'
  // tour da agenda (AgendaPageComponent fornece o próprio OnboardingTourService)
  | 'agenda-menu'
  | 'agenda-secoes'
  | 'agenda-configuracoes'
  | 'agenda-online'
  | 'agenda-dias'
  | 'agenda-dias-pc'
  | 'agenda-dia'
  | 'agenda-agendar'
  | 'agenda-agendar-pc'
  | 'agenda-semana'
  | 'agenda-mensagens'
  | 'pedidos-menu'
  | 'pedidos-secoes'
  | 'pedidos-chats'
  | 'pedidos-exemplo'
  | 'pedidos-envio'
  | 'pedidos-registrar'
  | 'pedidos-registrar-pc'
  | 'pedidos-mensagens';

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

  /** Só tira se ainda é o mesmo elemento (um card que muda de coluna registra o novo antes de o antigo sair). */
  remover(alvo: AlvoTour, elemento: HTMLElement): void {
    if (this.alvos.get(alvo) === elemento) {
      this.alvos.delete(alvo);
    }
  }

  obterElemento(alvo: AlvoTour): HTMLElement | undefined {
    return this.alvos.get(alvo);
  }
}
