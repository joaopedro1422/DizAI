import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { EMAIL_SUPORTE } from '../../../core/constants/contato';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { CHAVE_TIPO_VISTO, TipoLanding } from '../../landing/conteudo-landing';
import { FaixaTechProviderComponent } from '../../landing/faixa-tech-provider/faixa-tech-provider.component';
import { PergunteDizaiComponent } from '../../landing/secao-perguntas/pergunte-dizai/pergunte-dizai.component';
import { RevelarAoRolarDirective } from '../../landing/revelar-ao-rolar.directive';
import { CelularMockComponent } from '../celular-mock.component';
import { ComoFuncionaLandingComponent } from './como-funciona-landing.component';
import { CONTEUDO_AGENDAMENTOS } from './conteudo-agendamentos';
import { ConteudoLandingNova, ONDAS_AUDIO } from './conteudo-landing-nova';
import { CONTEUDO_VENDAS } from './conteudo-vendas';
import { HeroLandingComponent } from './hero-landing.component';
import { NaPraticaAgendaComponent } from './na-pratica-agenda.component';
import { NaPraticaVendasComponent } from './na-pratica-vendas.component';
import { ProvaLandingComponent } from './prova-landing.component';
import { RecursosAgendaComponent } from './recursos-agenda.component';
import { RecursosVendasComponent } from './recursos-vendas.component';
import { VitrinePostsLandingComponent } from './vitrine-posts-landing.component';

/** Liga a faixa "Somos Tech Provider da Meta": só depois que a Meta aprovar a análise do app. */
const TECH_PROVIDER_APROVADO = false;

const CONTEUDOS: Record<TipoLanding, ConteudoLandingNova> = {
  produtos: CONTEUDO_VENDAS,
  servicos: CONTEUDO_AGENDAMENTOS,
};

/**
 * As duas landings da marca nova, /vendas (produtos) e /agendamentos (serviços), pelo `data: { tipo }` da rota.
 * Mesma ordem de seções; o que é só de cada tipo é o "Na prática" e os Recursos (vendas × agenda), no mesmo lugar.
 * CSS nos arquivos desta pasta, preso à classe .lv (ViewEncapsulation.None) e à base .marca.
 */
@Component({
  selector: 'app-landing-nova',
  imports: [
    RouterLink,
    LogoComponent,
    CelularMockComponent,
    RevelarAoRolarDirective,
    FaixaTechProviderComponent,
    PergunteDizaiComponent,
    HeroLandingComponent,
    ProvaLandingComponent,
    ComoFuncionaLandingComponent,
    NaPraticaVendasComponent,
    NaPraticaAgendaComponent,
    RecursosVendasComponent,
    RecursosAgendaComponent,
    VitrinePostsLandingComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './landing-nova.component.html',
  styleUrls: [
    '../marca-base.css',
    './landing-topo.css',
    './landing-meio.css',
    './landing-recursos.css',
    './landing-vitrine.css',
    './landing-campanhas.css',
    './landing-agenda.css',
    './landing-fim.css',
  ],
  host: { class: 'marca lv' },
})
export class LandingNovaComponent {
  readonly tipo = input.required<TipoLanding>();

  protected readonly conteudo = computed(() => CONTEUDOS[this.tipo()]);
  protected readonly negociosEmDobro = computed(() => [...this.conteudo().negocios, ...this.conteudo().negocios]);
  protected readonly techProviderAprovado = TECH_PROVIDER_APROVADO;
  protected readonly anoAtual = new Date().getFullYear();
  protected readonly emailSuporte = EMAIL_SUPORTE;
  protected readonly ondas = ONDAS_AUDIO;

  constructor() {
    const titulo = inject(Title);
    effect(() => {
      titulo.setTitle(this.conteudo().tituloPagina);
      try {
        localStorage.setItem(CHAVE_TIPO_VISTO, this.tipo());
      } catch {
        // sem armazenamento: o hub só não destaca a última escolha
      }
    });
  }
}
