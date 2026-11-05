import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { MenuLateralComponent } from '../../../shared/components/menu-lateral/menu-lateral.component';
import { AlvoTourDirective } from '../../painel/onboarding/alvo-tour.directive';
import { SECOES_DA_AGENDA, SECOES_DE_CONFIGURACAO, SecaoAgenda } from '../secoes-agenda';

@Component({
  selector: 'app-menu-agenda',
  imports: [RouterLink, IconeComponent, AlvoTourDirective, MenuLateralComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-agenda.component.html',
  styleUrl: './menu-agenda.component.css',
})
export class MenuAgendaComponent {
  readonly secao = input.required<SecaoAgenda>();
  /** Gaveta aberta (só no celular; no computador o menu está sempre à vista). */
  readonly aberto = input(false);
  readonly nomeLoja = input('');
  readonly rotaInicio = input<string>('/');
  readonly linkAgenda = input.required<string>();
  /** A agenda online só marca sozinha com "Agendamento automático". */
  readonly agendaAtiva = input(false);

  readonly escolher = output<SecaoAgenda>();
  readonly fechar = output<void>();
  readonly copiarLink = output<void>();
  /** Como usar a agenda: o tour de novo. */
  readonly tour = output<void>();

  protected readonly grupos = [
    { itens: SECOES_DA_AGENDA, alvoTour: 'agenda-secoes' as const },
    { titulo: 'Configurações', itens: SECOES_DE_CONFIGURACAO, alvoTour: 'agenda-configuracoes' as const },
  ];
  protected readonly linkSemProtocolo = computed(() => this.linkAgenda().replace(/^https?:\/\//, ''));
}
