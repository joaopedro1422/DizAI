import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Os tipos de negócio que passam na faixa logo abaixo do hero. */
const NEGOCIOS = [
  'Barbearia',
  'Studio de manicure',
  'Studio de tatuagem',
  'Salão de beleza',
  'Esteticista',
  'Loja de doces',
  'Loja de salgados',
  'Loja de roupas',
  'Encomendas em geral',
];

/**
 * Faixa de fundo branco, na largura toda da tela, entre o hero e "A rotina do microempreendedor": os tipos
 * de negócio passando sem parar, separados por pontinhos. A lista vai duas vezes para o laço não ter emenda.
 */
@Component({
  selector: 'app-faixa-negocios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './faixa-negocios.component.html',
  styleUrl: './faixa-negocios.component.css',
})
export class FaixaNegociosComponent {
  protected readonly negocios = NEGOCIOS;
}
