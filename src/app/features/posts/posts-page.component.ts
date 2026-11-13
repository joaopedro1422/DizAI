import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
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
import { SessaoService } from '../../core/auth/sessao.service';
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
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { NomeIcone } from '../../shared/components/icone/icones';
import { formatarReal } from '../pedidos/textos-pedido';
import { ArtePostComponent } from './arte-post/arte-post.component';
import { baixarArquivo, compartilharArquivo, gerarPng, nomeDaFamilia } from './motor/exportar-post';
import { corDaLogo } from './motor/cor-da-logo';
import { misturar } from './motor/paletas-post';
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

const OPCOES = 4;
/** Quantas combinações já vistas a loja guarda para não repetir. */
const HISTORICO_MAXIMO = 24;
const MAXIMO_CARDAPIO = 6;

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

@Component({
  selector: 'app-posts-page',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    CarregandoComponent,
    IconeComponent,
    BottomSheetComponent,
    ArtePostComponent,
    UrlImagemPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './posts-page.component.html',
  styleUrls: ['../../shared/estilos-topo-azul.css', './posts-page.component.css', './posts-resultados.css'],
})
export class PostsPageComponent implements OnInit {
  private readonly perfilService = inject(PerfilService);
  private readonly produtoService = inject(ProdutoService);
  private readonly galeriaService = inject(GaleriaService);
  private readonly lojaPublicaService = inject(LojaPublicaService);
  private readonly postsService = inject(PostsService);
  private readonly toastService = inject(ToastService);
  private readonly rotas = inject(SessaoService).rotasDoPainel;
  protected readonly rotaInicio = computed(() => this.rotas().inicio);

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
  protected readonly opcoesDeCor: { valor: 'as-duas' | 'vitrine' | 'logo'; rotulo: string }[] = [
    { valor: 'as-duas', rotulo: 'Minha marca' },
    { valor: 'vitrine', rotulo: 'Da vitrine' },
    { valor: 'logo', rotulo: 'Da logo' },
  ];
  protected readonly orientacao = signal('');

  // ---------------------------------------------------------------- agenda (horários livres)
  protected readonly servicosAgenda = signal<ServicoAgenda[]>([]);
  protected readonly horariosAgenda = signal<DiaLivre[]>([]);
  /** Os dias que vão para a arte (às vezes o lojista só quer divulgar o dia seguinte). */
  protected readonly diasMarcados = signal<string[]>([]);
  protected readonly diasDaArte = computed(() => this.horariosAgenda().filter((d) => this.diasMarcados().includes(d.dia)));
  private readonly intervaloAgenda = signal(15);
  protected readonly carregandoAgenda = signal(false);

  // ---------------------------------------------------------------- resultado
  protected readonly gerando = signal(false);
  protected readonly opcoes = signal<OpcaoPost[]>([]);
  protected readonly escolhida = signal<OpcaoPost | null>(null);
  protected readonly exportando = signal<'baixar' | 'compartilhar' | null>(null);
  private readonly textos = signal<TextoPost[]>([]);
  private readonly base = signal<BaseDoPost | null>(null);
  private readonly logo = signal<string | null>(null);
  /** A cor principal da logo (null: logo só branca/cinza, sem logo ou ainda lendo). */
  private readonly corLogo = signal<string | null>(null);
  /** "Cor das artes": as duas (metade das artes em cada), só a da vitrine ou só a da logo. */
  protected readonly corDasArtes = signal<'as-duas' | 'vitrine' | 'logo'>('as-duas');
  /**
   * "Outra cor": uma cor a mais que entra no rodízio das artes, escolhida no seletor (hex) com a transparência. A
   * transparência vira um tom mais claro (a cor misturada ao branco): a arte continua com a cor sólida que o motor usa.
   */
  protected readonly corExtraBase = signal<string | null>(null);
  protected readonly transparenciaExtra = signal(0);
  protected readonly escolhendoCor = signal(false);
  /** A amostra do seletor com a transparência de verdade (sobre o xadrez). */
  protected readonly amostraExtra = computed(() => {
    const base = this.corExtraBase();
    return base ? `color-mix(in srgb, ${base} ${100 - this.transparenciaExtra()}%, transparent)` : 'transparent';
  });
  protected readonly corExtra = computed(() => {
    const base = this.corExtraBase();
    return base ? misturar(base, '#ffffff', this.transparenciaExtra() / 100) : null;
  });

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

  /** "+ Outra cor": abre o seletor já com uma cor para o lojista ajustar. */
  protected abrirSeletorDeCor(): void {
    if (!this.corExtraBase()) this.corExtraBase.set('#e8590c');
    this.escolhendoCor.set(true);
  }

  protected definirCorExtra(evento: Event): void {
    this.corExtraBase.set((evento.target as HTMLInputElement).value.toLowerCase());
  }

  /** O hex digitado ("E8590C" ou "#e8590c"); inválido volta ao que estava. */
  protected definirHex(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const texto = campo.value.trim().replace(/^#?/, '#').toLowerCase();
    if (/^#[0-9a-f]{6}$/.test(texto)) {
      this.corExtraBase.set(texto);
    } else {
      campo.value = (this.corExtraBase() ?? '').toUpperCase();
    }
  }

  protected definirTransparencia(evento: Event): void {
    this.transparenciaExtra.set(Number((evento.target as HTMLInputElement).value));
  }

  protected removerCorExtra(): void {
    this.corExtraBase.set(null);
    this.transparenciaExtra.set(0);
    this.escolhendoCor.set(false);
  }

  /** A cor de destaque da vitrine (nem sempre é a cor da marca). */
  protected readonly corVitrine = computed(() => buscarCorMarca(this.perfil().corMarca).hex);
  /** A cor da logo, sempre que ela existe: a escolha "Cor das artes" aparece mesmo com as cores parecidas. */
  protected readonly corLogoDiferente = computed(() => this.corLogo());

  protected readonly marca = computed<MarcaPost>(() => {
    const perfil = this.perfil();
    const corLogo = this.corLogoDiferente();
    const escolha = this.corDasArtes();
    const cor = corLogo && escolha === 'logo' ? corLogo : this.corVitrine();
    const fonte = perfil.fonteGaleria ?? 'Poppins';
    return {
      nome: perfil.nomeLoja,
      logo: this.logo(),
      cor,
      preenchimento: fundoDoDestaque(cor, perfil.estiloCor),
      // "minha marca": a cor da logo fica à mão para as artes que o sorteio pôs nela
      corLogo: corLogo && escolha === 'as-duas' ? corLogo : null,
      preenchimentoLogo: corLogo && escolha === 'as-duas' ? fundoDoDestaque(corLogo, perfil.estiloCor) : null,
      corExtra: this.corExtra(),
      preenchimentoExtra: this.corExtra() ? fundoDoDestaque(this.corExtra()!, perfil.estiloCor) : null,
      fonteTitulo: fonteComFamilia(fonte),
      fonteManuscrita: ehFonteManuscrita(fonte),
      link: `dizai.com/l/${perfil.slug}`,
    };
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
        if (this.horariosAgenda().length === 0) return 'Escolha um serviço com horários livres.';
        return this.diasDaArte().length === 0 ? 'Marque pelo menos um dia.' : '';
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
    void this.postsService.imagem(this.perfil().fotoPerfilUrl).then(async (logo) => {
      this.logo.set(logo);
      if (logo) this.corLogo.set(await corDaLogo(logo));
    });
    if (this.usaAgenda()) {
      void this.lojaPublicaService
        .buscarAgenda(this.perfil().slug)
        .then((agenda) => {
          this.servicosAgenda.set(agenda.servicos);
          this.intervaloAgenda.set(agenda.intervaloMinutos || 15);
          if (agenda.servicos.length > 0) void this.escolherServicoAgenda(agenda.servicos[0].id);
        })
        .catch(() => this.servicosAgenda.set([]));
    }
  }

  // ---------------------------------------------------------------- escolhas na tela
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

  protected alternarDia(dia: string): void {
    this.diasMarcados.update((dias) => (dias.includes(dia) ? dias.filter((d) => d !== dia) : [...dias, dia]));
  }

  protected texto(evento: Event): string {
    return (evento.target as HTMLInputElement).value;
  }

  protected async escolherServicoAgenda(id: number): Promise<void> {
    this.servicoAgendaId.set(id);
    this.carregandoAgenda.set(true);
    try {
      const dias = await this.lojaPublicaService.buscarHorarios(this.perfil().slug, [id]);
      const livres = dias
        .filter((dia) => dia.aberto && dia.horarios.length > 0)
        .slice(0, 3)
        .map((dia) => ({ dia: nomeDoDia(dia.data), horas: emFaixas(dia.horarios, this.intervaloAgenda()) }));
      this.horariosAgenda.set(livres);
      this.diasMarcados.set(livres.map((dia) => dia.dia));
    } catch {
      this.horariosAgenda.set([]);
      this.diasMarcados.set([]);
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
      // as cores da marca e a cor a mais: as artes se alternam entre elas (a escolha vale na hora, pela marca)
      origens: [
        ...(this.corLogoDiferente() ? (['vitrine', 'logo'] as const) : (['vitrine'] as const)),
        ...(this.corExtra() ? (['extra'] as const) : []),
      ],
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
    const totalHorarios = this.diasDaArte().reduce((total, dia) => total + Math.min(dia.horas.length, 6), 0);
    const semEspacoParaFoto = tipo === 'AGENDA' && totalHorarios > 8;
    const fotos = semEspacoParaFoto
      ? []
      : (await Promise.all(refs.map((ref) => this.postsService.imagem(ref)))).filter((f): f is string => !!f);

    const preco = produto ? precoDoProduto(produto) : null;
    let assunto = '';
    switch (tipo) {
      case 'DESTAQUE':
        assunto = descreverProduto(produto!);
        break;
      case 'AGENDA': {
        const servico = this.servicosAgenda().find((s) => s.id === this.servicoAgendaId());
        assunto = `Serviço: ${servico?.nome ?? ''}. Horários livres para começar: `
          + this.diasDaArte().map((d) => `${d.dia}: ${d.horas.join(', ')}`).join('; ') + '.';
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
      horarios: tipo === 'AGENDA' ? this.diasDaArte() : [],
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

function emFaixas(horarios: string[], intervalo: number): string[] {
  const minutos = (hora: string) => Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5));
  const grupos: string[][] = [];
  for (const hora of horarios) {
    const ultimo = grupos.at(-1);
    if (ultimo && minutos(hora) - minutos(ultimo.at(-1)!) <= intervalo) ultimo.push(hora);
    else grupos.push([hora]);
  }
  return grupos.flatMap((grupo) => (grupo.length >= 3 ? [`${grupo[0]} às ${grupo.at(-1)}`] : grupo));
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
