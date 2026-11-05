import { ChangeDetectionStrategy, Component, OnInit, inject, input } from '@angular/core';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../../core/api/erro-api';
import { PedidoService } from '../../../core/services/pedido.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { AlvoTourDirective } from '../../painel/onboarding/alvo-tour.directive';
import {
  ConfigMensagensProntas,
  MensagensProntasComponent,
} from '../../agenda/mensagens-prontas/mensagens-prontas.component';
import { AGRADECIMENTO_PADRAO, AVISO_PRONTO_PADRAO, preencherAviso } from '../textos-pedido';

@Component({
  selector: 'app-mensagens-pedidos',
  imports: [IconeComponent, MensagensProntasComponent, AlvoTourDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mensagens-pedidos.component.html',
  styleUrls: ['../../agenda/horarios-atendimento/ajustes-agenda.css', './mensagens-pedidos.component.css'],
})
export class MensagensPedidosComponent implements OnInit {
  readonly config = input.required<ConfigMensagensProntas>();
  /** O primeiro nome dos exemplos do segmento, para a prévia dos avisos. */
  readonly clienteExemplo = input('Ana');

  private readonly pedidoService = inject(PedidoService);
  private readonly toastService = inject(ToastService);

  protected readonly avisoPronto = AVISO_PRONTO_PADRAO;
  protected readonly agradecimento = AGRADECIMENTO_PADRAO;

  protected previa(texto: string): string {
    return preencherAviso(texto, this.clienteExemplo(), null);
  }

  ngOnInit(): void {
    this.pedidoService.carregarMensagensProntas().catch((erro: unknown) =>
      this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR)),
    );
  }
}
