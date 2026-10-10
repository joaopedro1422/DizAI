import { Pipe, PipeTransform } from '@angular/core';

import { Produto } from '../../core/models/produto.model';

const FORMATADOR_REAL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** "R$ 70", "a partir de R$ 5" ou "Sob consulta". */
@Pipe({ name: 'precoProduto' })
export class PrecoProdutoPipe implements PipeTransform {
  transform(produto: Pick<Produto, 'preco' | 'precoAPartirDe'>): string {
    if (produto.preco === null) {
      return 'Sob consulta';
    }
    const valor = FORMATADOR_REAL.format(produto.preco);
    return produto.precoAPartirDe ? `a partir de ${valor}` : valor;
  }
}
