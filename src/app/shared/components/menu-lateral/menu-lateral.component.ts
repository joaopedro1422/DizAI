import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AlvoTourDirective } from '../../../features/painel/onboarding/alvo-tour.directive';
import { AlvoTour } from '../../../features/painel/onboarding/onboarding-tour.service';
import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { PerfilService } from '../../../core/services/perfil.service';
import { IconeComponent } from '../icone/icone.component';
import { NomeIcone } from '../icone/icones';

export interface ItemMenuLateral {
  valor: string;
  titulo: string;
  icone: NomeIcone;
}

export interface GrupoMenuLateral {
  /** Sem título: o primeiro grupo, logo abaixo do nome da tela. */
  titulo?: string;
  itens: ItemMenuLateral[];
  /** O grupo inteiro é destacado neste passo do tour da tela. */
  alvoTour?: AlvoTour;
}

/**
 * Menu das telas de gestão (Agenda, Pedidos): as páginas da tela em grupos, uma ajuda opcional (o tour) e, no pé,
 * o que a tela projetar (ex.: o card da agenda online). No celular é uma gaveta que abre pelo botão do topo
 * (estilos-tela-com-menu.css); no computador (1024 px+) fica fixo à esquerda.
 */
@Component({
  selector: 'app-menu-lateral',
  imports: [RouterLink, IconeComponent, AlvoTourDirective, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-lateral.component.html',
  styleUrl: './menu-lateral.component.css',
  host: {
    '[class.menu-lateral--aberto]': 'aberto()',
    '(document:keydown.escape)': 'aberto() && fechar.emit()',
  },
})
export class MenuLateralComponent {
  readonly titulo = input.required<string>();
  readonly subtitulo = input('');
  readonly icone = input.required<NomeIcone>();
  readonly grupos = input.required<GrupoMenuLateral[]>();
  /** O valor da página aberta. */
  readonly ativo = input.required<string>();
  /** Gaveta aberta (só no celular; no computador o menu está sempre à vista). */
  readonly aberto = input(false);
  readonly rotaInicio = input<string>('/');
  /** Vazio = sem o botão de ajuda. */
  readonly rotuloAjuda = input('');

  readonly escolher = output<string>();
  readonly fechar = output<void>();
  readonly ajuda = output<void>();

  /** A logo da loja no lugar do ícone da tela (sem logo cadastrada, fica o ícone). */
  private readonly perfil = inject(PerfilService).perfil;
  protected readonly logo = computed(() => this.perfil().fotoPerfilUrl);
}
