import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { MODOS_PEDIDO } from '../../../../core/constants/opcoes-perfil';
import { ConversaService } from '../../../../core/services/conversa.service';
import { GaleriaService } from '../../../../core/services/galeria.service';
import { PerfilService } from '../../../../core/services/perfil.service';
import { PerguntaFrequenteService } from '../../../../core/services/pergunta-frequente.service';
import { ProdutoService } from '../../../../core/services/produto.service';
import { OpcaoCardComponent } from '../../../../shared/components/opcao-card/opcao-card.component';
import { SecaoConfiguracaoComponent } from '../../../../shared/components/secao-configuracao/secao-configuracao.component';
import { AtalhosSecoesComponent } from '../../../painel/atalhos-secoes/atalhos-secoes.component';
import { OnboardingTourService } from '../../../painel/onboarding/onboarding-tour.service';
import { ResumoLojaComponent } from '../../../painel/resumo-loja/resumo-loja.component';

/**
 * Painel do lojista exibido dentro do celular da landing page.
 * Usa os mesmos componentes do painel de verdade, com instâncias próprias dos serviços:
 * assim a prévia mostra sempre a loja de exemplo, mesmo que o visitante já tenha feito o cadastro.
 */
@Component({
  selector: 'app-previa-painel',
  imports: [ResumoLojaComponent, AtalhosSecoesComponent, SecaoConfiguracaoComponent, OpcaoCardComponent],
  providers: [
    PerfilService,
    ConversaService,
    ProdutoService,
    PerguntaFrequenteService,
    GaleriaService,
    OnboardingTourService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './previa-painel.component.html',
  styleUrl: './previa-painel.component.css',
  host: {
    // Só para ver: links e botões da prévia não recebem clique nem foco.
    inert: '',
    'aria-hidden': 'true',
  },
})
export class PreviaPainelComponent {
  private readonly perfil = inject(PerfilService).perfil;

  protected readonly modosPedido = MODOS_PEDIDO;
  protected readonly modoPedidoAtual = computed(() => this.perfil().modoPedido);
  protected readonly instrucoesObrigatorias = computed(() => this.perfil().instrucoesObrigatorias);
}
