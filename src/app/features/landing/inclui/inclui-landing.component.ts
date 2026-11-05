import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import type { TipoLanding } from '../conteudo-landing';

/** O que muda de um público para o outro no mosaico. */
interface TextosInclui {
  resposta: string;
  catalogo: string;
  vitrine: {
    loja: string;
    descricao: string;
    logo: string;
    capa: string;
    /** A cor da etiqueta ativa do menu (a cor de destaque da loja). */
    destaque: string;
    menu: string[];
    fotos: string[];
  };
  posts: { foto: string; titulo: string }[];
}

const TEXTOS: Record<TipoLanding, TextosInclui> = {
  produtos: {
    resposta: 'Abrimos sim, das 9h às 19h. Quer que eu já anote o seu pedido?',
    catalogo: 'Cardápio de novembro.pdf',
    vitrine: {
      loja: 'Pedacinho do Céu',
      descricao: 'Doces e tortas personalizadas',
      logo: '/landing/galeria/logos/pedacinho-do-ceu.jpg',
      capa: "url('/landing/hub/pedacinho-capa.webp') center / cover",
      destaque: '#8A6200',
      menu: ['Frutas Vermelhas', 'Chocolate com beijinho', 'Red Velvet'],
      fotos: ['/landing/galeria/bolos/01.webp', '/landing/galeria/bolos/04.webp', '/landing/galeria/bolos/06.webp'],
    },
    posts: [
      { foto: '/landing/galeria/bolos/03.webp', titulo: 'Encomendas abertas' },
      { foto: '/landing/galeria/bolos/08.webp', titulo: 'Novidade' },
    ],
  },
  servicos: {
    resposta: 'Abrimos sim, das 9h às 19h. Posso olhar um horário para você.',
    catalogo: 'Tabela de serviços.pdf',
    vitrine: {
      loja: 'Bella Studio',
      descricao: 'Unhas em gel e nail art',
      logo: '/landing/galeria/logos/bella-studio.svg',
      capa: 'linear-gradient(120deg, #6E1F3B, #A3405F)',
      destaque: '#8E2A4C',
      menu: ['Gel', 'Nail art', 'Pé e mão'],
      fotos: ['/landing/galeria/unhas/02.webp', '/landing/galeria/unhas/03.webp', '/landing/galeria/unhas/04.webp'],
    },
    posts: [
      { foto: '/landing/galeria/unhas/05.webp', titulo: 'Agenda aberta' },
      { foto: '/landing/galeria/unhas/06.webp', titulo: 'Novidade' },
    ],
  },
};

const ONDAS = [28, 52, 78, 44, 92, 60, 34, 70, 48, 86, 40, 64, 30, 54, 74, 38, 24, 46, 66, 36];

/** "Tudo incluso": o que vem junto, num mosaico de cartões de vidro com a peça de cada recurso (como no hub). */
@Component({
  selector: 'app-inclui-landing',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inclui-landing.component.html',
  styleUrl: './inclui-landing.component.css',
})
export class IncluiLandingComponent {
  readonly tipo = input.required<TipoLanding>();
  protected readonly textos = computed(() => TEXTOS[this.tipo()]);
  protected readonly ondas = ONDAS;
}
