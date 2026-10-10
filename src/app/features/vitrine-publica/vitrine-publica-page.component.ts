import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { buscarCorMarca } from '../../core/constants/cores-marca';
import { UrlImagemPipe } from '../../core/imagens/url-imagem';
import { Foto } from '../../core/models/galeria.model';
import { AlbumPublico, LojaPublica } from '../../core/models/loja-publica.model';
import { LojaPublicaService } from '../../core/services/loja-publica.service';
import { ToastService } from '../../core/services/toast.service';
import { pluralizar } from '../../core/utils/colecao.utils';
import { gerarLinkWhatsapp } from '../../core/utils/texto.utils';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { VisualizadorFotoComponent } from '../../shared/components/visualizador-foto/visualizador-foto.component';

/** Quantas fotos o backend manda por tópico na página da loja (as outras vêm no "Ver todas"). */
const FOTOS_VISIVEIS_POR_PADRAO = 6;

type SituacaoPagina = 'carregando' | 'pronta' | 'nao-encontrada' | 'erro';

/** Página pública com os trabalhos da loja, aberta pelo cliente a partir do link enviado no WhatsApp. */
@Component({
  selector: 'app-vitrine-publica-page',
  imports: [RouterLink, IconeComponent, LogoComponent, VisualizadorFotoComponent, CarregandoComponent, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vitrine-publica-page.component.html',
  styleUrl: './vitrine-publica-page.component.css',
})
export class VitrinePublicaPageComponent implements OnInit {
  /** Vem da rota /loja/:slug */
  readonly slug = input.required<string>();

  private readonly lojaPublicaService = inject(LojaPublicaService);
  private readonly toastService = inject(ToastService);

  protected readonly situacao = signal<SituacaoPagina>('carregando');
  private readonly loja = signal<LojaPublica | null>(null);
  /** Todas as fotos dos tópicos já abertos em "Ver todas", por slug do tópico. */
  private readonly fotosCompletas = signal<ReadonlyMap<string, Foto[]>>(new Map());
  private readonly albunsExpandidos = signal<ReadonlySet<string>>(new Set());
  protected readonly albumCarregando = signal<string | null>(null);

  protected readonly albuns = computed(() => this.loja()?.albuns ?? []);
  protected readonly nomeLoja = computed(() => this.loja()?.nomeLoja ?? '');
  protected readonly descricao = computed(() => this.loja()?.descricao ?? '');
  protected readonly fotoPerfilUrl = computed(() => this.loja()?.fotoPerfilUrl ?? null);
  protected readonly linkWhatsapp = computed(() => gerarLinkWhatsapp(this.loja()?.numeroWhatsapp ?? ''));

  /** Cor escolhida pelo lojista no painel (sempre escura, para o texto branco). */
  protected readonly corDestaque = computed(() => {
    const corMarca = this.loja()?.corMarca;
    return corMarca ? buscarCorMarca(corMarca).hex : null;
  });

  protected readonly inicial = computed(() => this.nomeLoja().trim().charAt(0).toUpperCase());

  /** Foto ampliada no momento (fotos do tópico + posição). */
  protected readonly fotoAberta = signal<{ titulo: string; fotos: Foto[]; indice: number } | null>(null);

  ngOnInit(): void {
    void this.carregarLoja();
  }

  private async carregarLoja(): Promise<void> {
    try {
      const loja = await this.lojaPublicaService.buscarLoja(this.slug());
      this.loja.set(loja);
      document.title = `${loja.nomeLoja} | Galeria de trabalhos`;
      this.situacao.set('pronta');
    } catch (erro) {
      const naoExiste = erro instanceof HttpErrorResponse && erro.status === 404;
      this.situacao.set(naoExiste ? 'nao-encontrada' : 'erro');
    }
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
    return album.fotos.slice(0, FOTOS_VISIVEIS_POR_PADRAO).map((url, indice) => ({ id: indice, url }));
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
        const fotos: Foto[] = detalhe.fotos.map((foto, indice) => ({ id: indice, url: foto.url, legenda: foto.legenda }));
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

  protected irParaAlbum(album: AlbumPublico): void {
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
}
