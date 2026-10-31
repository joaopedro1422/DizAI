import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { AlvoTourDirective } from '../../painel/onboarding/alvo-tour.directive';
import { SECOES_DA_AGENDA, SECOES_DE_CONFIGURACAO, SecaoAgenda } from '../secoes-agenda';

/**
 * Menu da agenda: as páginas (Agendamentos, Números e as configurações) e o link da agenda online (copiar e
 * "Personalizar", que leva à tela da vitrine).
 * No celular é uma gaveta que abre pelo botão do topo; no computador (1024 px+) fica fixo à esquerda.
 */
@Component({
  selector: 'app-menu-agenda',
  imports: [RouterLink, IconeComponent, AlvoTourDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-agenda.component.html',
  styleUrl: './menu-agenda.component.css',
  host: {
    '[class.menu-agenda--aberto]': 'aberto()',
    '(document:keydown.escape)': 'aberto() && fechar.emit()',
  },
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

  protected readonly secoesDaAgenda = SECOES_DA_AGENDA;
  protected readonly secoesDeConfiguracao = SECOES_DE_CONFIGURACAO;
  protected readonly linkSemProtocolo = computed(() => this.linkAgenda().replace(/^https?:\/\//, ''));
}
