import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { BalaoConversaComponent } from '../../demonstracao/balao-conversa/balao-conversa.component';
import { DEMONSTRACOES, TIPOS_NEGOCIO, TipoNegocio, destaquesDe } from '../../demonstracao/conversas-demonstracao';
import { ItemConversa, ReprodutorConversa } from '../../demonstracao/reprodutor-conversa';

/** Quanto tempo o aviso no celular e a legenda ficam à vista, e a pausa antes da próxima conversa. */
const AVISO_MS = 3800;
const LEGENDA_MS = 3200;
const PAUSA_ENTRE_CONVERSAS_MS = 4500;

/**
 * Conversa ao vivo do hero: o visitante escolhe serviços ou produtos e o segmento, e assiste o assistente atendendo.
 * Ao terminar, segue para o próximo segmento do mesmo tipo. Pausa sozinha quando sai da tela.
 * A versão detalhada (checks e velocidade) fica em /demonstracao.
 */
@Component({
  selector: 'app-demonstracao-conversa',
  imports: [RouterLink, IconeComponent, BalaoConversaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './demonstracao-conversa.component.html',
  styleUrl: './demonstracao-conversa.component.css',
})
export class DemonstracaoConversaComponent {
  private readonly elemento = inject(ElementRef<HTMLElement>);
  private readonly rolagem = viewChild<ElementRef<HTMLElement>>('rolagem');

  protected readonly tipos = TIPOS_NEGOCIO;
  protected readonly demonstracoes = DEMONSTRACOES;

  protected readonly reprodutor = new ReprodutorConversa({
    aoMostrar: (item) => this.aoMostrar(item),
    aoTerminar: () => this.seguirParaOProximo(),
  });
  protected readonly segmento = this.reprodutor.segmento;

  /** Notificação que desce no topo do celular, como um push. */
  protected readonly aviso = signal<ItemConversa | null>(null);
  /** O que o assistente acabou de fazer, ao lado do celular. */
  protected readonly legenda = signal<string | null>(null);

  protected readonly etapas = computed(() => destaquesDe(this.segmento()));
  protected readonly conversa = computed(() => this.reprodutor.visiveis().filter((item) => item.de !== 'notificacao'));

  private temporizadores: ReturnType<typeof setTimeout>[] = [];
  private desligarObservador: () => void = () => undefined;

  constructor() {
    afterNextRender(() => {
      this.reprodutor.escolher('servicos');
      // fora da tela, a conversa espera o visitante voltar
      const observador = new IntersectionObserver(([entrada]) => this.reprodutor.pausar(!entrada.isIntersecting));
      observador.observe(this.elemento.nativeElement);
      this.desligarObservador = () => observador.disconnect();
    });

    inject(DestroyRef).onDestroy(() => {
      this.reprodutor.parar();
      this.limparTemporizadores();
      this.desligarObservador();
    });
  }

  protected escolher(tipo: TipoNegocio, segmento?: string): void {
    this.limparTemporizadores();
    this.aviso.set(null);
    this.legenda.set(null);
    this.reprodutor.escolher(tipo, segmento);
  }

  private aoMostrar(item: ItemConversa): void {
    if (item.de === 'notificacao') {
      this.aviso.set(item);
      this.depois(AVISO_MS, () => this.aviso.set(null));
    }
    if (item.destaque) {
      this.legenda.set(item.destaque);
      this.depois(LEGENDA_MS, () => this.legenda.set(null));
    }
    requestAnimationFrame(() => {
      const caixa = this.rolagem()?.nativeElement;
      caixa?.scrollTo({ top: caixa.scrollHeight, behavior: 'smooth' });
    });
  }

  private seguirParaOProximo(): void {
    const tipo = this.reprodutor.tipo();
    const segmentos = DEMONSTRACOES[tipo].segmentos;
    const proximo = segmentos[(segmentos.indexOf(this.segmento()) + 1) % segmentos.length];
    this.depois(PAUSA_ENTRE_CONVERSAS_MS, () => this.escolher(tipo, proximo.id));
  }

  private depois(ms: number, acao: () => void): void {
    this.temporizadores.push(setTimeout(acao, ms));
  }

  private limparTemporizadores(): void {
    this.temporizadores.forEach(clearTimeout);
    this.temporizadores = [];
  }
}
