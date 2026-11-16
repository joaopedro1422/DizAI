import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { CHAVE_TIPO_VISTO, ROTA_LANDING, TipoLanding } from '../../landing/conteudo-landing';
import { ArtePostComponent } from '../../posts/arte-post/arte-post.component';
import { artesDaLanding } from '../landing/artes-landing';
import { semMovimento } from '../movimento';
import { MUNDOS_HUB, MundoHub, ONDAS_HUB } from './mundos-hub';

/**
 * O hub (/) na marca nova: o topo centralizado (o valor da solução inteira) e os dois "mundos" (Vendas e Agendamentos). Cada mundo
 * passa 3 cenas como stories: a barrinha de cima enche no tempo da cena (o fim da animação passa para a próxima;
 * o mouse em cima pausa). Em cada cena chegam a pergunta, o "digitando…", o resultado e o aviso. Depois, o que o
 * assistente faz, os recursos da plataforma (valem sem o assistente) e as portas. CSS preso a .hb (ViewEncapsulation.None).
 */
@Component({
  selector: 'app-hub-page',
  imports: [RouterLink, IconeComponent, LogoComponent, ArtePostComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './hub-page.component.html',
  styleUrls: ['../marca-base.css', './hub.css', './hub-hero.css', './hub-comum.css', './hub-recursos.css'],
  host: { class: 'marca hb' },
})
export class HubPageComponent {
  /** O cartão de posts dos recursos: 3 artes do gerador de verdade, em leque. */
  protected readonly artes = artesDaLanding('produtos').slice(0, 3);
  /** A página personalizada: vitrines de negócios diferentes, trocando a cada 3,2 s. */
  protected readonly vitrines = VITRINES;
  protected readonly vitrineAtual = signal(0);
  protected readonly anoAtual = new Date().getFullYear();
  protected readonly mundos = MUNDOS_HUB;
  protected readonly ondas = ONDAS_HUB;
  protected readonly rotaVendas = ROTA_LANDING.produtos;
  protected readonly rotaAgenda = ROTA_LANDING.servicos;
  protected readonly ultimoVisto = lerUltimoVisto();
  protected readonly cenaAtual = signal<Record<TipoLanding, number>>({ produtos: 0, servicos: 0 });
  /** Na primeira volta o segundo mundo espera um pouco, para os dois não trocarem juntos. */
  protected readonly primeiraVolta = signal(true);

  constructor() {
    if (semMovimento()) return;
    const relogio = setInterval(() => this.vitrineAtual.update((n) => (n + 1) % VITRINES.length), 3200);
    inject(DestroyRef).onDestroy(() => clearInterval(relogio));
  }

  /** "Ver para o meu negócio": desce até os dois mundos. */
  protected irParaMundos(): void {
    document.getElementById('mundos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** A barrinha da cena terminou de encher: vai para a próxima. */
  protected avancar(mundo: MundoHub, evento: AnimationEvent): void {
    if (!evento.animationName.startsWith('hb-enche')) {
      return;
    }
    // só o próprio mundo atrasado desliga o atraso (mudar o atraso no meio faria a barrinha dele pular)
    if (mundo.tipo === 'servicos') {
      this.primeiraVolta.set(false);
    }
    this.cenaAtual.update((atual) => ({ ...atual, [mundo.tipo]: (atual[mundo.tipo] + 1) % mundo.cenas.length }));
  }
}

const GALERIA = '/landing/galeria';
const fotos = (pasta: string, ns: string[]) => ns.map((n) => `${GALERIA}/${pasta}/${n}.webp`);

/** As vitrines do cartão "Página personalizada": a capa, a logo, a fonte e a cor de cada loja. */
const VITRINES = [
  { nome: 'Pedacinho do Céu', descricao: 'Doces e tortas personalizadas', logo: `${GALERIA}/logos/pedacinho-do-ceu.jpg`, capa: "url('/landing/hub/pedacinho-capa.webp') center / cover", fundo: '#fffaf3', cor: '#8a6200', fonte: "'Dancing Script', cursive", nota: '4,9', fotos: fotos('bolos', ['01', '04', '06']) },
  { nome: 'Studio Bella', descricao: 'Unhas em gel e nail art', logo: `${GALERIA}/logos/studio-bella.webp`, capa: 'linear-gradient(135deg, #b8457a, #eaa6c6)', fundo: '#fff5f9', cor: '#b8457a', fonte: "'Dancing Script', cursive", nota: '5,0', fotos: fotos('unhas', ['01', '04', '07']) },
  { nome: 'Barbearia do Léo', descricao: 'Corte, barba e sobrancelha', logo: `${GALERIA}/logos/barbearia-do-leo.svg`, capa: 'linear-gradient(135deg, #151515, #4d4d4d)', fundo: '#f4f4f4', cor: '#151515', fonte: "'Oswald', sans-serif", nota: '4,8', fotos: fotos('barbearia', ['01', '02', '03']) },
  { nome: 'Rei dos Salgados', descricao: 'Salgados de festa, fritos e assados', logo: `${GALERIA}/logos/rei-dos-salgados.svg`, capa: 'linear-gradient(135deg, #e8730c, #f6b56f)', fundo: '#fff8f1', cor: '#b8520a', fonte: "'Oswald', sans-serif", nota: '4,9', fotos: fotos('salgados', ['01', '02', '03']) },
];

function lerUltimoVisto(): TipoLanding | null {
  try {
    const valor = localStorage.getItem(CHAVE_TIPO_VISTO);
    return valor === 'produtos' || valor === 'servicos' ? valor : null;
  } catch {
    return null;
  }
}
