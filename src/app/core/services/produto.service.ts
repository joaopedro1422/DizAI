import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlDoPerfil } from '../api/api-url';
import { SessaoService } from '../auth/sessao.service';
import { NovoProduto, Produto, ProdutoAtualizacao } from '../models/produto.model';
import { CarregamentoUnico } from '../utils/carregamento-unico';

/** Catálogo de produtos e serviços: /api/perfis/{perfilId}/produtos */
@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);

  private readonly listaProdutos = signal<Produto[]>([]);
  private readonly carregamento = new CarregamentoUnico();

  readonly produtos = this.listaProdutos.asReadonly();
  readonly carregando = this.carregamento.carregando;

  /** Categorias na ordem em que aparecem no catálogo, sem repetição. */
  readonly categorias = computed(() => [...new Set(this.listaProdutos().map((produto) => produto.categoria))]);

  carregar(): Promise<void> {
    return this.carregamento.executar(async () => {
      this.listaProdutos.set(await firstValueFrom(this.http.get<Produto[]>(this.url())));
    });
  }

  async adicionar(novoProduto: NovoProduto): Promise<Produto> {
    const produto = await firstValueFrom(this.http.post<Produto>(this.url(), novoProduto));
    this.listaProdutos.update((produtos) => [produto, ...produtos]);
    return produto;
  }

  async atualizar(produtoId: number, produtoAtualizado: ProdutoAtualizacao): Promise<Produto> {
    const produto = await firstValueFrom(
      this.http.put<Produto>(this.url(`/${produtoId}`), produtoAtualizado),
    );
    this.listaProdutos.update((produtos) =>
      produtos.map((item) => (item.id === produto.id ? produto : item)),
    );
    return produto;
  }

  reiniciar(): void {
    this.carregamento.reiniciar();
    this.listaProdutos.set([]);
  }

  private url(caminho = ''): string {
    return urlDoPerfil(this.sessao.perfilIdObrigatorio(), `/produtos${caminho}`);
  }
}
