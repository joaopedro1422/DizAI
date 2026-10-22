import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';

/**
 * Faixa curta entre a dor e a solução: o dado dos 5 minutos sobre tempo de resposta ("Lead Response Management
 * Study", Dr. James Oldroyd, do MIT, com a InsideSales, 2007: 5 em vez de 30 minutos = 21x a chance de qualificar
 * o contato e 100x a de falar com ele), com o link para o resumo do estudo.
 */
@Component({
  selector: 'app-secao-pesquisa',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secao-pesquisa.component.html',
  styleUrl: './secao-pesquisa.component.css',
})
export class SecaoPesquisaComponent {}
