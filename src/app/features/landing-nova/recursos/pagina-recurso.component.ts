import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  contentChild,
  inject,
  input,
  signal,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { NomeIcone } from '../../../shared/components/icone/icones';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { RevelarAoRolarDirective } from '../../landing/revelar-ao-rolar.directive';
import { semMovimento } from '../movimento';
import { ConteudoRecurso } from './conteudo-recurso';

/** O tempo de cada cena do mock do topo quando a cena não diz o dela. */
const CENA_MS = 7000;

/**
 * A estrutura comum das páginas de recurso (/vendas/vitrine, /agendamentos/posts...): topo com a dor e, ao lado, o
 * mock que passa sozinho pelas cenas (mouse em cima pausa, os pontinhos escolhem), o "por que", o que tem, as
 * perguntas e a chamada. Cada página entrega o conteúdo e o desenho das cenas num `<ng-template #cena let-cena>`; o
 * destaque opcional da seção "o que tem" entra com o atributo `destaque`. Marca nova: `.marca` + o CSS desta pasta
 * preso a `.rv` (ViewEncapsulation.None, como as landings).
 */
@Component({
  selector: 'app-pagina-recurso',
  imports: [NgTemplateOutlet, RouterLink, LogoComponent, IconeComponent, RevelarAoRolarDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './pagina-recurso.component.html',
  styleUrls: [
    '../marca-base.css',
    '../landing/landing-topo.css',
    '../landing/landing-vitrine.css',
    '../landing/landing-agenda.css',
    '../landing/landing-fim.css',
    './recurso-base.css',
    './recurso-palco.css',
  ],
  host: { class: 'marca lv rv' },
})
export class PaginaRecursoComponent {
  readonly conteudo = input.required<ConteudoRecurso>();
  protected readonly modelo = contentChild.required<TemplateRef<{ $implicit: string }>>('cena');

  protected readonly icone = (nome: string) => nome as NomeIcone;
  protected readonly indiceCena = signal(0);
  protected readonly cena = computed(() => this.conteudo().cenas[this.indiceCena()] ?? this.conteudo().cenas[0]);
  protected pausado = false;
  /** Quanto tempo a cena atual já rodou (a pausa segura, a escolha zera). */
  private decorrido = 0;

  constructor() {
    const titulo = inject(Title);
    const meta = inject(Meta);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      titulo.setTitle(this.conteudo().tituloPagina);
      meta.updateTag({ name: 'description', content: this.conteudo().hero.apoio });
      if (semMovimento()) return;
      const relogio = setInterval(() => {
        if (this.pausado || document.hidden) return;
        this.decorrido += 250;
        if (this.decorrido < (this.cena().ms ?? CENA_MS)) return;
        this.decorrido = 0;
        this.indiceCena.update((i) => (i + 1) % this.conteudo().cenas.length);
      }, 250);
      destroyRef.onDestroy(() => clearInterval(relogio));
    });
  }

  protected escolherCena(indice: number): void {
    this.indiceCena.set(indice);
    this.decorrido = 0;
  }

  protected irPara(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
