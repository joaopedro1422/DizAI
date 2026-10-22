import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { mensagemDoErro } from '../../../core/api/erro-api';
import { PerfilService } from '../../../core/services/perfil.service';
import { ToastService } from '../../../core/services/toast.service';
import { BottomSheetComponent } from '../../../shared/components/bottom-sheet/bottom-sheet.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { InterruptorComponent } from '../../../shared/components/interruptor/interruptor.component';

/**
 * "Facilitador de orçamentos" (lojas de produtos): liga a aba Orçamento da página pública, onde o cliente monta o
 * pedido e envia pelo WhatsApp. Ao ligar, um modal explica o que é e pede capricho no cadastro dos produtos.
 */
@Component({
  selector: 'app-facilitador-orcamento',
  imports: [IconeComponent, InterruptorComponent, BottomSheetComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './facilitador-orcamento.component.html',
  styleUrl: './facilitador-orcamento.component.css',
})
export class FacilitadorOrcamentoComponent {
  private readonly perfilService = inject(PerfilService);
  private readonly toastService = inject(ToastService);

  protected readonly ativo = computed(() => this.perfilService.perfil().orcamentoAtivo === true);
  protected readonly linkPagina = computed(() => `${this.perfilService.caminhoPaginaPublica()}/orcamento`);
  protected readonly explicando = signal(false);
  protected readonly salvando = signal(false);

  protected alternar(ligar: boolean): void {
    if (ligar) {
      this.explicando.set(true);
      return;
    }
    void this.salvar(false);
  }

  protected async confirmar(): Promise<void> {
    await this.salvar(true);
    this.explicando.set(false);
  }

  private async salvar(ativo: boolean): Promise<void> {
    if (this.salvando()) {
      return;
    }
    this.salvando.set(true);
    try {
      await this.perfilService.definirOrcamentoAtivo(ativo);
      this.toastService.mostrar(ativo ? 'Facilitador de orçamentos ligado' : 'Facilitador de orçamentos desligado');
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível salvar. Tente de novo.'));
    } finally {
      this.salvando.set(false);
    }
  }
}
