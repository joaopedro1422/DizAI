import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';

import { buscarCorMarca } from '../../../core/constants/cores-marca';
import { fundoDoDestaque } from '../../../core/constants/estilos-cor';
import { ehFonteManuscrita, fonteComFamilia } from '../../../core/models/vitrine.model';
import { GaleriaService } from '../../../core/services/galeria.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { PostsService } from '../../../core/services/posts.service';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { ArtePostComponent } from '../../posts/arte-post/arte-post.component';
import { gerarPng, nomeDaFamilia } from '../../posts/motor/exportar-post';
import { dnaDaLoja, gerarEstilos } from '../../posts/motor/motor-post';
import { SELOS } from '../../posts/motor/textos-post';
import { ConteudoPost, DIMENSOES, DiaLivre, EstiloPost, MarcaPost, TipoPost } from '../../posts/motor/tipos-post';

/**
 * A arte que vai no topo da mensagem da campanha: o mesmo motor dos posts (layouts, paletas e o DNA visual da loja),
 * no formato quadrado, com o texto da campanha. "Trocar arte" pede outra semente a quem usa; ao enviar, a campanha
 * pede o PNG (`gerarArquivo`).
 */
@Component({
  selector: 'app-arte-campanha',
  imports: [ArtePostComponent, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (estilo(); as estiloAtual) {
      <div class="arte-campanha">
        <app-arte-post #arte [marca]="marca()" [conteudo]="conteudo()" [estilo]="estiloAtual" formato="quadrado" [largura]="largura()" />
        @if (trocavel()) {
          <button type="button" class="btn btn--secundario btn--pequeno arte-campanha__trocar" (click)="trocar.emit()">
            <app-icone nome="retorno" [tamanho]="16" [espessura]="2" /> Trocar arte
          </button>
        }
      </div>
    } @else {
      <div class="arte-campanha__carregando" [style.width.px]="largura()" [style.height.px]="largura()"></div>
    }
  `,
  styles: `
    .arte-campanha { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .arte-campanha__trocar { gap: 6px; }
    .arte-campanha__carregando { border-radius: 12px; background: var(--cor-fundo-tracejado); }
  `,
})
export class ArteCampanhaComponent implements OnInit {
  private readonly perfil = inject(PerfilService).perfil;
  private readonly postsService = inject(PostsService);
  private readonly galeria = inject(GaleriaService);

  readonly tipoPost = input.required<TipoPost>();
  readonly titulo = input.required<string>();
  readonly apoio = input('');
  readonly chamada = input('Responda no WhatsApp');
  readonly horarios = input<DiaLivre[]>([]);
  /** A foto principal (a do produto/serviço escolhido); sem ela, as da galeria. */
  readonly fotoRef = input<string | null>(null);
  readonly largura = input(240);
  /** A combinação sorteada: quem usa guarda o número, para a arte da revisão ser a mesma do passo 1. */
  readonly semente = input.required<number>();
  readonly trocavel = input(true);
  readonly trocar = output<void>();

  private readonly arte = viewChild<ArtePostComponent>('arte');
  /** Logo e fotos carregadas (a revisão espera por isso para mostrar a mensagem já com a arte). */
  readonly pronta = signal(false);
  private readonly logo = signal<string | null>(null);
  private readonly fotos = signal<string[]>([]);

  protected readonly marca = computed<MarcaPost>(() => {
    const perfil = this.perfil();
    const cor = buscarCorMarca(perfil.corMarca).hex;
    const fonte = perfil.fonteGaleria ?? 'Poppins';
    return {
      nome: perfil.nomeLoja,
      logo: this.logo(),
      cor,
      preenchimento: fundoDoDestaque(cor, perfil.estiloCor),
      corLogo: null,
      preenchimentoLogo: null,
      fonteTitulo: fonteComFamilia(fonte),
      fonteManuscrita: ehFonteManuscrita(fonte),
      link: `dizai.com/l/${perfil.slug}`,
    };
  });

  /** A agenda com muitos horários fica sem foto, para caber. */
  private readonly fotosDaArte = computed(() => (this.tipoPost() === 'AGENDA' ? [] : this.fotos()));

  protected readonly estilo = computed<EstiloPost | null>(() => {
    const pedido = {
      fotosDisponiveis: this.fotosDaArte().length,
      temPreco: false,
      dna: dnaDaLoja(this.perfil().id),
      historico: [],
      quantidade: 1,
      semente: this.semente(),
      origens: ['vitrine' as const],
    };
    // nem todo layout serve para todo tipo: sem combinação, vai a de convite (serve para tudo)
    return gerarEstilos({ ...pedido, tipo: this.tipoPost() })[0] ?? gerarEstilos({ ...pedido, tipo: 'CONVITE' })[0] ?? null;
  });

  protected readonly conteudo = computed<ConteudoPost>(() => {
    const tipo = this.tipoPost();
    return {
      tipo,
      selo: SELOS[tipo][0],
      titulo: this.titulo(),
      apoio: this.apoio(),
      chamada: this.chamada(),
      preco: null,
      fotos: this.fotosDaArte(),
      itens: [],
      horarios: this.horarios(),
      depoimento: null,
    };
  });

  constructor() {
    // a foto escolhida mudou: carrega de novo (as da galeria completam)
    effect(() => {
      const principal = this.fotoRef();
      void this.carregarFotos(principal);
    });
  }

  ngOnInit(): void {
    const logo = this.postsService.imagem(this.perfil().fotoPerfilUrl).then((l) => this.logo.set(l));
    const fotos = this.galeria.albuns().length === 0
      ? this.galeria.carregar().then(() => this.carregarFotos(this.fotoRef()))
      : this.carregarFotos(this.fotoRef());
    // nunca prende a tela: no máximo 5 s esperando as imagens
    const limite = new Promise((resolver) => setTimeout(resolver, 5000));
    void Promise.race([Promise.all([logo, fotos]).catch(() => undefined), limite]).then(() => this.pronta.set(true));
  }

  /** O PNG da arte (quadrado, 1080 px) para subir com a campanha; null se não deu para gerar. */
  async gerarArquivo(): Promise<File | null> {
    const arte = this.arte();
    const estilo = this.estilo();
    if (!arte || !estilo) return null;
    const { largura, altura } = DIMENSOES.quadrado;
    try {
      const blob = await gerarPng(arte.elemento(), largura, altura, [nomeDaFamilia(this.marca().fonteTitulo), estilo.fonteApoio]);
      return new File([blob], 'campanha.png', { type: 'image/png' });
    } catch {
      return null;
    }
  }

  private async carregarFotos(principal: string | null): Promise<void> {
    const daGaleria = this.galeria
      .albuns()
      .filter((album) => album.tipo !== 'FEEDBACKS' && album.tipo !== 'LOCALIZACAO')
      .flatMap((album) => album.fotos.map((foto) => foto.url));
    const refs = [...new Set([...(principal ? [principal] : []), ...daGaleria])].slice(0, 3);
    const fotos = await Promise.all(refs.map((ref) => this.postsService.imagem(ref)));
    this.fotos.set(fotos.filter((f): f is string => !!f));
  }
}
