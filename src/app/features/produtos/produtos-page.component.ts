import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../core/api/erro-api';
import { NovoProduto } from '../../core/models/produto.model';
import { ConteudoRamoService } from '../../core/services/conteudo-ramo.service';
import { DicasVistasService } from '../../core/services/dicas-vistas.service';
import { ProdutoService } from '../../core/services/produto.service';
import { ToastService } from '../../core/services/toast.service';
import { pluralizar } from '../../core/utils/colecao.utils';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { CabecalhoPaginaComponent } from '../../shared/components/cabecalho-pagina/cabecalho-pagina.component';
import { DicaSobrepostaComponent, ItemDica } from '../../shared/components/dica-sobreposta/dica-sobreposta.component';
import { EstadoVazioComponent } from '../../shared/components/estado-vazio/estado-vazio.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { ProdutoCardComponent } from './produto-card/produto-card.component';
import { ProdutoFormularioComponent } from './produto-formulario/produto-formulario.component';

const TODAS_AS_CATEGORIAS = 'Todos';


@Component({
  selector: 'app-produtos-page',
  imports: [
    CabecalhoPaginaComponent,
    IconeComponent,
    BottomSheetComponent,
    EstadoVazioComponent,
    ProdutoCardComponent,
    ProdutoFormularioComponent,
    DicaSobrepostaComponent,
    CarregandoComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './produtos-page.component.html',
  styleUrl: '../../shared/estilos-listagem.css',
})
export class ProdutosPageComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly toastService = inject(ToastService);
  private readonly dicasVistas = inject(DicasVistasService);

  protected readonly conteudo = inject(ConteudoRamoService).conteudo;

  /** Dicas da janela de orientação, com exemplos do ramo da loja. */
  protected readonly dicasCadastro = computed<ItemDica[]>(() => {
    const { termoItem, dicasProdutos } = this.conteudo();
    return [
      {
        icone: 'prancheta',
        titulo: 'Capriche nas informações',
        texto: `Descreva o que está incluso, tamanhos, materiais, prazos e como funciona o ${termoItem}. Tudo isso vira resposta para o seu cliente.`,
      },
      {
        icone: 'caixa',
        titulo: 'Preço muda? Separe os cadastros',
        texto: `Se o valor muda com o tamanho ou o tipo, cadastre cada variação separada. ${dicasProdutos.exemploVariacao}`,
      },
      {
        icone: 'pergunta',
        titulo: 'Depende de avaliação? Deixe sem preço',
        texto: dicasProdutos.exemploSemPreco,
      },
    ];
  });
  /** Mostra a orientação no primeiro acesso ou enquanto não houver produtos. */
  protected readonly mostrarDica = signal(
    !this.dicasVistas.jaViu('cadastro-produtos') || this.produtoService.produtos().length === 0,
  );

  protected readonly categorias = this.produtoService.categorias;
  protected readonly filtroAtual = signal(TODAS_AS_CATEGORIAS);
  protected readonly modalAberto = signal(false);
  protected readonly salvando = signal(false);
  protected readonly carregando = this.produtoService.carregando;

  protected readonly filtros = computed(() => [TODAS_AS_CATEGORIAS, ...this.categorias()]);

  protected readonly produtosFiltrados = computed(() => {
    const filtro = this.filtroAtual();
    const produtos = this.produtoService.produtos();
    return filtro === TODAS_AS_CATEGORIAS ? produtos : produtos.filter((produto) => produto.categoria === filtro);
  });

  protected readonly subtitulo = computed(() => {
    const total = this.produtoService.produtos().length;
    return total === 0 ? 'Nenhum produto cadastrado ainda' : pluralizar(total, 'cadastrado', 'cadastrados');
  });

  protected readonly rotuloBotaoDica = computed(() =>
    this.produtoService.produtos().length === 0 ? 'Cadastrar meu primeiro produto' : 'Entendi',
  );

  /** Fecha a orientação; se a loja ainda não tem produtos, já abre o cadastro. */
  protected fecharDica(): void {
    this.dicasVistas.marcarComoVista('cadastro-produtos');
    this.mostrarDica.set(false);
    if (this.produtoService.produtos().length === 0) {
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

  protected abrirModal(): void {
    this.modalAberto.set(true);
  }

  protected fecharModal(): void {
    this.modalAberto.set(false);
  }

  protected async adicionarProduto(novoProduto: NovoProduto): Promise<void> {
    this.salvando.set(true);
    try {
      await this.produtoService.adicionar(novoProduto);
      this.filtroAtual.set(TODAS_AS_CATEGORIAS);
      this.fecharModal();
      this.toastService.mostrar(`${capitalizar(this.conteudo().termoItem)} adicionado`);
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
