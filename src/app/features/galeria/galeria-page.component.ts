import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../core/api/erro-api';
import { NovoAlbum } from '../../core/models/galeria.model';
import { buscarCorMarca } from '../../core/constants/cores-marca';
import { ArmazenamentoFotosService } from '../../core/services/armazenamento-fotos.service';
import { ConteudoRamoService } from '../../core/services/conteudo-ramo.service';
import { GaleriaService } from '../../core/services/galeria.service';
import { PerfilService } from '../../core/services/perfil.service';
import { ToastService } from '../../core/services/toast.service';
import { pluralizar } from '../../core/utils/colecao.utils';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { CabecalhoPaginaComponent } from '../../shared/components/cabecalho-pagina/cabecalho-pagina.component';
import { EstadoVazioComponent } from '../../shared/components/estado-vazio/estado-vazio.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { AlbumCardComponent } from './album-card/album-card.component';
import { FotosEscolhidas, FotosFormularioComponent } from './fotos-formulario/fotos-formulario.component';
import { SeletorCorMarcaComponent } from './seletor-cor-marca/seletor-cor-marca.component';
import { TopicoFormularioComponent } from './topico-formulario/topico-formulario.component';

type ModalGaleria = 'topico' | 'fotos' | 'cor' | null;

@Component({
  selector: 'app-galeria-page',
  imports: [
    RouterLink,
    CabecalhoPaginaComponent,
    IconeComponent,
    BottomSheetComponent,
    EstadoVazioComponent,
    AlbumCardComponent,
    TopicoFormularioComponent,
    FotosFormularioComponent,
    CarregandoComponent,
    SeletorCorMarcaComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './galeria-page.component.html',
  styleUrls: ['../../shared/estilos-listagem.css', './galeria-page.component.css'],
})
export class GaleriaPageComponent implements OnInit {
  private readonly galeriaService = inject(GaleriaService);
  private readonly armazenamentoFotos = inject(ArmazenamentoFotosService);
  private readonly toastService = inject(ToastService);

  private readonly perfil = inject(PerfilService).perfil;
  protected readonly caminhoPaginaPublica = inject(PerfilService).caminhoPaginaPublica;
  /** Amostra da cor atual no botão "Cor da página". */
  protected readonly corPagina = computed(() => buscarCorMarca(this.perfil().corMarca).hex);
  protected readonly albuns = this.galeriaService.albuns;
  /** Primeiro tópico sugerido para o ramo, usado como exemplo no aviso da tela. */
  private readonly conteudo = inject(ConteudoRamoService).conteudo;
  protected readonly exemploTopico = computed(() => this.conteudo().topicosSugeridos[0]);
  protected readonly modalAberto = signal<ModalGaleria>(null);
  protected readonly albumParaFotos = signal<number | null>(null);
  protected readonly enviandoFotos = signal(false);
  protected readonly criandoTopico = signal(false);
  protected readonly carregando = this.galeriaService.carregando;

  protected readonly semTopicos = computed(() => this.albuns().length === 0);

  protected readonly resumo = computed(() => {
    const topicos = pluralizar(this.albuns().length, 'tópico', 'tópicos');
    const fotos = pluralizar(this.galeriaService.totalFotos(), 'foto', 'fotos');
    return `${topicos} · ${fotos}`;
  });

  ngOnInit(): void {
    this.galeriaService
      .carregar()
      .catch((erro: unknown) => this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR)));
  }

  protected abrirCorPagina(): void {
    this.modalAberto.set('cor');
  }

  protected abrirNovoTopico(): void {
    this.modalAberto.set('topico');
  }

  /** Abre a seleção de fotos. Se só existe um tópico, ele já vem escolhido. */
  protected abrirAdicionarFotos(albumId: number | null = null): void {
    if (this.semTopicos()) {
      this.toastService.mostrar('Crie um tópico antes de adicionar fotos.');
      return;
    }
    const unicoAlbum = this.albuns().length === 1 ? this.albuns()[0].id : null;
    this.albumParaFotos.set(albumId ?? unicoAlbum);
    this.modalAberto.set('fotos');
  }

  protected fecharModal(): void {
    if (!this.enviandoFotos() && !this.criandoTopico()) {
      this.modalAberto.set(null);
    }
  }

  /** Fluxo guiado: criou o tópico, já segue para escolher as fotos dele. */
  protected async criarTopico(novoAlbum: NovoAlbum): Promise<void> {
    this.criandoTopico.set(true);
    try {
      const album = await this.galeriaService.criarAlbum(novoAlbum);
      this.abrirAdicionarFotos(album.id);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível criar o tópico. Tente de novo.'));
    } finally {
      this.criandoTopico.set(false);
    }
  }

  protected async enviarFotos({ albumId, arquivos }: FotosEscolhidas): Promise<void> {
    this.enviandoFotos.set(true);
    try {
      const referencias = await this.armazenamentoFotos.enviar(arquivos, { tipo: 'GALERIA', albumId });
      await this.galeriaService.adicionarFotos(albumId, referencias);
      const nomeAlbum = this.galeriaService.buscarAlbum(albumId)?.nome ?? 'o tópico';
      const adicionadas = pluralizar(referencias.length, 'foto adicionada', 'fotos adicionadas');
      this.toastService.mostrar(`${adicionadas} em ${nomeAlbum}`);
      this.modalAberto.set(null);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível enviar as fotos. Tente de novo.'));
    } finally {
      this.enviandoFotos.set(false);
    }
  }
}
