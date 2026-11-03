import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../core/api/erro-api';
import { SessaoService } from '../../core/auth/sessao.service';
import { NovoProduto, Produto, ProdutoAtualizacao } from '../../core/models/produto.model';
import { ramoDeServico, ramoUsaAgenda } from '../../core/models/perfil.model';
import { AgendaService } from '../../core/services/agenda.service';
import { ConteudoRamoService } from '../../core/services/conteudo-ramo.service';
import { DicasVistasService } from '../../core/services/dicas-vistas.service';
import { PerfilService } from '../../core/services/perfil.service';
import { ProdutoService } from '../../core/services/produto.service';
import { ToastService } from '../../core/services/toast.service';
import { pluralizar } from '../../core/utils/colecao.utils';
import { BotaoVideoComponent } from '../../shared/components/video-tutorial/botao-video.component';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { DicaSobrepostaComponent, ItemDica } from '../../shared/components/dica-sobreposta/dica-sobreposta.component';
import { perguntaDoPrimeiroTeste, testeFeito } from '../painel/onboarding/progresso-onboarding';
import { CabecalhoPaginaComponent } from '../../shared/components/cabecalho-pagina/cabecalho-pagina.component';
import { EstadoVazioComponent } from '../../shared/components/estado-vazio/estado-vazio.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { ProdutoCardComponent } from './produto-card/produto-card.component';
import { ProdutoFormularioComponent } from './produto-formulario/produto-formulario.component';
import { TipoVideoCadastro, VideoCadastroComponent } from './video-cadastro/video-cadastro.component';
import { GuiaCadastroComponent } from './guia-cadastro/guia-cadastro.component';

const TODAS_AS_CATEGORIAS = 'Todos';


/** Fim das boas-vindas (lojas de produtos): quanto tempo o exemplo fica à vista antes da janela do teste. */
const ESPERA_JANELA_EXEMPLO_MS = 3000;

@Component({
  selector: 'app-produtos-page',
  imports: [
    GuiaCadastroComponent,
    DicaSobrepostaComponent,
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
  styleUrls: ['../../shared/estilos-listagem.css', './produtos-page.component.css', './produtos-pc.css'],
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
  /** "Duplicar": o item que serve de base para o novo cadastro. */
  protected readonly produtoModelo = signal<Produto | null>(null);
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
    this.produtoService.produtos().length === 0 ? `Cadastrar meu primeiro ${this.conteudo().termoItem}` : 'Entendi',
  );

  /** Fecha o vídeo; pelo botão principal, se a loja ainda não tem produtos, já abre o cadastro. */
  protected fecharVideo(abrirCadastro: boolean): void {
    this.dicasVistas.marcarComoVista('cadastro-produtos');
    this.mostrarVideo.set(false);
    if (abrirCadastro && this.produtoService.produtos().length === 0) {
      this.abrirModal();
    }
  }

  /** Primeiro item cadastrado: convite para ver o assistente respondendo sobre ele (o nome do item). */
  protected readonly convidarTeste = signal<string | null>(null);
  private readonly router = inject(Router);
  private readonly rotaAtual = inject(ActivatedRoute);
  private readonly rotasPainel = inject(SessaoService).rotasDoPainel;

  /**
   * Vindo do fim do tour (?exemplo=1, lojas de produtos): o produto de exemplo que a conta ganhou nas boas-vindas,
   * com o convite para ver o assistente vendendo ele (o primeiro teste conversa sozinho até o pedido).
   */
  protected readonly mostrarExemplo = signal(false);
  private exemploPedido = false;
  /** O exemplo na janela: o produto e o que ele tem (preço e as opções), para o lojista saber o que vai ver. */
  protected readonly exemploParaMostrar = computed<ItemDica[] | null>(() => {
    const produto = this.produtoService.produtos().find((p) => !p.produtoAVenda);
    if (!this.mostrarExemplo() || this.carregando() || !produto) {
      return null;
    }
    const preco = produto.preco != null ? `R$ ${produto.preco.toFixed(2).replace('.', ',')}` : 'Preço sob consulta';
    const opcoes = produto.atributos.map((a) => a.nome);
    const detalhe = opcoes.length ? `${preco} · ${opcoes.slice(0, -1).join(', ')}${opcoes.length > 1 ? ' e ' : ''}${opcoes[opcoes.length - 1]}` : preco;
    return [{ icone: 'caixa', titulo: produto.nome, texto: detalhe }];
  });

  protected verAssistenteVendendo(): void {
    this.mostrarExemplo.set(false);
    void this.router.navigate([this.rotasPainel().atendimento], { queryParams: { testar: 1 } });
  }

  ngOnInit(): void {
    const abrirCadastro = this.rotaAtual.snapshot.queryParamMap.has('novo');
    if (this.rotaAtual.snapshot.queryParamMap.has('exemplo')) {
      this.exemploPedido = true;
      this.mostrarVideo.set(false);   // o vídeo do cadastro fica para a próxima visita
      void this.router.navigate([], { relativeTo: this.rotaAtual, queryParams: {}, replaceUrl: true });
    }
    this.produtoService
      .carregar()
      .then(async () => {
        // fim do tour: o exemplo é criado nas boas-vindas; se faltar (boas-vindas puladas, erro), cria agora
        if (this.exemploPedido && this.produtoService.produtos().length === 0) {
          await this.produtoService.criarExemplo();
        }
        if (this.exemploPedido) {
          // o lojista vê o produto pronto na lista e, depois, a janela obrigatória do teste
          window.setTimeout(() => this.mostrarExemplo.set(true), ESPERA_JANELA_EXEMPLO_MS);
        }
        // vindo do onboarding: o vídeo da primeira visita já leva ao cadastro; sem ele, abre o formulário
        if (abrirCadastro && !this.mostrarVideo()) {
          this.abrirModal();
        }
      })
      .catch((erro: unknown) => this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR)));
    if (abrirCadastro) {
      void this.router.navigate([], { relativeTo: this.rotaAtual, queryParams: {}, replaceUrl: true });
    }
  }

  /**
   * Serviços com agenda e sem horários: o convite leva primeiro aos horários (a agenda abre direto em Configure),
   * senão o teste não tem horário para oferecer.
   */
  protected readonly faltamHorarios = computed(
    () => ramoUsaAgenda(this.perfil().ramo) && (this.agendaService.configuracao()?.periodos.length ?? 0) === 0,
  );
  private readonly agendaService = inject(AgendaService);

  /** "Testar agora": abre o teste com uma pergunta sobre o item já escrita (ou os horários, quando faltam). */
  protected testarPrimeiroItem(): void {
    const nome = this.convidarTeste() ?? '';
    this.convidarTeste.set(null);
    if (this.faltamHorarios()) {
      void this.router.navigate([this.rotasPainel().agenda]);
      return;
    }
    const pergunta = perguntaDoPrimeiroTeste(ramoDeServico(this.perfil().ramo), nome);
    void this.router.navigate([this.rotasPainel().atendimento], { queryParams: { testar: 1, pergunta } });
  }

  protected filtrar(categoria: string): void {
    this.filtroAtual.set(categoria);
  }

  protected escolherTipo(tipo: 'servicos' | 'produtos'): void {
    this.tipoAtual.set(tipo);
    this.filtroAtual.set(TODAS_AS_CATEGORIAS);
  }

  /** Tutorial do formulário (lojas de produtos): na primeira vez que o lojista abre "Novo produto", ou pelo link do modal. */
  protected readonly mostrarGuia = signal(false);
  protected readonly lojaDeProdutos = computed(() => !ramoDeServico(this.perfil().ramo));

  protected abrirModal(produtoAVenda = false): void {
    this.produtoEmEdicao.set(null);
    this.produtoModelo.set(null);
    this.novoProdutoAVenda.set(produtoAVenda);
    this.modalAberto.set(true);
    if (this.lojaDeProdutos() && !produtoAVenda && this.dicasVistas.deveMostrarVideo('guia-cadastro-produto')) {
      this.mostrarGuia.set(true);
    }
  }

  protected fecharGuia(): void {
    this.dicasVistas.marcarComoVista('guia-cadastro-produto');
    this.mostrarGuia.set(false);
  }

  protected fecharModal(): void {
    this.modalAberto.set(false);
    this.produtoEmEdicao.set(null);
    this.produtoModelo.set(null);
  }

  protected editarProduto(produto: Produto): void {
    this.produtoEmEdicao.set(produto);
    this.modalAberto.set(true);
  }

  /** Abre o cadastro de um novo item já com os dados deste (serviço continua serviço; produto à venda, produto). */
  protected duplicarProduto(produto: Produto): void {
    this.produtoEmEdicao.set(null);
    this.produtoModelo.set(produto);
    this.novoProdutoAVenda.set(!!produto.produtoAVenda);
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
      const modelo = this.produtoModelo();
      if (produto) {
        const atualizacao: ProdutoAtualizacao = {
          ...novoProduto,
          disponivel: produto.disponivel,
          // o formulário só manda a foto do produto à venda; nos outros, fica a atual
          fotoUrl: novoProduto.fotoUrl !== undefined ? novoProduto.fotoUrl ?? null : produto.fotoUrl ?? null,
        };
        await this.produtoService.atualizar(produto.id, atualizacao);
      } else {
        const primeiroItem = this.produtoService.produtos().length === 0 && !novoProduto.produtoAVenda;
        // a cópia leva a foto do original (o formulário só manda a foto do produto à venda)
        await this.produtoService.adicionar(
          modelo && novoProduto.fotoUrl === undefined ? { ...novoProduto, fotoUrl: modelo.fotoUrl ?? null } : novoProduto,
        );
        if (primeiroItem && !testeFeito(this.perfil().id)) {
          if (ramoUsaAgenda(this.perfil().ramo) && !this.agendaService.configuracao()) {
            await this.agendaService.carregarConfiguracao().catch(() => undefined);
          }
          this.convidarTeste.set(novoProduto.nome);
        }
      }
      this.filtroAtual.set(TODAS_AS_CATEGORIAS);
      // mostra a aba do item salvo (Serviços ou Produtos)
      this.tipoAtual.set(novoProduto.produtoAVenda ? 'produtos' : 'servicos');
      this.fecharModal();
      const termo = novoProduto.produtoAVenda ? 'Produto' : capitalizar(this.conteudo().termoItem);
      this.toastService.mostrar(produto ? `${termo} atualizado` : modelo ? `${termo} duplicado` : `${termo} adicionado`);
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
