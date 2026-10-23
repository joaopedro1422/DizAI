import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../core/api/erro-api';
import { NovoProduto, Produto, ProdutoAtualizacao } from '../../core/models/produto.model';
import { ramoDeServico } from '../../core/models/perfil.model';
import { ConteudoRamoService } from '../../core/services/conteudo-ramo.service';
import { DicasVistasService } from '../../core/services/dicas-vistas.service';
import { PerfilService } from '../../core/services/perfil.service';
import { ProdutoService } from '../../core/services/produto.service';
import { ToastService } from '../../core/services/toast.service';
import { pluralizar } from '../../core/utils/colecao.utils';
import { BotaoVideoComponent } from '../../shared/components/video-tutorial/botao-video.component';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { CabecalhoPaginaComponent } from '../../shared/components/cabecalho-pagina/cabecalho-pagina.component';
import { EstadoVazioComponent } from '../../shared/components/estado-vazio/estado-vazio.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { ProdutoCardComponent } from './produto-card/produto-card.component';
import { ProdutoFormularioComponent } from './produto-formulario/produto-formulario.component';
import { TipoVideoCadastro, VideoCadastroComponent } from './video-cadastro/video-cadastro.component';

const TODAS_AS_CATEGORIAS = 'Todos';


@Component({
  selector: 'app-produtos-page',
  imports: [
    BotaoVideoComponent,
    CabecalhoPaginaComponent,
    IconeComponent,
    BottomSheetComponent,
    EstadoVazioComponent,
    ProdutoCardComponent,
    ProdutoFormularioComponent,
    VideoCadastroComponent,
    CarregandoComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './produtos-page.component.html',
  styleUrls: ['../../shared/estilos-listagem.css', './produtos-page.component.css'],
})
export class ProdutosPageComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly toastService = inject(ToastService);
  private readonly dicasVistas = inject(DicasVistasService);

  protected readonly conteudo = inject(ConteudoRamoService).conteudo;
  private readonly perfil = inject(PerfilService).perfil;

  /** Ramos de serviço veem o vídeo que fala da duração e da agenda automática. */
  protected readonly tipoVideo = computed<TipoVideoCadastro>(() =>
    ramoDeServico(this.perfil().ramo) ? 'servicos' : 'produtos',
  );

  /** Mostra o vídeo de orientação no primeiro acesso ou enquanto não houver produtos. */
  /** Vídeo de orientação na primeira visita (depois, pelo botão "Vídeo" do topo). */
  protected readonly mostrarVideo = signal(this.dicasVistas.deveMostrarVideo('cadastro-produtos'));

  protected readonly categorias = this.produtoService.categorias;
  protected readonly filtroAtual = signal(TODAS_AS_CATEGORIAS);
  protected readonly modalAberto = signal(false);
  protected readonly produtoEmEdicao = signal<Produto | null>(null);
  /** Negócios de serviço: o modal aberto pelo "Adicionar produto" cadastra um produto à venda. */
  protected readonly novoProdutoAVenda = signal(false);
  protected readonly ramoServico = computed(() => ramoDeServico(this.perfil().ramo));
  /** Serviços | Produtos: só aparece quando o negócio de serviço já tem algum produto à venda. */
  protected readonly tipoAtual = signal<'servicos' | 'produtos'>('servicos');
  protected readonly totalAVenda = computed(() => this.produtoService.produtos().filter((p) => p.produtoAVenda).length);
  protected readonly mostrarTipos = computed(() => this.ramoServico() && this.totalAVenda() > 0);
  protected readonly salvando = signal(false);
  protected readonly produtoParaExcluir = signal<Produto | null>(null);
  protected readonly excluindo = signal(false);
  protected readonly carregando = this.produtoService.carregando;

  /** Só as categorias que têm itens na aba escolhida (Serviços ou Produtos). */
  protected readonly filtros = computed(() => {
    if (!this.mostrarTipos()) {
      return [TODAS_AS_CATEGORIAS, ...this.categorias()];
    }
    const verProdutos = this.tipoAtual() === 'produtos';
    const daAba = new Set(
      this.produtoService.produtos().filter((p) => !!p.produtoAVenda === verProdutos).map((p) => p.categoria),
    );
    return [TODAS_AS_CATEGORIAS, ...this.categorias().filter((c) => daAba.has(c))];
  });

  protected readonly produtosFiltrados = computed(() => {
    const filtro = this.filtroAtual();
    const verProdutos = this.tipoAtual() === 'produtos';
    const produtos = this.mostrarTipos()
      ? this.produtoService.produtos().filter((p) => !!p.produtoAVenda === verProdutos)
      : this.produtoService.produtos();
    return filtro === TODAS_AS_CATEGORIAS ? produtos : produtos.filter((produto) => produto.categoria === filtro);
  });

  protected readonly subtitulo = computed(() => {
    const total = this.produtoService.produtos().length;
    return total === 0 ? 'Nenhum produto cadastrado ainda' : pluralizar(total, 'cadastrado', 'cadastrados');
  });

  protected readonly rotuloBotaoVideo = computed(() =>
    this.produtoService.produtos().length === 0 ? 'Cadastrar meu primeiro produto' : 'Entendi',
  );

  /** Fecha o vídeo; pelo botão principal, se a loja ainda não tem produtos, já abre o cadastro. */
  protected fecharVideo(abrirCadastro: boolean): void {
    this.dicasVistas.marcarComoVista('cadastro-produtos');
    this.mostrarVideo.set(false);
    if (abrirCadastro && this.produtoService.produtos().length === 0) {
      this.abrirModal();
    }
  }

  ngOnInit(): void {
    this.produtoService
      .carregar()
      .catch((erro: unknown) => this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR)));
  }

  protected filtrar(categoria: string): void {
    this.filtroAtual.set(categoria);
  }

  protected escolherTipo(tipo: 'servicos' | 'produtos'): void {
    this.tipoAtual.set(tipo);
    this.filtroAtual.set(TODAS_AS_CATEGORIAS);
  }

  protected abrirModal(produtoAVenda = false): void {
    this.produtoEmEdicao.set(null);
    this.novoProdutoAVenda.set(produtoAVenda);
    this.modalAberto.set(true);
  }

  protected fecharModal(): void {
    this.modalAberto.set(false);
    this.produtoEmEdicao.set(null);
  }

  protected editarProduto(produto: Produto): void {
    this.produtoEmEdicao.set(produto);
    this.modalAberto.set(true);
  }

  protected solicitarExclusao(produto: Produto): void {
    this.produtoParaExcluir.set(produto);
  }

  protected cancelarExclusao(): void {
    if (!this.excluindo()) {
      this.produtoParaExcluir.set(null);
    }
  }

  protected async excluirProduto(): Promise<void> {
    const produto = this.produtoParaExcluir();
    if (!produto || this.excluindo()) {
      return;
    }
    this.excluindo.set(true);
    try {
      await this.produtoService.remover(produto.id);
      // se a categoria filtrada ficou vazia, volta para "Todos"
      if (!this.categorias().includes(this.filtroAtual())) {
        this.filtroAtual.set(TODAS_AS_CATEGORIAS);
      }
      this.produtoParaExcluir.set(null);
      this.toastService.mostrar(`${capitalizar(this.conteudo().termoItem)} excluído`);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível excluir. Tente de novo.'));
    } finally {
      this.excluindo.set(false);
    }
  }

  protected async adicionarProduto(novoProduto: NovoProduto): Promise<void> {
    this.salvando.set(true);
    try {
      const produto = this.produtoEmEdicao();
      if (produto) {
        const atualizacao: ProdutoAtualizacao = {
          ...novoProduto,
          disponivel: produto.disponivel,
          // o formulário só manda a foto do produto à venda; nos outros, fica a atual
          fotoUrl: novoProduto.fotoUrl !== undefined ? novoProduto.fotoUrl ?? null : produto.fotoUrl ?? null,
        };
        await this.produtoService.atualizar(produto.id, atualizacao);
      } else {
        await this.produtoService.adicionar(novoProduto);
      }
      this.filtroAtual.set(TODAS_AS_CATEGORIAS);
      // mostra a aba do item salvo (Serviços ou Produtos)
      this.tipoAtual.set(novoProduto.produtoAVenda ? 'produtos' : 'servicos');
      this.fecharModal();
      const termo = novoProduto.produtoAVenda ? 'Produto' : capitalizar(this.conteudo().termoItem);
      this.toastService.mostrar(produto ? `${termo} atualizado` : `${termo} adicionado`);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível salvar. Tente de novo.'));
    } finally {
      this.salvando.set(false);
    }
  }
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
