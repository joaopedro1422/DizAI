import { AvaliacoesVitrineComponent } from './avaliacoes-vitrine/avaliacoes-vitrine.component';
import { semana, situacaoAgora } from './horario-loja';
import { MapaLojaComponent } from '../../shared/components/mapa-loja/mapa-loja.component';
import { SobreVitrineComponent } from '../../shared/components/sobre-vitrine/sobre-vitrine.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DicaSobrepostaComponent } from '../../shared/components/dica-sobreposta/dica-sobreposta.component';

import { SessaoService } from '../../core/auth/sessao.service';
import { fundoDoDestaque } from '../../core/constants/estilos-cor';
import { buscarCorMarca } from '../../core/constants/cores-marca';
import { UrlImagemPipe, urlDaImagem } from '../../core/imagens/url-imagem';
import { Foto } from '../../core/models/galeria.model';
import { AlbumPublico, LojaPublica } from '../../core/models/loja-publica.model';
import { FonteVitrine, fonteComFamilia } from '../../core/models/vitrine.model';
import { LojaPublicaService } from '../../core/services/loja-publica.service';
import { ToastService } from '../../core/services/toast.service';
import { pluralizar } from '../../core/utils/colecao.utils';
import { gerarLinkWhatsapp } from '../../core/utils/texto.utils';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { VisualizadorFotoComponent } from '../../shared/components/visualizador-foto/visualizador-foto.component';
import { AgendaPublicaComponent } from './agenda-publica/agenda-publica.component';
import { OrcamentoPublicoComponent } from './orcamento-publico/orcamento-publico.component';

/** Quantas fotos o backend manda por tópico na página da loja (as outras vêm no "Ver todas"). */
const FOTOS_VISIVEIS_POR_PADRAO = 6;

/** Facilitador de orçamentos em standby: com false, lojas de produtos mostram só a galeria (como antes). */
const ORCAMENTO_NA_VITRINE = false;

type SituacaoPagina ='carregando' | 'pronta' | 'nao-encontrada' | 'erro';

/** Galeria de trabalhos, agenda online (serviços com a agenda ligada) ou orçamento (lojas de produtos). */
type AbaVitrine = 'galeria' | 'agenda' | 'orcamento';

/** Página pública com os trabalhos da loja, aberta pelo cliente a partir do link enviado no WhatsApp. */
@Component({
  selector: 'app-vitrine-publica-page',
  imports: [RouterLink, IconeComponent, LogoComponent, VisualizadorFotoComponent, CarregandoComponent, UrlImagemPipe, AgendaPublicaComponent, OrcamentoPublicoComponent, AvaliacoesVitrineComponent, MapaLojaComponent, DicaSobrepostaComponent, SobreVitrineComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vitrine-publica-page.component.html',
  styleUrls: ['./vitrine-publica-page.component.css', './cartao-loja-vitrine.css', './layout-fotos-vitrine.css', './abas-vitrine.css'],
})
export class VitrinePublicaPageComponent implements OnInit {
  /** Vem da rota /l/:slug */
  readonly slug = input.required<string>();
  /** Vem do data da rota: /l/:slug/agenda já abre na agenda. */
  readonly aba = input<AbaVitrine>('galeria');
  private readonly location = inject(Location);
  private readonly meta = inject(Meta);
  private readonly lojaPublicaService = inject(LojaPublicaService);
  private readonly sessao = inject(SessaoService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  /** Vinda do primeiro teste do painel (?conhecer=1): depois de 4 s, o convite para personalizar a página. */
  protected readonly convidarPersonalizar = signal(false);

  protected readonly situacao = signal<SituacaoPagina>('carregando');
  protected readonly introducaoAtiva = signal(false);
  protected readonly introducaoAnimacaoAtiva = signal(false);
  protected readonly fotoPerfilFalhou = signal(false);
  private readonly loja = signal<LojaPublica | null>(null);
  /** Todas as fotos dos tópicos já abertos em "Ver todas", por slug do tópico. */
  private readonly fotosCompletas = signal<ReadonlyMap<string, Foto[]>>(new Map());
  private readonly albunsExpandidos = signal<ReadonlySet<string>>(new Set());
  protected readonly albumCarregando = signal<string | null>(null);

  protected readonly albuns = computed(() => this.loja()?.albuns ?? []);
  protected readonly temAgenda = computed(() => this.loja()?.agendaAtiva === true);
  /** Serviço com agenda e nada publicado na galeria: a página é só a agenda (uma aba, na largura toda). */
  protected readonly soAgenda = computed(() => this.temAgenda() && this.loja() !== null && this.albuns().length === 0);
  protected readonly abaAtual = linkedSignal(() => this.aba());
  protected readonly mostrandoAgenda = computed(() => this.temAgenda() && (this.soAgenda() || this.abaAtual() === 'agenda'));
  /** Como as fotos aparecem (Personalizar vitrine → Fotos dos tópicos). */
  protected readonly layoutFotos = computed(() => this.loja()?.layoutFotos ?? 'GRADE');
  /** Aba "Orçamento" em standby: o componente está pronto, mas a aba só volta depois de replanejada. */
  protected readonly temOrcamento = computed(() => ORCAMENTO_NA_VITRINE && this.loja()?.orcamentoAtivo === true);
  protected readonly mostrandoOrcamento = computed(() => this.temOrcamento() && this.abaAtual() === 'orcamento');
  protected readonly numeroWhatsapp = computed(() => this.loja()?.numeroWhatsapp ?? '');
  protected readonly nomeLoja = computed(() => this.loja()?.nomeLoja ?? '');
  protected readonly descricao = computed(() => this.loja()?.descricao ?? '');
  protected readonly fotoPerfilUrl = computed(() => this.loja()?.fotoPerfilUrl ?? null);
  protected readonly capaUrl = computed(() => this.loja()?.capaUrl ?? null);
  /** Sem capa: um degradê liso da cor da loja para um tom mais claro (o mesmo da capa automática). */
  protected readonly capaDegrade = computed(() => {
    const cor = this.corDaMarca() ?? '#1c1a19';
    return `linear-gradient(135deg, ${cor}, color-mix(in srgb, ${cor} 55%, #ffffff))`;
  });

  private readonly informacoes = computed(() => this.loja()?.informacoes ?? null);
  private readonly horarios = computed(() => {
    const info = this.informacoes();
    return info && !info.horarioLivre ? info.horarios : [];
  });
  /** Selo do cartão: "Aberto agora · fecha às 19h" / "Fechado · abre amanhã às 9h" (null sem horário). */
  protected readonly statusLoja = computed(() => situacaoAgora(this.horarios()));
  protected readonly semanaDaLoja = computed(() => (this.horarios().length ? semana(this.horarios()) : []));
  protected readonly horarioLivre = computed(() => this.informacoes()?.horarioLivre === true);
  protected readonly pagamento = computed(() => listaComE(this.informacoes()?.formasPagamento ?? []));
  protected readonly recebimento = computed(() => listaComE(this.informacoes()?.formasRecebimento ?? []));
  protected readonly taxaEntrega = computed(() => this.informacoes()?.taxaEntrega ?? null);
  /** "Entrega e retirada" nas lojas de produtos; "Atendimento" quando só há atendimento no local. */
  protected readonly tituloRecebimento = computed(() => {
    const formas = this.informacoes()?.formasRecebimento ?? [];
    return formas.some((f) => f === 'Entrega' || f.startsWith('Retirada')) ? 'Entrega e retirada' : 'Atendimento';
  });
  protected readonly temInformacoes = computed(
    () => this.semanaDaLoja().length > 0 || this.horarioLivre() || !!this.pagamento() || !!this.recebimento(),
  );

  protected readonly linkWhatsapp = computed(() => gerarLinkWhatsapp(this.loja()?.numeroWhatsapp ?? ''));
  protected readonly fonteSelecionada = computed<FonteVitrine>(
    () => this.loja()?.fonteGaleria ?? 'Poppins',
  );
  /** Tema escuro (Cor de fundo → "Tema escuro (preto)"): a página toda escura, textos e detalhes em branco. */
  protected readonly temaEscuro = computed(() => this.loja()?.corFundoGaleria === 'ESCURO');
  protected readonly fundoPagina = computed(() => {
    const loja = this.loja();
    const corFundo = loja?.corFundoGaleria;
    if (corFundo === 'ESCURO') {
      return '#0f0e0d';
    }
    if (corFundo === 'BRANCO') {
      return '#ffffff';
    }
    if (corFundo === 'SEM_COR') {
      return 'transparent';
    }
    return buscarCorMarca(corFundo ?? loja?.corMarca ?? 'PRETO').fundo;
  });
  protected readonly areaFundo = computed(() =>
    this.temaEscuro() ? 'PAGINA' : (this.loja()?.areaCorFundoGaleria ?? 'CABECALHO'),
  );

  /** O `background` dos botões e etiquetas: a cor de destaque no estilo escolhido (normal, metálico...). */
  protected readonly fundoDestaque = computed(() => {
    const cor = this.corDaMarca();
    if (!cor) {
      return null;
    }
    // no escuro, preto e grafite sumiriam no fundo: os botões ficam num cinza um pouco mais claro
    const corNoTema = this.temaEscuro() && (cor === '#151515' || cor === '#3F4652') ? '#3a3633' : cor;
    return fundoDoDestaque(corNoTema, this.loja()?.estiloCor);
  });

  protected readonly corSelecao = computed(() => {
    const cor = this.corDaMarca();
    if (!this.temaEscuro() || !cor) {
      return null;
    }
    return cor === '#151515' || cor === '#3F4652' ? '#8a837d' : cor;
  });

  /** A cor escolhida pelo lojista (os preenchimentos usam ela também no tema escuro). */
  private readonly corDaMarca = computed(() => {
    const corMarca = this.loja()?.corMarca;
    return corMarca ? buscarCorMarca(corMarca).hex : null;
  });

  protected readonly corDestaque = computed(() => (this.temaEscuro() ? '#ffffff' : this.corDaMarca()));
  protected readonly inicial = computed(() => this.nomeLoja().trim().charAt(0).toUpperCase());

  /** Foto ampliada no momento (fotos do tópico + posição). */
  protected readonly fotoAberta = signal<{ titulo: string; fotos: Foto[]; indice: number } | null>(null);

  ngOnInit(): void {
    void this.carregarLoja();
  }

  private atualizarMetaTags(loja: LojaPublica): void {
    const descricao = loja.descricao?.trim() || 'Veja os nossos trabalhos e fale com a gente pelo WhatsApp.';
    this.meta.updateTag({ name: 'description', content: descricao });
    this.meta.updateTag({ property: 'og:title', content: loja.nomeLoja });
    this.meta.updateTag({ property: 'og:description', content: descricao });
    const imagem = urlDaImagem(loja.capaUrl ?? loja.fotoPerfilUrl);
    if (imagem) {
      this.meta.updateTag({ property: 'og:image', content: new URL(imagem, location.origin).href });
    }
  }

  /** Só para o dono logado e só nesta abertura: o ?conhecer=1 sai do endereço na hora. */
  private convidarSeVeioDoTeste(): void {
    if (new URLSearchParams(window.location.search).get('conhecer') !== '1') {
      return;
    }
    this.location.replaceState(this.caminho(this.aba()));
    if (this.sessao.estaAutenticado()) {
      setTimeout(() => this.convidarPersonalizar.set(true), 4000);
    }
  }

  protected voltarAoPainel(): void {
    this.convidarPersonalizar.set(false);
    void this.router.navigateByUrl(this.sessao.rotasDoPainel().inicio);
  }

  private async carregarLoja(): Promise<void> {
    try {
      const loja = await this.lojaPublicaService.buscarLoja(this.slug());
      this.loja.set(loja);
      document.title = `${loja.nomeLoja} | ${tituloDaAba(this.aba(), loja)}`;
      this.atualizarMetaTags(loja);
      this.iniciarIntroducao();
      this.situacao.set('pronta');
      this.contarVisita(loja.slug);
      this.convidarSeVeioDoTeste();
      // link antigo (a loja mudou de nome): o endereço passa a ser o do nome novo
      if (loja.slug !== this.slug()) {
        this.location.replaceState(this.caminho(this.aba()));
      }
    } catch (erro) {
      const naoExiste = erro instanceof HttpErrorResponse && erro.status === 404;
      this.situacao.set(naoExiste ? 'nao-encontrada' : 'erro');
    }
  }

  private contarVisita(slug: string): void {
    if (this.sessao.estaAutenticado()) {
      return;
    }
    const chave = `dizai:visita:${slug}`;
    try {
      if (sessionStorage.getItem(chave)) {
        return;
      }
      sessionStorage.setItem(chave, '1');
    } catch {
      // navegação privada sem sessionStorage: conta mesmo assim
    }
    void this.lojaPublicaService.registrarVisita(slug);
  }

  private iniciarIntroducao(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.introducaoAtiva.set(true);
    if (!this.fotoPerfilUrl()) {
      this.iniciarAnimacaoIntroducao();
    }
  }

  protected iniciarAnimacaoIntroducao(): void {
    if (this.introducaoAtiva()) {
      this.introducaoAnimacaoAtiva.set(true);
    }
  }

  protected falhouFotoPerfil(): void {
    this.fotoPerfilFalhou.set(true);
    this.iniciarAnimacaoIntroducao();
  }

  protected finalizarIntroducao(evento: AnimationEvent): void {
    if (evento.animationName === 'vitrine-introducao-fundo') {
      this.introducaoAtiva.set(false);
      this.introducaoAnimacaoAtiva.set(false);
    }
  }

  /** Troca a aba e o endereço (/l/slug ou /l/slug/agenda), para o link copiado abrir onde o cliente estava. */
  protected mudarAba(aba: AbaVitrine): void {
    this.abaAtual.set(aba);
    this.location.replaceState(this.caminho(aba));
    document.title = `${this.nomeLoja()} | ${tituloDaAba(aba, this.loja())}`;
  }

  /** /l/slug ou /l/slug/agenda, com o slug atual da loja (o da rota pode ser um link antigo). */
  private caminho(aba: AbaVitrine): string {
    const slug = this.loja()?.slug ?? this.slug();
    return `/l/${slug}${aba === 'galeria' ? '' : '/' + aba}`;
  }

  protected recarregar(): void {
    this.situacao.set('carregando');
    void this.carregarLoja();
  }

  protected fotosParaExibir(album: AlbumPublico): Foto[] {
    const completas = this.fotosCompletas().get(album.slug);
    if (completas && this.estaExpandido(album)) {
      return completas;
    }
    // id de verdade (o do link da foto); sem ele (resposta antiga), a posição
    return album.fotos
      .slice(0, FOTOS_VISIVEIS_POR_PADRAO)
      .map((url, indice) => ({ id: album.idsFotos?.[indice] ?? -1 - indice, url }));
  }

  protected temMaisFotos(album: AlbumPublico): boolean {
    return album.quantidadeFotos > FOTOS_VISIVEIS_POR_PADRAO;
  }

  protected estaExpandido(album: AlbumPublico): boolean {
    return this.albunsExpandidos().has(album.slug);
  }

  protected contagemFotos(album: AlbumPublico): string {
    return pluralizar(album.quantidadeFotos, 'foto', 'fotos');
  }

  /** "Ver todas" busca as fotos do tópico na primeira vez; depois só abre e fecha. */
  protected async alternarExpansao(album: AlbumPublico): Promise<void> {
    if (this.estaExpandido(album)) {
      this.definirExpansao(album.slug, false);
      return;
    }
    if (!this.fotosCompletas().has(album.slug)) {
      if (this.albumCarregando()) {
        return;
      }
      this.albumCarregando.set(album.slug);
      try {
        const detalhe = await this.lojaPublicaService.buscarAlbum(this.slug(), album.slug);
        const fotos: Foto[] = detalhe.fotos.map((foto, indice) => ({
          id: foto.id ?? -1 - indice,
          url: foto.url,
          legenda: foto.legenda,
        }));
        this.fotosCompletas.update((mapa) => new Map(mapa).set(album.slug, fotos));
      } catch {
        this.toastService.mostrar('Não foi possível abrir as fotos. Tente de novo.');
        return;
      } finally {
        this.albumCarregando.set(null);
      }
    }
    this.definirExpansao(album.slug, true);
  }

  protected abrirFoto(album: AlbumPublico, indice: number): void {
    this.fotoAberta.set({ titulo: album.nome, fotos: this.fotosParaExibir(album), indice });
  }

  protected fecharFoto(): void {
    this.fotoAberta.set(null);
  }

  /** Menu das categorias: arredondado (padrão) ou minimalista (texto com a barra de destaque embaixo). */
  protected readonly menuMinimalista = computed(() => this.loja()?.estiloMenu === 'MINIMALISTA');
  /** Abas Vitrine | Agendar horário: pílula (o padrão), sublinhado ou contorno (abas-vitrine.css). */
  protected readonly estiloAbas = computed(() => this.loja()?.estiloAbas ?? 'PILULA');

  /** A categoria tocada fica marcada no menu (null = a primeira). */
  protected readonly albumAtivo = signal<string | null>(null);

  protected irParaAlbum(album: AlbumPublico): void {
    this.albumAtivo.set(album.slug);
    document.getElementById(this.idSecao(album))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected idSecao(album: AlbumPublico): string {
    return `album-${album.slug}`;
  }

  private definirExpansao(slugAlbum: string, expandido: boolean): void {
    this.albunsExpandidos.update((expandidos) => {
      const novos = new Set(expandidos);
      if (expandido) {
        novos.add(slugAlbum);
      } else {
        novos.delete(slugAlbum);
      }
      return novos;
    });
  }

  protected readonly fonteCss = computed(() => fonteComFamilia(this.fonteSelecionada()));
}

/** ["Pix", "Dinheiro", "Cartão"] -> "Pix, Dinheiro e Cartão"; vazio = "". */
function listaComE(itens: string[]): string {
  return itens.length <= 1 ? (itens[0] ?? '') : `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`;
}

function tituloDaAba(aba: AbaVitrine, loja: LojaPublica | null): string {
  if (aba === 'agenda' && loja?.agendaAtiva) {
    return 'Agenda online';
  }
  if (aba === 'orcamento' && loja?.orcamentoAtivo) {
    return 'Orçamento';
  }
  return 'Galeria de trabalhos';
}
