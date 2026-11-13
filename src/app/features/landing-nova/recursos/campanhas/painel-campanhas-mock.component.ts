import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { IconeComponent } from '../../../../shared/components/icone/icone.component';
import { NomeIcone } from '../../../../shared/components/icone/icones';
import type { TipoLanding } from '../../../landing/conteudo-landing';
import { ArtePostComponent } from '../../../posts/arte-post/arte-post.component';
import { CelularMockComponent } from '../../celular-mock.component';
import { CenaCampanhas, ExemploCampanhas } from './conteudo-recurso-campanhas';

/**
 * As campanhas do painel dentro do celular, cena por cena, para o topo da página de campanhas: a oportunidade no
 * painel, os 3 passos da folha "Nova campanha" (mensagem, quem recebe, enviar), o cliente recebendo e respondendo no
 * WhatsApp e o relatório em reais. Cópia fiel das telas reais (oportunidade-painel, nova-campanha, resultado-campanha,
 * regras de celular): ao mudar essas telas, atualize aqui. Cada cena é recriada ao ficar ativa, e as animações (CSS,
 * por atraso) começam de novo.
 */
@Component({
  selector: 'app-painel-campanhas-mock',
  imports: [NgTemplateOutlet, CelularMockComponent, IconeComponent, ArtePostComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './painel-campanhas-mock.component.html',
  styleUrls: ['../vitrine/painel-vitrine-mock.css', './painel-campanhas-mock.css', './painel-campanhas-cenas.css'],
})
export class PainelCampanhasMockComponent {
  readonly cena = input.required<CenaCampanhas>();
  readonly tipo = input.required<TipoLanding>();
  readonly exemplo = input.required<ExemploCampanhas>();

  protected readonly servico = computed(() => this.tipo() === 'servicos');
  protected readonly maiorFunil = computed(() => this.exemplo().resultado.funil[0][1]);
  protected readonly icone = (nome: string) => nome as NomeIcone;
  protected readonly passos = ['Mensagem', 'Quem recebe', 'Enviar'];
}
