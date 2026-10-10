import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SessaoService } from '../../../core/auth/sessao.service';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

/** Aviso do painel enquanto o número da loja ainda não foi conectado ao WhatsApp oficial. */
@Component({
  selector: 'app-alerta-conexao-whatsapp',
  imports: [RouterLink, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alerta-conexao-whatsapp.component.html',
  styleUrl: './alerta-conexao-whatsapp.component.css',
})
export class AlertaConexaoWhatsappComponent {
  protected readonly rotas = inject(SessaoService).rotasDoPainel;
}
