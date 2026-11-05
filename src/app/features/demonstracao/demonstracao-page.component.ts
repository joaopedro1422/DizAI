import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { IconeComponent } from '../../shared/components/icone/icone.component';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { BalaoConversaComponent } from './balao-conversa/balao-conversa.component';
import { MolduraTelaDemoComponent } from './telas-demo/moldura-tela-demo.component';
import { TelaAgendaDemoComponent } from './telas-demo/tela-agenda-demo.component';
import { TelaPedidosDemoComponent } from './telas-demo/tela-pedidos-demo.component';
import { DEMONSTRACOES, TIPOS_NEGOCIO, TipoNegocio, destaquesDe } from './conversas-demonstracao';
import { ReprodutorConversa } from './reprodutor-conversa';

@Component({
  selector: 'app-demonstracao-page',
  imports: [
    RouterLink,
    IconeComponent,
    LogoComponent,
    BalaoConversaComponent,
    MolduraTelaDemoComponent,
    TelaPedidosDemoComponent,
    TelaAgendaDemoComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './demonstracao-page.component.html',
  styleUrl: './demonstracao-page.component.css',
})
export class DemonstracaoPageComponent {
  private readonly router = inject(Router);
  private readonly rolagem = viewChild<ElementRef<HTMLElement>>('rolagem');

  protected readonly tipos = TIPOS_NEGOCIO;
  protected readonly demonstracoes = DEMONSTRACOES;

  protected readonly reprodutor = new ReprodutorConversa({ aoMostrar: () => this.rolarParaOFim() });
  protected readonly segmento = this.reprodutor.segmento;
  protected readonly destaques = computed(() => destaquesDe(this.segmento()));

  constructor() {
    const parametros = inject(ActivatedRoute).snapshot.queryParamMap;
    const tipo: TipoNegocio = parametros.get('tipo') === 'produtos' ? 'produtos' : 'servicos';
    this.reprodutor.escolher(tipo, parametros.get('segmento'));
    inject(DestroyRef).onDestroy(() => this.reprodutor.parar());
  }

  protected escolher(tipo: TipoNegocio, segmento?: string): void {
    this.reprodutor.escolher(tipo, segmento);
    this.router.navigate([], { queryParams: { tipo, segmento: this.segmento().id }, replaceUrl: true });
  }

  /** Pausar / continuar; no fim, assistir de novo. */
  protected alternarPausa(): void {
    if (this.reprodutor.terminou()) {
      this.reprodutor.recomecar();
    } else {
      this.reprodutor.pausar(!this.reprodutor.pausado());
    }
  }

  /** Ao terminar, oferece a próxima conversa do mesmo tipo. */
  protected readonly proximoSegmento = computed(() => {
    const segmentos = DEMONSTRACOES[this.reprodutor.tipo()].segmentos;
    return segmentos[(segmentos.indexOf(this.segmento()) + 1) % segmentos.length];
  });

  private rolarParaOFim(): void {
    requestAnimationFrame(() => {
      const caixa = this.rolagem()?.nativeElement;
      caixa?.scrollTo({ top: caixa.scrollHeight, behavior: 'smooth' });
    });
  }
}
