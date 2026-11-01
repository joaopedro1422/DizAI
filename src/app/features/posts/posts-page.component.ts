import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { mensagemDoErro } from '../../core/api/erro-api';
import { buscarCorMarca } from '../../core/constants/cores-marca';
import { fundoDoDestaque } from '../../core/constants/estilos-cor';
import { UrlImagemPipe } from '../../core/imagens/url-imagem';
import { ramoUsaAgenda } from '../../core/models/perfil.model';
import { Produto } from '../../core/models/produto.model';
import { ServicoAgenda } from '../../core/models/agenda.model';
import { ehFonteManuscrita, fonteComFamilia } from '../../core/models/vitrine.model';
import { GaleriaService } from '../../core/services/galeria.service';
import { LojaPublicaService } from '../../core/services/loja-publica.service';
import { PerfilService } from '../../core/services/perfil.service';
import { PostsService } from '../../core/services/posts.service';
import { ProdutoService } from '../../core/services/produto.service';
import { ToastService } from '../../core/services/toast.service';
import { diaPorExtenso, formatarDuracao, hojeIso, somarDias } from '../../core/utils/datas-agenda';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { CabecalhoPaginaComponent } from '../../shared/components/cabecalho-pagina/cabecalho-pagina.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { NomeIcone } from '../../shared/components/icone/icones';
import { formatarReal } from '../pedidos/textos-pedido';
import { ArtePostComponent } from './arte-post/arte-post.component';
import { baixarArquivo, compartilharArquivo, gerarPng, nomeDaFamilia } from './motor/exportar-post';
import { chaveDoEstilo, dnaDaLoja, gerarEstilos, hashTexto } from './motor/motor-post';
import { SELOS, TIPOS_POST, TextoPost, textosReserva } from './motor/textos-post';
import {
  ConteudoPost,
  DIMENSOES,
  DiaLivre,
  FormatoPost,
  ItemCardapio,
  MarcaPost,
  OpcaoPost,
  TipoPost,
} from './motor/tipos-post';

/** Quantas artes cada geração mostra. */
const OPCOES = 4;
/** Quantas combinações já vistas a loja guarda para não repetir. */
const HISTORICO_MAXIMO = 24;
const MAXIMO_CARDAPIO = 6;

/** Um atalho de "O que postar hoje": tirado dos dados da loja, cria as artes num toque. */
interface Sugestao {
  id: string;
  titulo: string;
  motivo: string;
  icone: NomeIcone;
  imagem: string | null;
  aplicar: () => void;
}

/** O que a geração usou (para "Outras artes" e "Outros textos" refazerem só uma parte). */
interface BaseDoPost {
  tipo: TipoPost;
  assunto: string;
  fotos: string[];
  preco: string | null;
  itens: ItemCardapio[];
  horarios: DiaLivre[];
  depoimento: ConteudoPost['depoimento'];
}

/**
 * Gerador de posts para redes sociais (/painel/{uuid}/posts): o lojista escolhe o que divulgar e recebe 4 artes
 * diferentes com a logo, as cores, a fonte e as fotos da loja (layouts sorteados pelo motor-post a partir do DNA
 * visual da loja), com os textos escritos pela IA. Na arte escolhida dá para ajustar o texto, baixar o PNG,
 * compartilhar (no celular, direto para o Instagram) e copiar a legenda.
 */
@Component({
  selector: 'app-posts-page',
  imports: [
    NgTemplateOutlet,
    CabecalhoPaginaComponent,
    CarregandoComponent,
    IconeComponent,
    BottomSheetComponent,
    ArtePostComponent,
    UrlImagemPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './posts-page.component.html',
  styleUrls: ['./posts-page.component.css', './posts-resultados.css'],
})
export class PostsPageComponent implements OnInit {
  private readonly perfilService = inject(PerfilService);
  private readonly produtoService = inject(ProdutoService);
  private readonly galeriaService = inject(GaleriaService);
  private readonly lojaPublicaService = inject(LojaPublicaService);
  private readonly postsService = inject(PostsService);
  private readonly toastService = inject(ToastService);

  protected readonly perfil = this.perfilService.perfil;
  protected readonly formatos: { valor: FormatoPost; rotulo: string; detalhe: string }[] = [
    { valor: 'feed', rotulo: 'Feed', detalhe: '4:5' },
    { valor: 'quadrado', rotulo: 'Quadrado', detalhe: '1:1' },
    { valor: 'story', rotulo: 'Story', detalhe: '9:16' },
  ];

  // ---------------------------------------------------------------- escolhas
  protected readonly tipo = signal<TipoPost>('DESTAQUE');
  protected readonly produtoId = signal<number | null>(null);
  protected readonly fotoRef = signal<string | null>(null);
  protected readonly semFoto = signal(false);
  protected readonly feedbackId = signal<number | null>(null);
  protected readonly oferta = signal('');
  protected readonly condicao = signal('');
  protected readonly cardapioIds = signal<number[]>([]);
  protected readonly servicoAgendaId = signal<number | null>(null);
  protected readonly formato = signal<FormatoPost>('feed');
  protected readonly orientacao = signal('');

  // ---------------------------------------------------------------- agenda (horários livres)
  protected readonly servicosAgenda = signal<ServicoAgenda[]>([]);
  protected readonly horariosAgenda = signal<DiaLivre[]>([]);
  protected readonly carregandoAgenda = signal(false);

  // ---------------------------------------------------------------- resultado
  protected readonly gerando = signal(false);
  protected readonly opcoes = signal<OpcaoPost[]>([]);
  protected readonly escolhida = signal<OpcaoPost | null>(null);
  protected readonly exportando = signal<'baixar' | 'compartilhar' | null>(null);
  private readonly textos = signal<TextoPost[]>([]);
  private readonly base = signal<BaseDoPost | null>(null);
  private readonly logo = signal<string | null>(null);

  private readonly resultados = viewChild<ElementRef<HTMLElement>>('resultados');
  private readonly arteEscolhida = viewChild<ArtePostComponent>('arteEscolhida');
  /** Largura de cada arte na grade (medida na tela). */
  protected readonly larguraCartao = signal(240);
  protected readonly larguraGrande = signal(340);

  // ---------------------------------------------------------------- dados da loja
  protected readonly produtos = computed(() => this.produtoService.produtos().filter((p) => p.disponivel !== false));
  protected readonly produtoEscolhido = computed(() => this.produtos().find((p) => p.id === this.produtoId()) ?? null);
  protected readonly fotosGaleria = computed(() =>
    this.galeriaService
      .albuns()
      .filter((album) => album.tipo !== 'FEEDBACKS' && album.tipo !== 'LOCALIZACAO')
      .flatMap((album) => album.fotos.map((foto) => ({ url: foto.url, topico: album.nome }))),
  );
  protected readonly feedbacks = computed(() =>
    this.galeriaService.albuns().flatMap((album) => (album.tipo === 'FEEDBACKS' ? album.feedbacks : [])),
  );
  protected readonly itensComPreco = computed(() => this.produtos().filter((p) => p.preco !== null));
  protected readonly usaAgenda = computed(() => ramoUsaAgenda(this.perfil().ramo));

  protected readonly tiposDisponiveis = computed(() =>
    TIPOS_POST.filter(({ tipo }) => {
      switch (tipo) {
        case 'DESTAQUE':
          return this.produtos().length > 0;
        case 'AGENDA':
          return this.usaAgenda() && this.servicosAgenda().length > 0;
        case 'NOVIDADE':
          return this.fotosGaleria().length > 0;
        case 'DEPOIMENTO':
          return this.feedbacks().length > 0;
        case 'CARDAPIO':
          return this.itensComPreco().length >= 3;
        default:
          return true;
      }
    }),
  );

  /** As fotos que o lojista pode pôr na arte (a do produto primeiro). */
  protected readonly fotosParaEscolher = computed(() => {
    const doProduto = this.tipo() === 'DESTAQUE' || this.tipo() === 'PROMOCAO' ? this.produtoEscolhido()?.fotoUrl : null;
    const urls = [...(doProduto ? [doProduto] : []), ...this.fotosGaleria().map((f) => f.url)];
    return [...new Set(urls)].slice(0, 14);
  });

  protected readonly usaFoto = computed(() => this.tipo() !== 'CARDAPIO' || this.fotosParaEscolher().length > 0);
  protected readonly icone = (nome: string) => nome as NomeIcone;

  protected readonly marca = computed<MarcaPost>(() => {
    const perfil = this.perfil();
    const cor = buscarCorMarca(perfil.corMarca).hex;
    const fonte = perfil.fonteGaleria ?? 'Poppins';
    return {
      nome: perfil.nomeLoja,
      logo: this.logo(),
      cor,
      preenchimento: fundoDoDestaque(cor, perfil.estiloCor),
      fonteTitulo: fonteComFamilia(fonte),
      fonteManuscrita: ehFonteManuscrita(fonte),
      link: `dizai.com/l/${perfil.slug}`,
    };
  });

  /**
   * "O que postar hoje": ideias tiradas dos dados da loja (horários livres de verdade, o feedback mais recente, a
   * foto nova, um item com foto e preço). Uma IA genérica não sabe nada disso; aqui é um toque e as artes saem.
   */
  protected readonly sugestoes = computed<Sugestao[]>(() => {
    const lista: Sugestao[] = [];
    const proximoDia = this.horariosAgenda()[0];
    if (this.usaAgenda() && proximoDia) {
      lista.push({
        id: 'agenda',
        titulo: 'Divulgue a agenda',
        motivo: `${proximoDia.dia} ainda tem horário livre: ${proximoDia.horas.slice(0, 3).join(', ')}`,
        icone: 'calendario',
        imagem: null,
        aplicar: () => this.aplicar('AGENDA'),
      });
    }
    const feedback = this.feedbacks()[0];
    if (feedback) {
      lista.push({
        id: 'depoimento',
        titulo: `Mostre o elogio de ${feedback.nome.split(' ')[0]}`,
        motivo: `“${feedback.texto}”`,
        icone: 'conversa',
        imagem: null,
        aplicar: () => this.aplicar('DEPOIMENTO', () => this.feedbackId.set(feedback.id)),
      });
    }
    const foto = this.fotosGaleria()[0];
    if (foto) {
      lista.push({
        id: 'novidade',
        titulo: 'Poste um trabalho da vitrine',
        motivo: `Do tópico ${foto.topico}`,
        icone: 'imagem',
        imagem: foto.url,
        aplicar: () => this.aplicar('NOVIDADE', () => this.fotoRef.set(foto.url)),
      });
    }
    const destaque = this.produtos().find((p) => p.fotoUrl && p.preco !== null) ?? this.produtos()[0];
    if (destaque) {
      lista.push({
        id: 'destaque',
        titulo: `Destaque: ${destaque.nome}`,
        motivo: [precoDoProduto(destaque), destaque.fotoUrl ? 'com a foto do cadastro' : null].filter(Boolean).join(', ')
          || 'Do seu cadastro',
        icone: 'estrela',
        imagem: destaque.fotoUrl ?? null,
        aplicar: () => this.aplicar('DESTAQUE', () => this.produtoId.set(destaque.id)),
      });
    }
    if (this.itensComPreco().length >= 3) {
      lista.push({
        id: 'cardapio',
        titulo: 'Sua tabela de preços',
        motivo: `${Math.min(this.itensComPreco().length, MAXIMO_CARDAPIO)} itens com preço, prontos para salvar no destaque`,
        icone: 'documento',
        imagem: null,
        aplicar: () => this.aplicar('CARDAPIO'),
      });
    }
    return lista;
  });

  /** O que falta escolher para criar (vazio = pode criar). */
  protected readonly falta = computed(() => {
    switch (this.tipo()) {
      case 'DESTAQUE':
        return this.produtoId() === null ? 'Escolha o serviço ou produto.' : '';
      case 'NOVIDADE':
        return this.fotoRef() === null ? 'Escolha a foto.' : '';
      case 'DEPOIMENTO':
        return this.feedbackId() === null ? 'Escolha o feedback.' : '';
      case 'PROMOCAO':
        return this.oferta().trim().length < 3 ? 'Escreva a oferta.' : '';
      case 'CARDAPIO':
        return this.cardapioIds().length < 2 ? 'Escolha pelo menos 2 itens.' : '';
      case 'AGENDA':
        return this.horariosAgenda().length === 0 ? 'Escolha um serviço com horários livres.' : '';
      default:
        return '';
    }
  });

  constructor() {
    afterNextRender(() => {
      const caixa = this.resultados()?.nativeElement;
      if (!caixa) return;
      const medir = () => {
        const largura = caixa.clientWidth;
        const colunas = largura >= 880 ? 4 : 2;
        this.larguraCartao.set(Math.floor((largura - (colunas - 1) * 16) / colunas));
        this.larguraGrande.set(Math.min(420, window.innerWidth - 64));
      };
      medir();
      const observador = new ResizeObserver(medir);
      observador.observe(caixa);
      this.destroyRef.onDestroy(() => observador.disconnect());
    });
  }

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    void this.produtoService.carregar().then(() => {
      if (this.produtoId() === null && this.produtos().length > 0) this.produtoId.set(this.produtos()[0].id);
      if (this.tiposDisponiveis().every((t) => t.tipo !== 'DESTAQUE')) this.tipo.set(this.tiposDisponiveis()[0]?.tipo ?? 'CONVITE');
    });
    void this.galeriaService.carregar();
    void this.postsService.imagem(this.perfil().fotoPerfilUrl).then((logo) => this.logo.set(logo));
    if (this.usaAgenda()) {
      void this.lojaPublicaService
        .buscarAgenda(this.perfil().slug)
        .then((agenda) => {
          this.servicosAgenda.set(agenda.servicos);
          if (agenda.servicos.length > 0) void this.escolherServicoAgenda(agenda.servicos[0].id);
        })
        .catch(() => this.servicosAgenda.set([]));
    }
  }

  // ---------------------------------------------------------------- escolhas na tela
  /** Sugestão tocada: escolhe o tipo e o conteúdo e já cria as artes. */
  private aplicar(tipo: TipoPost, preparar?: () => void): void {
    this.escolherTipo(tipo);
    preparar?.();
    void this.criar();
  }

  protected escolherTipo(tipo: TipoPost): void {
    this.tipo.set(tipo);
    this.fotoRef.set(null);
    this.semFoto.set(false);
    if (tipo === 'CARDAPIO' && this.cardapioIds().length === 0) {
      this.cardapioIds.set(this.itensComPreco().slice(0, 5).map((p) => p.id));
    }
    if (tipo === 'AGENDA' && this.servicoAgendaId() === null && this.servicosAgenda().length > 0) {
      void this.escolherServicoAgenda(this.servicosAgenda()[0].id);
    }
  }

  protected escolherFoto(url: string | null): void {
    this.semFoto.set(url === null);
    this.fotoRef.set(url);
  }

  protected alternarCardapio(id: number): void {
    this.cardapioIds.update((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : ids.length >= MAXIMO_CARDAPIO ? ids : [...ids, id],
    );
  }

  protected texto(evento: Event): string {
    return (evento.target as HTMLInputElement).value;
  }

  protected async escolherServicoAgenda(id: number): Promise<void> {
    this.servicoAgendaId.set(id);
    this.carregandoAgenda.set(true);
    try {
      const dias = await this.lojaPublicaService.buscarHorarios(this.perfil().slug, [id]);
      this.horariosAgenda.set(
        dias
          .filter((dia) => dia.aberto && dia.horarios.length > 0)
          .slice(0, 3)
          .map((dia) => ({ dia: nomeDoDia(dia.data), horas: espalhar(dia.horarios, 4) })),
      );
    } catch {
      this.horariosAgenda.set([]);
    } finally {
      this.carregandoAgenda.set(false);
    }
  }

  // ---------------------------------------------------------------- gerar
  protected async criar(): Promise<void> {
    if (this.falta() || this.gerando()) return;
    this.gerando.set(true);
    this.escolhida.set(null);
    try {
      const base = await this.montarBase();
      const textos = await this.postsService
        .escreverTextos(base.tipo, base.assunto, this.orientacao())
        .catch(() => [] as TextoPost[]);
      const usados = textos.length > 0 ? textos : textosReserva(base.tipo, this.assuntoCurto(), this.perfil().nomeLoja);
      if (textos.length === 0) {
        this.toastService.mostrar('Não foi possível escrever os textos agora: usamos frases prontas. Você pode editar.');
      }
      this.base.set(base);
      this.textos.set(usados);
      this.montarOpcoes();
      this.mostrarResultados();
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível criar as artes. Tente de novo.'));
    } finally {
      this.gerando.set(false);
    }
  }

  /** No celular as artes ficam embaixo das escolhas: a tela desce até elas. */
  private mostrarResultados(): void {
    if (window.innerWidth >= 1024) return;
    setTimeout(() => this.resultados()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }

  /** Novas composições com os mesmos textos. */
  protected outrasArtes(): void {
    if (this.base()) this.montarOpcoes();
  }

  /** Novos textos (outra chamada à IA) com novas composições. */
  protected async outrosTextos(): Promise<void> {
    const base = this.base();
    if (!base || this.gerando()) return;
    this.gerando.set(true);
    try {
      const textos = await this.postsService.escreverTextos(base.tipo, base.assunto, this.orientacao());
      if (textos.length > 0) this.textos.set(textos);
      this.montarOpcoes();
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível escrever outros textos agora.'));
    } finally {
      this.gerando.set(false);
    }
  }

  private montarOpcoes(): void {
    const base = this.base()!;
    const perfilId = this.perfil().id;
    const historico = lerHistorico(perfilId);
    const estilos = gerarEstilos({
      tipo: base.tipo,
      fotosDisponiveis: base.fotos.length,
      temPreco: !!base.preco,
      dna: dnaDaLoja(perfilId),
      historico,
      quantidade: OPCOES,
      semente: (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0,
    });
    const selos = SELOS[base.tipo];
    const deslocamento = hashTexto(perfilId) % selos.length;
    const textos = this.textos();
    this.opcoes.set(
      estilos.map((estilo, i) => {
        const texto = textos[i % textos.length];
        return {
          id: `${Date.now()}-${i}`,
          estilo,
          legenda: texto.legenda,
          conteudo: {
            tipo: base.tipo,
            selo: selos[(i + deslocamento) % selos.length],
            titulo: texto.titulo,
            apoio: texto.apoio,
            chamada: texto.chamada,
            preco: base.preco,
            fotos: base.fotos,
            itens: base.itens,
            horarios: base.horarios,
            depoimento: base.depoimento,
          },
        };
      }),
    );
    gravarHistorico(perfilId, [...estilos.map(chaveDoEstilo), ...historico]);
  }

  /** Junta o que o post vai mostrar (fotos já em data URL) e o assunto que a IA recebe. */
  private async montarBase(): Promise<BaseDoPost> {
    const tipo = this.tipo();
    const produto = tipo === 'DESTAQUE' || tipo === 'PROMOCAO' ? this.produtoEscolhido() : null;
    const feedback = this.feedbacks().find((f) => f.id === this.feedbackId()) ?? null;
    const itens = this.itensComPreco()
      .filter((p) => this.cardapioIds().includes(p.id))
      .map((p) => ({ nome: p.nome, preco: precoDoProduto(p) ?? '' }));

    // a foto escolhida primeiro; as outras da galeria completam a colagem
    const escolhida = this.semFoto() ? null : (this.fotoRef() ?? this.fotosParaEscolher()[0] ?? null);
    const refs = escolhida ? [escolhida, ...this.fotosGaleria().map((f) => f.url).filter((u) => u !== escolhida).slice(0, 2)] : [];
    const fotos = (await Promise.all(refs.map((ref) => this.postsService.imagem(ref)))).filter((f): f is string => !!f);

    const preco = produto ? precoDoProduto(produto) : null;
    let assunto = '';
    switch (tipo) {
      case 'DESTAQUE':
        assunto = descreverProduto(produto!);
        break;
      case 'AGENDA': {
        const servico = this.servicosAgenda().find((s) => s.id === this.servicoAgendaId());
        assunto = `Serviço: ${servico?.nome ?? ''}. Horários livres: `
          + this.horariosAgenda().map((d) => `${d.dia}: ${d.horas.join(', ')}`).join('; ') + '.';
        break;
      }
      case 'NOVIDADE': {
        const topico = this.fotosGaleria().find((f) => f.url === escolhida)?.topico;
        assunto = `Foto nova na vitrine${topico ? `, no tópico "${topico}"` : ''}.`;
        break;
      }
      case 'DEPOIMENTO':
        assunto = feedback ? `Depoimento de ${feedback.nome} (${feedback.estrelas} estrelas): ${feedback.texto}` : '';
        break;
      case 'PROMOCAO':
        assunto = `Oferta: ${this.oferta().trim()}.`
          + (this.condicao().trim() ? ` Condições: ${this.condicao().trim()}.` : '')
          + (produto ? ` Item: ${descreverProduto(produto)}` : '');
        break;
      case 'CARDAPIO':
        assunto = 'Lista de preços: ' + itens.map((i) => `${i.nome} ${i.preco}`).join('; ') + '.';
        break;
      case 'CONVITE':
        assunto = 'Convite para conhecer a loja e chamar no WhatsApp. O que oferecemos: '
          + this.produtos().slice(0, 6).map((p) => p.nome).join(', ') + '.';
        break;
    }
    return {
      tipo,
      assunto,
      fotos,
      preco: tipo === 'PROMOCAO' ? null : preco,
      itens: tipo === 'CARDAPIO' ? itens : [],
      horarios: tipo === 'AGENDA' ? this.horariosAgenda() : [],
      depoimento: tipo === 'DEPOIMENTO' && feedback
        ? { texto: feedback.texto, nome: feedback.nome.split(' ')[0], estrelas: feedback.estrelas }
        : null,
    };
  }

  /** O assunto em poucas palavras, para os textos de reserva. */
  private assuntoCurto(): string {
    if (this.tipo() === 'PROMOCAO') return this.oferta().trim();
    return this.produtoEscolhido()?.nome ?? '';
  }

  // ---------------------------------------------------------------- arte escolhida
  protected escolher(opcao: OpcaoPost): void {
    this.escolhida.set(structuredClone(opcao));
  }

  protected editar(campo: 'titulo' | 'apoio' | 'chamada', evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.escolhida.update((opcao) => (opcao ? { ...opcao, conteudo: { ...opcao.conteudo, [campo]: valor } } : opcao));
  }

  protected editarLegenda(evento: Event): void {
    const valor = (evento.target as HTMLTextAreaElement).value;
    this.escolhida.update((opcao) => (opcao ? { ...opcao, legenda: valor } : opcao));
  }

  protected async baixar(): Promise<void> {
    const blob = await this.gerarImagem('baixar');
    if (blob) {
      baixarArquivo(blob, this.nomeDoArquivo());
      this.toastService.mostrar('Imagem salva. É só postar e colar a legenda.');
    }
  }

  protected async compartilhar(): Promise<void> {
    const blob = await this.gerarImagem('compartilhar');
    if (!blob) return;
    const legenda = this.escolhida()?.legenda ?? '';
    await this.copiarTexto(legenda, false);
    const abriu = await compartilharArquivo(blob, this.nomeDoArquivo(), legenda).catch(() => false);
    if (!abriu) {
      baixarArquivo(blob, this.nomeDoArquivo());
      this.toastService.mostrar('Este navegador não compartilha imagens: salvamos o arquivo e copiamos a legenda.');
    }
  }

  protected async copiarLegenda(): Promise<void> {
    await this.copiarTexto(this.escolhida()?.legenda ?? '', true);
  }

  private async copiarTexto(texto: string, avisar: boolean): Promise<void> {
    try {
      await navigator.clipboard.writeText(texto);
      if (avisar) this.toastService.mostrar('Legenda copiada.');
    } catch {
      if (avisar) this.toastService.mostrar('Não foi possível copiar. Selecione o texto e copie.');
    }
  }

  private async gerarImagem(acao: 'baixar' | 'compartilhar'): Promise<Blob | null> {
    const arte = this.arteEscolhida();
    const opcao = this.escolhida();
    if (!arte || !opcao || this.exportando()) return null;
    this.exportando.set(acao);
    try {
      const { largura, altura } = DIMENSOES[this.formato()];
      return await gerarPng(arte.elemento(), largura, altura, [nomeDaFamilia(this.marca().fonteTitulo), opcao.estilo.fonteApoio]);
    } catch {
      this.toastService.mostrar('Não foi possível gerar a imagem. Tente de novo.');
      return null;
    } finally {
      this.exportando.set(null);
    }
  }

  private nomeDoArquivo(): string {
    return `post-${this.perfil().slug}-${this.tipo().toLowerCase()}.png`;
  }
}

// ---------------------------------------------------------------- ajudantes

/** "R$ 80" (sem os centavos quando são zero) ou "a partir de R$ 80"; null sem preço. */
function precoDoProduto(produto: Produto): string | null {
  const valor = produto.variacoes?.length ? Math.min(...produto.variacoes.map((v) => v.preco)) : produto.preco;
  if (valor === null || valor === undefined) return null;
  const texto = formatarReal(Number(valor)).replace(/,00$/, '').replace(/ /g, ' ');
  return produto.precoAPartirDe || (produto.variacoes?.length ?? 0) > 1 ? `a partir de ${texto}` : texto;
}

function descreverProduto(produto: Produto): string {
  const partes = [`Nome: ${produto.nome}`];
  const preco = precoDoProduto(produto);
  if (preco) partes.push(`Preço: ${preco}`);
  if (produto.duracaoMinutos) partes.push(`Duração: ${formatarDuracao(produto.duracaoMinutos)}`);
  if (produto.descricao) partes.push(`Descrição: ${produto.descricao}`);
  if (produto.categoria) partes.push(`Categoria: ${produto.categoria}`);
  return partes.join('. ') + '.';
}

/** "Hoje", "Amanhã" ou "Sábado, 08/11". */
function nomeDoDia(data: string): string {
  if (data === hojeIso()) return 'Hoje';
  if (data === somarDias(hojeIso(), 1)) return 'Amanhã';
  const texto = diaPorExtenso(data);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Até `quantidade` horários espalhados pelo dia (de manhã à noite), não só os primeiros. */
function espalhar(horarios: string[], quantidade: number): string[] {
  if (horarios.length <= quantidade) return horarios;
  const passo = (horarios.length - 1) / (quantidade - 1);
  return Array.from({ length: quantidade }, (_, i) => horarios[Math.round(i * passo)]);
}

function chaveHistorico(perfilId: string): string {
  return `dizai:posts:historico:${perfilId}`;
}

function lerHistorico(perfilId: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(chaveHistorico(perfilId)) ?? '[]') as string[];
  } catch {
    return [];
  }
}

function gravarHistorico(perfilId: string, chaves: string[]): void {
  try {
    localStorage.setItem(chaveHistorico(perfilId), JSON.stringify(chaves.slice(0, HISTORICO_MAXIMO)));
  } catch {
    // sem armazenamento: só não evita repetir
  }
}
