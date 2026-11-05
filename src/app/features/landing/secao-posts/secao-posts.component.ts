import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { NomeIcone } from '../../../shared/components/icone/icones';
import { ArtePostComponent } from '../../posts/arte-post/arte-post.component';
import { exemplosPostsDe } from './exemplos-posts';
import type { TipoNegocio } from '../../demonstracao/conversas-demonstracao';

function larguraDoLeque(): number {
  return window.innerWidth <= 760 ? 190 : 260;
}

/** Quanto tempo cada arte fica na frente do leque. */
const TEMPO_NA_FRENTE_MS = 3200;

const DIFERENCIAIS: { icone: NomeIcone; titulo: string; texto: string }[] = [
  {
    icone: 'brilho',
    titulo: 'A cara da sua loja',
    texto: 'Sua logo, suas cores, a fonte da sua vitrine e as suas fotos, em dezenas de composições que mudam a cada post.',
  },
  {
    icone: 'check',
    titulo: 'Com o que é de verdade',
    texto: 'Preços do seu cadastro, feedbacks dos seus clientes e os horários livres da sua agenda, sem digitar nada.',
  },
  {
    icone: 'conversa',
    titulo: 'Pronto para postar',
    texto: 'Feed, quadrado ou story, com a legenda escrita e o link da sua vitrine para o cliente chamar no WhatsApp.',
  },
];

/**
 * "Redes sociais" da landing, logo abaixo da Vitrine pública: por que manter o Instagram ativo e o gerador de posts
 * em ação. À direita, um leque com artes de negócios diferentes feitas pelo próprio ArtePostComponent (o mesmo do
 * painel): a da frente fica no centro e as outras se abrem dos dois lados; uma por vez vem para a frente (o mouse em
 * cima pausa, o toque traz qualquer uma; parado para quem pediu menos movimento).
 */
@Component({
  selector: 'app-secao-posts',
  imports: [RouterLink, IconeComponent, ArtePostComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secao-posts.component.html',
  styleUrl: './secao-posts.component.css',
})
export class SecaoPostsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  /** Landing de um tipo: as artes daquele público; sem tipo (hub), negócios dos dois. */
  readonly tipo = input<TipoNegocio | null>(null);
  protected readonly exemplos = computed(() => exemplosPostsDe(this.tipo()));
  /** O 2º diferencial fala do que cada público divulga (vendas: preços e novidades; agenda: horários livres). */
  protected readonly diferenciais = computed(() =>
    DIFERENCIAIS.map((diferencial, i) =>
      i !== 1 || !this.tipo()
        ? diferencial
        : {
            ...diferencial,
            texto:
              this.tipo() === 'produtos'
                ? 'Preços e produtos do seu cadastro, feedbacks dos seus clientes e as suas promoções, sem digitar nada.'
                : 'Preços do seu cadastro, feedbacks dos seus clientes e os horários livres da sua agenda, sem digitar nada.',
          },
    ),
  );
  /** A arte que está na frente do leque. */
  protected readonly naFrente = signal(2);
  protected readonly pausado = signal(false);
  /** Lugar de cada arte no leque em relação à da frente (0 = centro, -2 e 2 = as pontas). */
  protected readonly posicoes = computed(() => {
    const total = this.exemplos().length;
    return this.exemplos().map((_, i) => {
      const distancia = (i - this.naFrente() + total) % total;
      return distancia > total / 2 ? distancia - total : distancia;
    });
  });
  /** As artes do leque: menores no celular (a arte por dentro continua com 1080 px). */
  protected readonly larguraArte = signal(larguraDoLeque());

  ngOnInit(): void {
    const aoRedimensionar = () => this.larguraArte.set(larguraDoLeque());
    window.addEventListener('resize', aoRedimensionar, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('resize', aoRedimensionar));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const temporizador = setInterval(() => {
      if (!this.pausado() && !document.hidden) {
        this.naFrente.update((indice) => (indice + 1) % this.exemplos().length);
      }
    }, TEMPO_NA_FRENTE_MS);
    this.destroyRef.onDestroy(() => clearInterval(temporizador));
  }

  protected trazerParaFrente(indice: number): void {
    this.naFrente.set(indice);
  }
}
