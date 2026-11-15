import { ChangeDetectionStrategy, Component, ViewEncapsulation, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { CHAVE_TIPO_VISTO, ROTA_LANDING, TipoLanding } from '../../landing/conteudo-landing';
import { TituloDigitandoComponent } from '../titulo-digitando.component';
import { ArtePostComponent } from '../../posts/arte-post/arte-post.component';
import { artesDaLanding } from '../landing/artes-landing';
import { MUNDOS_HUB, MundoHub, ONDAS_HUB } from './mundos-hub';

/**
 * O hub (/) na marca nova: o topo centralizado (o valor da solução inteira) e os dois "mundos" (Vendas e Agendamentos). Cada mundo
 * passa 3 cenas como stories: a barrinha de cima enche no tempo da cena (o fim da animação passa para a próxima;
 * o mouse em cima pausa). Em cada cena chegam a pergunta, o "digitando…", o resultado e o aviso. Depois, o que o
 * assistente faz, os recursos da plataforma (valem sem o assistente) e as portas. CSS preso a .hb (ViewEncapsulation.None).
 */
@Component({
  selector: 'app-hub-page',
  imports: [RouterLink, IconeComponent, LogoComponent, TituloDigitandoComponent, ArtePostComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './hub-page.component.html',
  styleUrls: ['../marca-base.css', './hub.css', './hub-hero.css', './hub-comum.css', './hub-recursos.css'],
  host: { class: 'marca hb' },
})
export class HubPageComponent {
  /** As funções que se alternam no título ("Um assistente que" atende, agenda...); para de novo em "atende". */
  protected readonly funcoes = ['atende', 'agenda', 'anota os pedidos', 'divulga', 'vende por você'];
  /** O cartão de posts dos recursos: 3 artes do gerador de verdade, em leque. */
  protected readonly artes = artesDaLanding('produtos').slice(0, 3);
  protected readonly anoAtual = new Date().getFullYear();
  protected readonly mundos = MUNDOS_HUB;
  protected readonly ondas = ONDAS_HUB;
  protected readonly rotaVendas = ROTA_LANDING.produtos;
  protected readonly rotaAgenda = ROTA_LANDING.servicos;
  protected readonly ultimoVisto = lerUltimoVisto();
  protected readonly cenaAtual = signal<Record<TipoLanding, number>>({ produtos: 0, servicos: 0 });
  /** Na primeira volta o segundo mundo espera um pouco, para os dois não trocarem juntos. */
  protected readonly primeiraVolta = signal(true);

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

function lerUltimoVisto(): TipoLanding | null {
  try {
    const valor = localStorage.getItem(CHAVE_TIPO_VISTO);
    return valor === 'produtos' || valor === 'servicos' ? valor : null;
  } catch {
    return null;
  }
}
