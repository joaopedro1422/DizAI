import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../shared/components/icone/icone.component';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { SecaoGaleriaComponent } from './secao-galeria/secao-galeria.component';
import { SecaoPostsComponent } from './secao-posts/secao-posts.component';
import { SecaoParaQuemComponent } from './secao-para-quem/secao-para-quem.component';
import { SecaoPerguntasComponent } from './secao-perguntas/secao-perguntas.component';
import { SecaoRecursosComponent } from './secao-recursos/secao-recursos.component';
import { FaixaNegociosComponent } from './faixa-negocios/faixa-negocios.component';
import { SecaoHeroComponent } from './secao-hero/secao-hero.component';
import { SecaoPesquisaComponent } from './secao-pesquisa/secao-pesquisa.component';
import { SecaoSolucaoComponent } from './secao-solucao/secao-solucao.component';
import { ComoFuncionaComponent } from './como-funciona/como-funciona.component';
import { HistoriaLandingComponent } from './historia/historia-landing.component';
import { ProblemaLandingComponent } from './problema/problema-landing.component';
import { RevelarAoRolarDirective } from './revelar-ao-rolar.directive';
import { CHAVE_TIPO_VISTO, CONTEUDO_LANDING, ROTA_LANDING, TipoLanding } from './conteudo-landing';

@Component({
  selector: 'app-landing-page',
  imports: [
    RouterLink,
    LogoComponent,
    IconeComponent,
    SecaoHeroComponent,
    FaixaNegociosComponent,
    ProblemaLandingComponent,
    SecaoPesquisaComponent,
    HistoriaLandingComponent,
    SecaoSolucaoComponent,
    SecaoGaleriaComponent,
    SecaoPostsComponent,
    ComoFuncionaComponent,
    SecaoRecursosComponent,
    SecaoParaQuemComponent,
    SecaoPerguntasComponent,
    RevelarAoRolarDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
  host: { '[attr.data-tipo]': 'tipo()' },
})
/**
 * Landing de um tipo de negócio (`/vendas` = produtos, `/agendamentos` = serviços; o tipo vem do `data` da rota):
 * as mesmas seções, cada uma com o tipo fixo (sem abas) e os textos, exemplos e conversas daquele público. Ordem: hero,
 * negócios, dores, MIT, linha do tempo, solução, recursos, como funciona, vitrine, redes sociais, para quem é, perguntas.
 */
export class LandingPageComponent {
  readonly tipo = input.required<TipoLanding>();

  protected readonly anoAtual = new Date().getFullYear();
  protected readonly conteudo = computed(() => CONTEUDO_LANDING[this.tipo()]);
  protected readonly rota = computed(() => ROTA_LANDING[this.tipo()]);
  /** O link para a landing do outro público, no fim da navegação. */
  protected readonly outra = computed(() =>
    this.tipo() === 'produtos'
      ? { rota: ROTA_LANDING.servicos, rotulo: 'Para quem agenda' }
      : { rota: ROTA_LANDING.produtos, rotulo: 'Para quem vende' },
  );
  /** O cadastro já abre com os ramos deste tipo. */
  protected readonly cadastro = computed(() => ({ tipo: this.tipo() }));

  constructor() {
    const titulo = inject(Title);
    effect(() => {
      titulo.setTitle(`${this.conteudo().tituloPagina} | DizAI`);
      try {
        localStorage.setItem(CHAVE_TIPO_VISTO, this.tipo());
      } catch {
        // sem armazenamento: o hub só não destaca a última escolha
      }
    });
  }
}
