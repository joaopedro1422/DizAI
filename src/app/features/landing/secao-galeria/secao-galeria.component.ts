import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';

import type { TipoNegocio } from '../../demonstracao/conversas-demonstracao';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { EXEMPLOS_GALERIA, ExemploGaleria } from './exemplos-galeria';
import { FaseVitrine, VitrineMiniaturaComponent } from './vitrine-miniatura/vitrine-miniatura.component';

/**
 * Os momentos de cada loja e quanto tempo cada um fica na tela: o topo com as fotos; a página rolada até os feedbacks
 * e o "Como chegar" (quando a loja tem); e, nas lojas com agenda, a aba "Agendar horário" e o fim dela preenchido.
 */
function momentos(exemplo: ExemploGaleria): { fase: FaseVitrine; ms: number }[] {
  const temExtras = !!exemplo.feedbacks?.length || !!exemplo.endereco;
  const lista: { fase: FaseVitrine; ms: number }[] = temExtras
    ? [{ fase: 'trabalhos', ms: 3800 }, { fase: 'topicos', ms: 5200 }]
    : [{ fase: 'trabalhos', ms: exemplo.agenda ? 4500 : 7000 }];
  if (exemplo.agenda) {
    lista.push({ fase: 'agenda', ms: 3200 }, { fase: 'agenda-fim', ms: 4300 });
  }
  return lista;
}

/** Os textos da seção por público (o hub, sem tipo, usa o geral). */
const TEXTOS: Record<TipoNegocio | 'geral', { titulo: string; descricao: string; beneficios: string[]; lojas: string[] | null }> = {
  geral: {
    titulo: 'Seus trabalhos vendem por você.',
    descricao: 'Uma página da sua loja, com a sua logo e as fotos do que você já fez, pronta para enviar aos clientes.',
    beneficios: [
      'Fotos separadas em tópicos, feedbacks dos clientes e o mapa de como chegar',
      'Personalize do seu jeito, com a sua cor e a sua logo',
      'Link para colocar na bio do Instagram',
      'Para serviços: agenda e horários livres na própria página, para o cliente agendar',
    ],
    lojas: null,
  },
  produtos: {
    titulo: 'Seus produtos vendem por você.',
    descricao: 'Uma página da sua loja, com a sua logo e as fotos dos seus produtos, pronta para mostrar antes do cliente perguntar.',
    beneficios: [
      'Fotos separadas por categoria, feedbacks dos clientes e o mapa de como chegar',
      'Personalize do seu jeito, com a sua cor e a sua logo',
      'Link para colocar na bio do Instagram',
      'Grátis, mesmo sem ligar o assistente',
    ],
    lojas: ['bolos', 'moveis', 'cortinas'],
  },
  servicos: {
    titulo: 'Seus trabalhos lotam a sua agenda.',
    descricao: 'Uma página com a sua logo, as fotos do que você já fez e a sua agenda online, para o cliente escolher o horário.',
    beneficios: [
      'Portfólio por tópicos, feedbacks dos clientes e o mapa de como chegar',
      'Agenda online com os horários livres, para o cliente agendar',
      'Personalize do seu jeito, com a sua cor e a sua logo',
      'Link para colocar na bio do Instagram',
    ],
    lojas: ['unhas', 'eletricista'],
  },
};

/**
 * "Vitrine pública" da landing: o texto com os checks à esquerda e, à direita, a página da loja (/l/{slug}) dentro
 * de um celular, com a conversa em que o assistente envia o link. Troca sozinha entre lojas de exemplo (ou pelas setas
 * embaixo); pausa com o mouse ou o foco em cima e fica parada para quem pediu menos movimento no sistema.
 */
@Component({
  selector: 'app-secao-galeria',
  imports: [RouterLink, IconeComponent, VitrineMiniaturaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secao-galeria.component.html',
  styleUrl: './secao-galeria.component.css',
})
export class SecaoGaleriaComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  /** Landing de um tipo: só as lojas e os textos daquele público. */
  readonly tipo = input<TipoNegocio | null>(null);
  protected readonly textos = computed(() => TEXTOS[this.tipo() ?? 'geral']);
  private readonly exemplos = computed(() => {
    const lojas = this.textos().lojas;
    return lojas ? EXEMPLOS_GALERIA.filter((exemplo) => lojas.includes(exemplo.id)) : EXEMPLOS_GALERIA;
  });
  protected readonly indiceAtual = signal(0);
  protected readonly fase = signal<FaseVitrine>('trabalhos');
  protected readonly pausado = signal(false);

  protected readonly exemploAtual = computed(() => this.exemplos()[this.indiceAtual() % this.exemplos().length]);

  private temporizador: ReturnType<typeof setTimeout> | undefined;
  private etapa = 0;

  ngOnInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    this.agendar();
    this.destroyRef.onDestroy(() => clearTimeout(this.temporizador));
  }

  /** Espera o momento atual acabar e passa para o próximo (a próxima fase ou a próxima loja). */
  private agendar(): void {
    const espera = momentos(this.exemploAtual())[this.etapa].ms;
    this.temporizador = setTimeout(() => {
      if (!this.pausado() && !document.hidden) {
        this.avancar();
      }
      this.agendar();
    }, espera);
  }

  /** Setas embaixo do celular: a loja de exemplo anterior ou a próxima (dá a volta nas pontas). */
  protected anterior(): void {
    this.escolher((this.indiceAtual() - 1 + this.exemplos().length) % this.exemplos().length);
  }

  protected proximo(): void {
    this.escolher((this.indiceAtual() + 1) % this.exemplos().length);
  }

  /** Mostra aquela loja do começo e recomeça a contagem. */
  private escolher(indice: number): void {
    clearTimeout(this.temporizador);
    this.etapa = 0;
    this.fase.set('trabalhos');
    this.indiceAtual.set(indice);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.agendar();
    }
  }

  private avancar(): void {
    if (this.etapa < momentos(this.exemploAtual()).length - 1) {
      this.etapa += 1;
    } else {
      this.etapa = 0;
      this.indiceAtual.update((indice) => (indice + 1) % this.exemplos().length);
    }
    this.fase.set(momentos(this.exemploAtual())[this.etapa].fase);
  }
}
