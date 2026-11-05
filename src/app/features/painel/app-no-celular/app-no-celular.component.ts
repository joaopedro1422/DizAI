import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';

import { InstalacaoAppService } from '../../../core/pwa/instalacao-app.service';
import { NotificacoesPushService } from '../../../core/pwa/notificacoes-push.service';
import { ToastService } from '../../../core/services/toast.service';

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
  protected readonly testando = signal(false);

  /** No convite (menu ⋮ → Notificações) o "ativo" também aparece, com o botão de testar. */
  protected readonly temAlgoAFazer = computed(
    () =>
      this.mostrarInstalar() ||
      ['desativado', 'precisa-instalar', 'bloqueado'].includes(this.estadoAvisos()) ||
      (this.modo() === 'convite' && this.estadoAvisos() === 'ativo'),
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

  protected async testarAvisos(): Promise<void> {
    if (this.testando()) {
      return;
    }
    this.testando.set(true);
    try {
      // garante que este aparelho está inscrito no servidor antes de mandar
      await this.avisos.ativar();
      const resultado = await this.avisos.testar();
      if (!resultado.configurado) {
        this.toastService.mostrar('As notificações estão desligadas no servidor.');
      } else if (resultado.enviados === 0) {
        this.toastService.mostrar('Não foi possível enviar o aviso. Desative e ative as notificações de novo.');
      } else {
        this.toastService.mostrar('Aviso enviado! Ele chega em alguns segundos.');
      }
    } catch {
      this.toastService.mostrar('Não foi possível enviar o aviso de teste. Tente de novo.');
    } finally {
      this.testando.set(false);
    }
  }
}
