import { Pipe, PipeTransform } from '@angular/core';

import { Produto } from '../../core/models/produto.model';

const FORMATADOR_REAL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** "R$ 70", "a partir de R$ 5", "de R$ 100 a R$ 150" (variações) ou "Sob consulta". */
@Pipe({ name: 'precoProduto' })
export class PrecoProdutoPipe implements PipeTransform {
  transform(produto: Pick<Produto, 'preco' | 'precoAPartirDe' | 'variacoes'>): string {
    const variacoes = produto.variacoes ?? [];
    if (produto.preco === null && variacoes.length > 0) {
      const valores = variacoes.map((v) => v.preco);
      const menor = Math.min(...valores);
      const maior = Math.max(...valores);
      return menor === maior
        ? FORMATADOR_REAL.format(menor)
        : `de ${FORMATADOR_REAL.format(menor)} a ${FORMATADOR_REAL.format(maior)}`;
    }
    if (produto.preco === null) {
      return 'Sob consulta';
    }
    const valor = FORMATADOR_REAL.format(produto.preco);
    return produto.precoAPartirDe ? `a partir de ${valor}` : valor;
  }
}
