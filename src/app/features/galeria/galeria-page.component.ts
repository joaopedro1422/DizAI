import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../core/api/erro-api';
import { Album, NovoAlbum } from '../../core/models/galeria.model';
import { VisitasGaleria } from '../../core/models/visitas.model';
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
import { DicaSobrepostaComponent, ItemDica } from '../../shared/components/dica-sobreposta/dica-sobreposta.component';
import { EstadoVazioComponent } from '../../shared/components/estado-vazio/estado-vazio.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { AlbumCardComponent } from './album-card/album-card.component';
import { FotosEscolhidas, FotosFormularioComponent } from './fotos-formulario/fotos-formulario.component';
import { SeletorCorMarcaComponent } from './seletor-cor-marca/seletor-cor-marca.component';
import { TopicoFormularioComponent } from './topico-formulario/topico-formulario.component';

type ModalGaleria = 'topico' | 'fotos' | 'vitrine' | 'excluir' | null;

/** Apresentação da galeria, na primeira vez que o lojista abre a tela (introGaleriaVista no perfil). */
const ITENS_INTRO_GALERIA: ItemDica[] = [
  {
    icone: 'imagem',
    titulo: 'Mostre seus trabalhos',
    texto: 'Separe as fotos em tópicos, como "Unhas em gel" ou "Bolos de aniversário". Quando o cliente pedir para ver, o assistente envia o link da sua página.',
  },
  {
    icone: 'prancheta',
    titulo: 'Cardápios e catálogos também',
    texto: 'Crie um tópico para o cardápio, a tabela de preços ou o catálogo em fotos. Fica tudo num lugar só, fácil de mandar.',
  },
  {
    icone: 'ajustes',
    titulo: 'Com a cara da sua loja',
    texto: 'Em "Personalizar vitrine" você escolhe as cores, a fonte e a foto de capa da página.',
  }
];

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
    DicaSobrepostaComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './galeria-page.component.html',
  styleUrls: ['../../shared/estilos-listagem.css', './galeria-page.component.css'],
})
export class GaleriaPageComponent implements OnInit {
  private readonly galeriaService = inject(GaleriaService);
  private readonly armazenamentoFotos = inject(ArmazenamentoFotosService);
  private readonly toastService = inject(ToastService);

  private readonly perfilService = inject(PerfilService);
  private readonly perfil = this.perfilService.perfil;
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
  protected readonly excluindoTopico = signal(false);
  protected readonly topicoParaExcluir = signal<Album | null>(null);
  protected readonly carregando = this.galeriaService.carregando;
  protected readonly ordemRascunho = signal<number[]>([]);
  protected readonly ordemSalva = signal<number[]>([]);
  protected readonly salvandoOrdem = signal(false);
  /** Apresentação da galeria: abre uma vez por loja (introGaleriaVista no perfil). */
  protected readonly mostrarIntro = signal(false);
  protected readonly itensIntro = ITENS_INTRO_GALERIA;
  /** Visitas à página pública; null enquanto carrega ou se a busca falhar (o card some). */
  protected readonly visitas = signal<VisitasGaleria | null>(null);
  protected readonly textoVisitas = computed(() =>
    `${pluralizar(this.visitas()?.ultimos7Dias ?? 0, 'visualização', 'visualizações')} esta semana`,
  );

  protected readonly semTopicos = computed(() => this.albuns().length === 0);
  protected readonly albunsNaOrdemRascunho = computed(() => {
    const albunsPorId = new Map(this.albuns().map((album) => [album.id, album]));
    return this.ordemRascunho()
      .map((id) => albunsPorId.get(id))
      .filter((album): album is Album => album !== undefined);
  });
  protected readonly temAlteracoesOrdem = computed(
    () => JSON.stringify(this.ordemRascunho()) !== JSON.stringify(this.ordemSalva()),
  );

  protected readonly resumo = computed(() => {
    const topicos = pluralizar(this.albuns().length, 'tópico', 'tópicos');
    const fotos = pluralizar(this.galeriaService.totalFotos(), 'foto', 'fotos');
    return `${topicos} · ${fotos}`;
  });

  ngOnInit(): void {
    // só quando o backend diz que ainda não viu (=== false): backend antigo, sem o campo, não abre a janela
    this.mostrarIntro.set(this.perfil().introGaleriaVista === false);
    this.galeriaService
      .buscarVisitas()
      .then((visitas) => this.visitas.set(visitas))
      .catch(() => undefined);   // só informativo: sem aviso de erro
    this.galeriaService
      .carregar()
      .then(() => {
        const ids = this.albuns().map((album) => album.id);
        this.ordemRascunho.set(ids);
        this.ordemSalva.set(ids);
      })
      .catch((erro: unknown) => this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR)));
  }

  protected fecharIntro(): void {
    this.mostrarIntro.set(false);
    this.perfilService.marcarIntroGaleriaVista();
  }

  protected abrirConfiguracaoVitrine(): void {
    this.modalAberto.set('vitrine');
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
    if (!this.enviandoFotos() && !this.criandoTopico() && !this.excluindoTopico()) {
      this.modalAberto.set(null);
      this.topicoParaExcluir.set(null);
    }
  }

  protected solicitarExclusaoTopico(album: Album): void {
    if (this.salvandoOrdem()) {
      this.toastService.mostrar('Aguarde o salvamento da ordem antes de excluir um tópico.');
      return;
    }
    this.topicoParaExcluir.set(album);
    this.modalAberto.set('excluir');
  }

  protected async excluirTopico(): Promise<void> {
    const album = this.topicoParaExcluir();
    if (!album || this.excluindoTopico()) {
      return;
    }
    this.excluindoTopico.set(true);
    try {
      await this.galeriaService.excluirAlbum(album.id);
      this.ordemRascunho.update((ids) => ids.filter((id) => id !== album.id));
      this.ordemSalva.update((ids) => ids.filter((id) => id !== album.id));
      this.modalAberto.set(null);
      this.topicoParaExcluir.set(null);
      this.toastService.mostrar('Tópico e fotos excluídos');
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível excluir o tópico. Tente de novo.'));
    } finally {
      this.excluindoTopico.set(false);
    }
  }

  /** Fluxo guiado: criou o tópico, já segue para escolher as fotos dele. */
  protected async criarTopico(novoAlbum: NovoAlbum): Promise<void> {
    this.criandoTopico.set(true);
    try {
      const album = await this.galeriaService.criarAlbum(novoAlbum);
      this.ordemRascunho.update((ids) => [...ids, album.id]);
      this.ordemSalva.update((ids) => [...ids, album.id]);
      this.abrirAdicionarFotos(album.id);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível criar o tópico. Tente de novo.'));
    } finally {
      this.criandoTopico.set(false);
    }
  }

  protected moverTopico(indice: number, deslocamento: -1 | 1): void {
    const destino = indice + deslocamento;
    const ordem = this.ordemRascunho();
    if (destino < 0 || destino >= ordem.length || this.salvandoOrdem()) {
      return;
    }
    const novaOrdem = [...ordem];
    const [albumId] = novaOrdem.splice(indice, 1);
    novaOrdem.splice(destino, 0, albumId);
    this.ordemRascunho.set(novaOrdem);
  }

  protected descartarOrdem(): void {
    if (!this.salvandoOrdem()) {
      this.ordemRascunho.set([...this.ordemSalva()]);
    }
  }

  protected async salvarOrdem(): Promise<void> {
    if (!this.temAlteracoesOrdem() || this.salvandoOrdem()) {
      return;
    }
    this.salvandoOrdem.set(true);
    try {
      await this.galeriaService.atualizarOrdem(this.ordemRascunho());
      const idsSalvos = this.albuns().map((album) => album.id);
      this.ordemSalva.set(idsSalvos);
      this.ordemRascunho.set(idsSalvos);
      this.toastService.mostrar('Ordem dos tópicos atualizada');
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível salvar a ordem. Tente de novo.'));
    } finally {
      this.salvandoOrdem.set(false);
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
