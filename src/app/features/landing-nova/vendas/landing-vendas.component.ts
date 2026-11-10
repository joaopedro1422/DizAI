import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { EMAIL_SUPORTE } from '../../../core/constants/contato';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { CHAVE_TIPO_VISTO } from '../../landing/conteudo-landing';
import { FaixaTechProviderComponent } from '../../landing/faixa-tech-provider/faixa-tech-provider.component';
import { RevelarAoRolarDirective } from '../../landing/revelar-ao-rolar.directive';
import { CelularMockComponent } from '../celular-mock.component';
import { ComoFuncionaVendasComponent } from './como-funciona-vendas.component';
import {
  BLOQUEIO_VENDAS,
  CONFIANCA_VENDAS,
  DIA_VENDAS,
  DORES_VENDAS,
  FINAL_VENDAS,
  NEGOCIOS_VENDAS,
  ONDAS_AUDIO,
  PERGUNTAS_VENDAS,
  RAMOS_VENDAS,
} from './conteudo-vendas';
import { HeroVendasComponent } from './hero-vendas.component';
import { NaPraticaVendasComponent } from './na-pratica-vendas.component';
import { ProvaVendasComponent } from './prova-vendas.component';
import { RecursosVendasComponent } from './recursos-vendas.component';
import { VitrinePostsVendasComponent } from './vitrine-posts-vendas.component';

/** Liga a faixa "Somos Tech Provider da Meta": só depois que a Meta aprovar a análise do app. */
const TECH_PROVIDER_APROVADO = false;

/**
 * Landing de vendas (/vendas) na marca nova: azul-noite + amarelo-gema. As seções com animação são componentes
 * próprios; o CSS fica nos arquivos desta pasta, preso à classe .lv (ViewEncapsulation.None) e à base .marca.
 * A landing de agendamentos continua no LandingPageComponent antigo.
 */
@Component({
  selector: 'app-landing-vendas',
  imports: [
    RouterLink,
    LogoComponent,
    CelularMockComponent,
    RevelarAoRolarDirective,
    FaixaTechProviderComponent,
    HeroVendasComponent,
    ProvaVendasComponent,
    ComoFuncionaVendasComponent,
    NaPraticaVendasComponent,
    RecursosVendasComponent,
    VitrinePostsVendasComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './landing-vendas.component.html',
  styleUrls: [
    '../marca-base.css',
    './vendas-topo.css',
    './vendas-meio.css',
    './vendas-recursos.css',
    './vendas-vitrine.css',
    './vendas-fim.css',
  ],
  host: { class: 'marca lv' },
})
export class LandingVendasComponent {
  protected readonly techProviderAprovado = TECH_PROVIDER_APROVADO;
  protected readonly anoAtual = new Date().getFullYear();
  protected readonly emailSuporte = EMAIL_SUPORTE;
  protected readonly negociosEmDobro = [...NEGOCIOS_VENDAS, ...NEGOCIOS_VENDAS];
  protected readonly dores = DORES_VENDAS;
  protected readonly bloqueio = BLOQUEIO_VENDAS;
  protected readonly dia = DIA_VENDAS;
  protected readonly ondas = ONDAS_AUDIO;
  protected readonly confianca = CONFIANCA_VENDAS;
  protected readonly ramos = RAMOS_VENDAS;
  protected readonly perguntas = PERGUNTAS_VENDAS;
  protected readonly final = FINAL_VENDAS;

  constructor() {
    inject(Title).setTitle('DizAI para quem vende pelo WhatsApp: orçamentos e pedidos anotados');
    try {
      localStorage.setItem(CHAVE_TIPO_VISTO, 'produtos');
    } catch {
      // sem armazenamento: o hub só não destaca a última escolha
    }
  }
}
