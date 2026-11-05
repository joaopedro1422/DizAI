import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { TipoNegocio } from '../../demonstracao/conversas-demonstracao';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { ComparacaoAtendimentoComponent } from './comparacao-atendimento/comparacao-atendimento.component';

/**
 * Faixa curta entre a dor e a solução: o dado dos 5 minutos sobre tempo de resposta ("Lead Response Management
 * Study", Dr. James Oldroyd, do MIT, com a InsideSales, 2007: 5 em vez de 30 minutos = 21x a chance de qualificar
 * o contato e 100x a de falar com ele), com o link para o resumo do estudo e, embaixo, a janela que compara o
 * atendimento com e sem o DizAI (`ComparacaoAtendimentoComponent`).
 */
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
