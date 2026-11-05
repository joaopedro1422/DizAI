import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { TipoNegocio } from '../../demonstracao/conversas-demonstracao';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { ComparacaoAtendimentoComponent } from './comparacao-atendimento/comparacao-atendimento.component';

@Component({
  selector: 'app-secao-pesquisa',
  imports: [IconeComponent, ComparacaoAtendimentoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secao-pesquisa.component.html',
  styleUrl: './secao-pesquisa.component.css',
})
export class SecaoPesquisaComponent {
  /** Na landing de um tipo, a janela só mostra os atendimentos dele; sem tipo (hub), os dois. */
  readonly tipo = input<TipoNegocio | null>(null);
}
