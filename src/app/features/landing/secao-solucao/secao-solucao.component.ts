import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';

import { ArtePostComponent } from '../../posts/arte-post/arte-post.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { EXEMPLOS_POSTS } from '../secao-posts/exemplos-posts';
import { NomeIcone } from '../../../shared/components/icone/icones';

/** A miniatura no pé do card (o pedacinho da tela de verdade que prova o ganho). */
type DetalheGanho =
  | 'resposta'
  | 'conversa'
  | 'catalogo'
  | 'audio'
  | 'jeito'
  | 'assumir'
  | 'relatorios';

interface Ganho {
  icone: NomeIcone;
  titulo: string;
  texto: string;
  detalhe: DetalheGanho;
  /** Ocupa duas colunas no computador. */
  largo?: boolean;
}

/** O que é do DizAI para qualquer negócio (o que é só de produtos ou de serviços fica na seção Recursos). */
const GANHOS: Ganho[] = [
  {
    icone: 'raio',
    titulo: 'Resposta em segundos, 24 horas',
    texto: 'De madrugada, no domingo ou com as mãos ocupadas. Você liga e desliga quando quiser.',
    detalhe: 'resposta',
  },
  {
    icone: 'conversa',
    titulo: 'Responde tudo sobre o seu negócio',
    texto: 'Preços, opções, formas de pagamento e tudo o que você cadastrar. Se não souber, te chama.',
    detalhe: 'conversa',
  },
  {
    icone: 'documento',
    titulo: 'Catálogo em imagem ou PDF',
    texto: 'Envia o cardápio ou a tabela de preços direto na conversa.',
    detalhe: 'catalogo',
  },
  {
    icone: 'microfone',
    titulo: 'Entende os áudios dos clientes',
    texto: 'O assistente entende mensagens de voz e responde por escrito.',
    detalhe: 'audio',
  },
  {
    icone: 'grafico',
    titulo: 'Relatório financeiro e insights do negócio',
    texto: 'Quanto você faturou, o ticket médio, os dias que mais vendem e os clientes que mais voltam.',
    detalhe: 'relatorios',
    largo: true,
  },
  {
    icone: 'ajustes',
    titulo: 'Totalmente do seu jeito',
    texto: 'Saudação, regras da loja e jeito de falar definidos por você.',
    detalhe: 'jeito',
  },
  {
    icone: 'pessoa',
    titulo: 'Você assume a qualquer momento',
    texto: 'Respondeu pelo celular? O assistente sai daquela conversa.',
    detalhe: 'assumir',
  },
];

/** Barras da miniatura do relatório (altura em %). */
const BARRAS = [36, 52, 44, 70, 58, 100, 30];

/** Ondas da nota de voz na miniatura do áudio (altura em %). */
const ONDAS = [30, 55, 80, 45, 95, 60, 35, 70, 50, 85, 40, 65, 30, 50, 75, 40, 25];

/** O que a vitrine pública reúne (no computador, ao lado do texto do último card). */
const RECURSOS_VITRINE: { icone: NomeIcone; titulo: string; texto: string }[] = [
  { icone: 'imagem', titulo: 'Portfólio', texto: 'Suas fotos separadas por tema' },
  { icone: 'estrela', titulo: 'Feedbacks', texto: 'O que os clientes dizem, com estrelas' },
  { icone: 'local', titulo: 'Como chegar', texto: 'Endereço com mapa e rota' },
  { icone: 'calendario', titulo: 'Agendamento', texto: 'Para serviços, a sua agenda online' },
];

/**
 * "A solução": o que o DizAI faz por qualquer negócio. O cartão azul abre com o placar (Mais: tempo e vendas |
 * Menos: clientes perdidos e horas no celular); os outros, um ganho cada, com uma miniatura da tela no pé.
 */
@Component({
  selector: 'app-secao-solucao',
  imports: [IconeComponent, ArtePostComponent, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secao-solucao.component.html',
  styleUrls: ['../secao-landing.css', './secao-solucao.component.css', './ganho-vitrine.css', './ganho-posts.css', './ganho-placar.css'],
})
export class SecaoSolucaoComponent implements AfterViewInit, OnDestroy {
  /** O cartão azul: lado a lado, o que aumenta e o que diminui com o assistente atendendo. */
  protected readonly placar = [
    { tipo: 'mais', titulo: 'Mais', itens: ['Tempo para produzir', 'Vendas fechadas'] },
    { tipo: 'menos', titulo: 'Menos', itens: ['Clientes perdidos', 'Horas no celular'] },
  ] as const;
  /** As linhas do placar sobem uma a uma na primeira vez que o card aparece na tela (e ficam paradas). */
  protected readonly placarVisivel = signal(false);
  private readonly cartaoPlacar = viewChild<ElementRef<HTMLElement>>('cartaoPlacar');
  private observador?: IntersectionObserver;

  ngAfterViewInit(): void {
    const cartao = this.cartaoPlacar()?.nativeElement;
    if (!cartao || typeof IntersectionObserver === 'undefined') {
      this.placarVisivel.set(true);
      return;
    }
    this.observador = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) {
        this.placarVisivel.set(true);
        this.observador?.disconnect();
      }
    }, { threshold: 0.4 });
    this.observador.observe(cartao);
  }

  ngOnDestroy(): void {
    this.observador?.disconnect();
  }

  protected readonly ganhos = GANHOS;
  protected readonly barras = BARRAS;
  protected readonly ondas = ONDAS;
  protected readonly recursosVitrine = RECURSOS_VITRINE;
  /** Três artes do gerador de posts, de negócios diferentes (as mesmas da seção "Redes sociais"). */
  protected readonly postsDeExemplo = [EXEMPLOS_POSTS[1], EXEMPLOS_POSTS[0], EXEMPLOS_POSTS[3]];

  /** "Ver mais": desce até a seção da vitrine pública ou a de redes sociais, mais abaixo na landing. */
  protected verSecao(id: 'galeria' | 'posts'): void {
    const galeria = document.getElementById(id);
    if (!galeria) {
      return;
    }
    galeria.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // as seções do meio carregam imagens enquanto a página rola e empurram a vitrine para baixo: no fim, acerta
    const acertar = () => {
      if (Math.abs(galeria.getBoundingClientRect().top) > 4) {
        galeria.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    if ('onscrollend' in window) {
      window.addEventListener('scrollend', acertar, { once: true });
    } else {
      setTimeout(acertar, 1200);   // Safari sem o evento scrollend
    }
  }
}
