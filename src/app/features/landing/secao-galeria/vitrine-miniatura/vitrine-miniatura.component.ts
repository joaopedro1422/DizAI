import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';

import { ehFonteManuscrita, fonteComFamilia } from '../../../../core/models/vitrine.model';
import { FeedbackPublico } from '../../../../core/models/loja-publica.model';
import { buscarCorMarca } from '../../../../core/constants/cores-marca';
import { fundoDoDestaque } from '../../../../core/constants/estilos-cor';
import { diaPorExtenso, hojeIso, somarDias } from '../../../../core/utils/datas-agenda';
import { FaixaDiasComponent, ItemFaixaDia } from '../../../../shared/components/faixa-dias/faixa-dias.component';
import { IconeComponent } from '../../../../shared/components/icone/icone.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import { desenharCapaDegrade } from '../../../galeria/seletor-cor-marca/capa-degrade';
import { CarrosselFeedbacksComponent } from '../../../vitrine-publica/carrossel-feedbacks/carrossel-feedbacks.component';
import { ExemploGaleria, FotoExemplo } from '../exemplos-galeria';

export type FaseVitrine = 'trabalhos' | 'topicos' | 'agenda' | 'agenda-fim';

/** A largura em que a página é desenhada (a de um celular). */
const LARGURA_PAGINA = 375;

/** Igual à página: 6 fotos por tópico e "Ver todas as N". */
const FOTOS_VISIVEIS = 6;

/** Mosaico: as fotos de exemplo são quadradas; estas proporções imitam fotos de alturas diferentes. */
const PROPORCOES_MOSAICO = ['4 / 5', '1', '3 / 4', '5 / 4', '4 / 5', '1'];

/** A "capa pronta" é desenhada uma vez por cor. */
const capasDesenhadas = new Map<string, string>();

@Component({
  selector: 'app-vitrine-miniatura',
  imports: [IconeComponent, LogoComponent, FaixaDiasComponent, CarrosselFeedbacksComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vitrine-miniatura.component.html',
  styleUrls: [
    './vitrine-miniatura.component.css',
    './vitrine-miniatura-topicos.css',
    './vitrine-miniatura-agenda.css',
  ],
  host: {
    '[class.escura]': 'escura()',
    '[style.--vitrine-destaque]': 'escura() ? "#ffffff" : corMarca().hex',
    '[style.--vitrine-destaque-fundo]': 'fundoDestaque()',
    '[style.--vitrine-fundo-selecionado]': 'escura() ? "#0f0e0d" : corMarca().fundo',
    '[style.--vitrine-selecao]': 'corSelecao()',
    '[style.--vitrine-fonte]': 'fonte()',
  },
})
export class VitrineMiniaturaComponent {
  readonly exemplo = input.required<ExemploGaleria>();
  readonly fase = input<FaseVitrine>('trabalhos');

  private readonly rolagem = viewChild<ElementRef<HTMLElement>>('rolagem');
  private readonly extras = viewChild<ElementRef<HTMLElement>>('extras');

  protected readonly corMarca = computed(() => buscarCorMarca(this.exemplo().corMarca));
  protected readonly escura = computed(() => this.exemplo().temaEscuro === true);
  /** Os preenchimentos (botões, etiqueta ativa) na cor da loja e no estilo escolhido, como na vitrine. */
  protected readonly fundoDestaque = computed(() => fundoDoDestaque(this.corMarca().hex, this.exemplo().estiloCor));
  /** Tema escuro: bordas do que está selecionado na cor da loja (preto e grafite viram um cinza claro), como na vitrine. */
  protected readonly corSelecao = computed(() => {
    const hex = this.corMarca().hex;
    if (!this.escura()) {
      return null;
    }
    return hex === '#151515' || hex === '#3F4652' ? '#8a837d' : hex;
  });
  /** No tema escuro a cor de fundo vale para a página toda. */
  protected readonly areaFundo = computed(() => (this.escura() ? 'PAGINA' : this.exemplo().areaCorFundoGaleria));
  /** Manuscritas ficam com o nome grande; as outras, um pouco menor. */
  protected readonly fonteManuscrita = computed(() => ehFonteManuscrita(this.exemplo().fonteGaleria));

  protected readonly fonte = computed(() => fonteComFamilia(this.exemplo().fonteGaleria));
  protected readonly inicial = computed(() => this.exemplo().nomeLoja.charAt(0).toUpperCase());

  protected readonly capa = computed(() => {
    const capa = this.exemplo().capa;
    if (capa !== 'degrade') {
      return capa ?? null;
    }
    const hex = this.corMarca().hex;
    if (!capasDesenhadas.has(hex)) {
      capasDesenhadas.set(hex, desenharCapaDegrade(hex));
    }
    return capasDesenhadas.get(hex) ?? null;
  });

  protected readonly mostrandoAgenda = computed(
    () => !!this.exemplo().agenda && (this.fase() === 'agenda' || this.fase() === 'agenda-fim'),
  );
  protected readonly agendaPreenchida = computed(() => this.mostrandoAgenda() && this.fase() === 'agenda-fim');

  /** O menu: os tópicos de fotos e, depois, Feedbacks e Como chegar (na ordem da página). */
  protected readonly menu = computed(() => {
    const { categorias, feedbacks, endereco } = this.exemplo();
    return [...categorias, ...(feedbacks?.length ? ['Feedbacks'] : []), ...(endereco ? ['Como chegar'] : [])];
  });

  /** Os dois primeiros tópicos viram álbuns, como na página (sem os extras, o segundo aparece cortado embaixo). */
  protected readonly albuns = computed(() => {
    const { categorias, fotos, quantidadeFotos } = this.exemplo();
    return [
      { nome: categorias[0], fotos: fotos.slice(0, FOTOS_VISIVEIS), quantidade: quantidadeFotos },
      { nome: categorias[1], fotos: [...fotos.slice(FOTOS_VISIVEIS), ...fotos.slice(0, 3)], quantidade: 9 },
    ].filter((album) => !!album.nome);
  });

  /** Os feedbacks no formato do carrossel da vitrine. */
  protected readonly feedbacks = computed<FeedbackPublico[]>(() =>
    (this.exemplo().feedbacks ?? []).map((feedback, indice) => ({ id: indice + 1, ...feedback })),
  );
  protected readonly resumoFeedbacks = computed(() => {
    const feedbacks = this.feedbacks();
    const media = feedbacks.reduce((soma, f) => soma + f.estrelas, 0) / Math.max(1, feedbacks.length);
    const nota = media.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return `★ ${nota} · ${feedbacks.length} ${feedbacks.length === 1 ? 'avaliação' : 'avaliações'}`;
  });

  /** Os próximos dias, como a agenda pública mostra: domingo fechado, um dia lotado. */
  protected readonly dias = computed<ItemFaixaDia[]>(() =>
    Array.from({ length: 7 }, (_, indice) => {
      const data = somarDias(hojeIso(), indice + 1);
      const domingo = new Date(`${data}T12:00:00`).getDay() === 0;
      const lotado = indice === 1;
      return {
        data,
        desativado: domingo || lotado,
        detalhe: domingo ? 'Fechado' : lotado ? 'Lotado' : '',
      };
    }),
  );
  /** O primeiro dia livre. */
  protected readonly diaEscolhido = computed(() => this.dias().find((dia) => !dia.desativado)?.data ?? '');
  protected readonly quando = computed(() => {
    const agenda = this.exemplo().agenda;
    if (!agenda) {
      return '';
    }
    const dia = diaPorExtenso(this.diaEscolhido());
    return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} às ${agenda.horaEscolhida}`;
  });

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    // a página tem 375 px: reduz para a largura da tela do aparelho
    afterNextRender(() => {
      const observador = new ResizeObserver(() => host.style.setProperty('--escala', String(host.clientWidth / LARGURA_PAGINA)));
      observador.observe(host);
      this.desligar = () => observador.disconnect();
    });
    inject(DestroyRef).onDestroy(() => this.desligar());

    // "rola" a página: até os feedbacks/Como chegar, até o fim da agenda preenchida ou de volta ao topo
    effect(() => {
      const fase = this.fase();
      this.exemplo();
      // depois de desenhar o que a fase mostra
      setTimeout(() => {
        const caixa = this.rolagem()?.nativeElement;
        if (!caixa) {
          return;
        }
        const extras = this.extras()?.nativeElement;
        if (fase === 'topicos' && extras) {
          caixa.scrollTo({ top: extras.offsetTop - 24, behavior: 'smooth' });
        } else if (fase === 'agenda-fim') {
          caixa.scrollTo({ top: caixa.scrollHeight, behavior: 'smooth' });
        } else {
          caixa.scrollTo({ top: 0, behavior: 'instant' });
        }
      }, 60);
    });
  }

  private desligar: () => void = () => undefined;

  protected fundoDaFoto(foto: FotoExemplo): string {
    return `radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.55), transparent 45%), linear-gradient(150deg, ${foto.claro}, ${foto.escuro})`;
  }

  /** No mosaico cada foto tem uma altura; nos outros layouts quem manda é o CSS. */
  protected proporcao(ordem: number): string | null {
    return this.exemplo().layoutFotos === 'MOSAICO' ? PROPORCOES_MOSAICO[ordem % PROPORCOES_MOSAICO.length] : null;
  }
}
