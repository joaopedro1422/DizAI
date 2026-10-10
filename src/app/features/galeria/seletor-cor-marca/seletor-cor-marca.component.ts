import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { mensagemDoErro } from '../../../core/api/erro-api';
import { CORES_MARCA, buscarCorMarca } from '../../../core/constants/cores-marca';
import { CorMarca } from '../../../core/models/perfil.model';
import { PerfilService } from '../../../core/services/perfil.service';
import { ToastService } from '../../../core/services/toast.service';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

/**
 * Escolha da cor da página pública (categoria selecionada, botão do WhatsApp, inicial da loja).
 * Fica dentro do modal "Cor da página" da galeria e salva na hora em que o lojista toca na cor.
 */
@Component({
  selector: 'app-seletor-cor-marca',
  imports: [IconeComponent, CarregandoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './seletor-cor-marca.component.html',
  styleUrl: './seletor-cor-marca.component.css',
})
export class SeletorCorMarcaComponent {
  private readonly perfilService = inject(PerfilService);
  private readonly toastService = inject(ToastService);

  protected readonly cores = CORES_MARCA;
  protected readonly corAtual = computed(() => this.perfilService.perfil().corMarca);
  protected readonly nomeCorAtual = computed(() => buscarCorMarca(this.corAtual()).nome);
  /** Cor que está sendo salva agora (mostra o carregando na bolinha). */
  protected readonly salvando = signal<CorMarca | null>(null);

  protected async escolher(cor: CorMarca): Promise<void> {
    if (cor === this.corAtual() || this.salvando()) {
      return;
    }
    this.salvando.set(cor);
    try {
      await this.perfilService.atualizarCorMarca(cor);
      this.toastService.mostrar(`Página pública agora em ${buscarCorMarca(cor).nome.toLowerCase()}`);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível trocar a cor. Tente de novo.'));
    } finally {
      this.salvando.set(null);
    }
  }
}
