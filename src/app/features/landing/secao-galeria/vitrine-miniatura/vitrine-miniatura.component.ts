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

import { buscarCorMarca } from '../../../../core/constants/cores-marca';
import { diaPorExtenso, hojeIso, somarDias } from '../../../../core/utils/datas-agenda';
import { FaixaDiasComponent, ItemFaixaDia } from '../../../../shared/components/faixa-dias/faixa-dias.component';
import { IconeComponent } from '../../../../shared/components/icone/icone.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import { desenharCapaDegrade } from '../../../galeria/seletor-cor-marca/capa-degrade';
import { ExemploGaleria, FotoExemplo } from '../exemplos-galeria';

/** O que a miniatura mostra: a galeria, a aba "Agendar horário" escolhida, ou a mesma aba rolada até o fim. */
export type FaseVitrine = 'trabalhos' | 'agenda' | 'agenda-fim';

/** A largura em que a página é desenhada (a de um celular). */
const LARGURA_PAGINA = 375;

/** Igual à página: 6 fotos por tópico e "Ver todas as N". */
const FOTOS_VISIVEIS = 6;

/** A "capa pronta" é desenhada uma vez por cor. */
const capasDesenhadas = new Map<string, string>();

/**
 * A página pública da loja (/l/{slug}) em miniatura, para a landing. Desenhada no tamanho de um celular de verdade
 * (375 px, com as mesmas medidas e classes da vitrine) e reduzida para caber no aparelho.
 * A faixa de dias da aba "Agendar horário" é o mesmo componente da agenda pública.
 */
@Component({
  selector: 'app-vitrine-miniatura',
  imports: [IconeComponent, LogoComponent, FaixaDiasComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vitrine-miniatura.component.html',
  styleUrl: './vitrine-miniatura.component.css',
  host: {
    '[style.--vitrine-destaque]': 'corMarca().hex',
    '[style.--vitrine-fundo-selecionado]': 'corMarca().fundo',
    '[style.--vitrine-fonte]': 'fonte()',
  },
})
export class VitrineMiniaturaComponent {
  readonly exemplo = input.required<ExemploGaleria>();
  readonly fase = input<FaseVitrine>('trabalhos');

  private readonly rolagem = viewChild<ElementRef<HTMLElement>>('rolagem');

  protected readonly corMarca = computed(() => buscarCorMarca(this.exemplo().corMarca));
  /** Manuscritas (Dancing Script, Pacifico, Caveat) ficam com o nome grande; as outras, um pouco menor. */
  protected readonly fonteManuscrita = computed(() =>
    (['Dancing Script', 'Pacifico', 'Caveat'] as string[]).includes(this.exemplo().fonteGaleria),
  );

  protected readonly fonte = computed(() => {
    const fonte = this.exemplo().fonteGaleria;
    const serifadas = ['Playfair Display', 'Cormorant Garamond', 'Lora'];
    const manuscritas = ['Dancing Script', 'Pacifico', 'Caveat'];
    const familia = serifadas.includes(fonte) ? 'serif' : manuscritas.includes(fonte) ? 'cursive' : 'sans-serif';
    return `'${fonte}', ${familia}`;
  });
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

  protected readonly mostrandoAgenda = computed(() => !!this.exemplo().agenda && this.fase() !== 'trabalhos');
  protected readonly rolada = computed(() => this.mostrandoAgenda() && this.fase() === 'agenda-fim');

  /** Os dois primeiros tópicos viram álbuns, como na página (o segundo aparece cortado embaixo). */
  protected readonly albuns = computed(() => {
    const { categorias, fotos, quantidadeFotos } = this.exemplo();
    return [
      { nome: categorias[0], fotos: fotos.slice(0, FOTOS_VISIVEIS), quantidade: quantidadeFotos },
      { nome: categorias[1], fotos: [...fotos.slice(FOTOS_VISIVEIS), ...fotos.slice(0, 3)], quantidade: 9 },
    ];
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
    return agenda ? `${diaPorExtenso(this.diaEscolhido())} às ${agenda.horaEscolhida}` : '';
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

    // "rola" a página até o fim para mostrar o nome, o resumo e o envio; volta ao topo nas outras fases
    effect(() => {
      const rolada = this.rolada();
      this.exemplo();
      // depois de desenhar o nome e o resumo
      setTimeout(() => {
        const caixa = this.rolagem()?.nativeElement;
        caixa?.scrollTo({ top: rolada ? caixa.scrollHeight : 0, behavior: rolada ? 'smooth' : 'instant' });
      }, 60);
    });
  }

  private desligar: () => void = () => undefined;

  protected fundoDaFoto(foto: FotoExemplo): string {
    return `radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.55), transparent 45%), linear-gradient(150deg, ${foto.claro}, ${foto.escuro})`;
  }
}
