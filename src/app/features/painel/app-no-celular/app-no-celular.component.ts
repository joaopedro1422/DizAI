import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';

import { InstalacaoAppService } from '../../../core/pwa/instalacao-app.service';
import { NotificacoesPushService } from '../../../core/pwa/notificacoes-push.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * "DizAI no seu celular": instalar o atalho (PWA) e ativar os avisos de pedido pronto para fechar.
 * cartao: fica no painel enquanto houver algo a fazer. convite: dentro da janela do fim do onboarding.
 * Some sozinho quando o app já está instalado e os avisos ativos (ou o aparelho não tem suporte).
 */
@Component({
  selector: 'app-no-celular',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-no-celular.component.html',
  styleUrl: './app-no-celular.component.css',
})
export class AppNoCelularComponent {
  readonly modo = input<'cartao' | 'convite'>('cartao');

  private readonly instalacao = inject(InstalacaoAppService);
  private readonly avisos = inject(NotificacoesPushService);
  private readonly toastService = inject(ToastService);

  protected readonly mostrarInstalar = this.instalacao.podeInstalar;
  protected readonly estadoAvisos = this.avisos.estado;
  protected readonly mostrarPassosIphone = signal(false);
  protected readonly ativando = signal(false);

  protected readonly temAlgoAFazer = computed(
    () =>
      this.mostrarInstalar() || ['desativado', 'precisa-instalar', 'bloqueado'].includes(this.estadoAvisos()),
  );

  protected async instalar(): Promise<void> {
    const resultado = await this.instalacao.instalar();
    if (resultado === 'instrucoes-iphone') {
      this.mostrarPassosIphone.set(true);
    } else if (resultado === 'instalado') {
      this.toastService.mostrar('Pronto! O DizAI está na tela do seu celular.');
    }
  }

  protected async ativarAvisos(): Promise<void> {
    if (this.ativando()) {
      return;
    }
    this.ativando.set(true);
    try {
      const estado = await this.avisos.ativar();
      if (estado === 'ativo') {
        this.toastService.mostrar('Avisos ativados: você recebe uma notificação quando um pedido estiver pronto.');
      } else if (estado === 'bloqueado') {
        this.toastService.mostrar('As notificações foram bloqueadas. Libere nas configurações do navegador.');
      }
    } catch {
      this.toastService.mostrar('Não foi possível ativar os avisos. Tente de novo.');
    } finally {
      this.ativando.set(false);
    }
  }
}
