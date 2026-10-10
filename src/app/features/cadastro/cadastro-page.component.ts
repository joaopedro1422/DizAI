import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { mensagemDoErro } from '../../core/api/erro-api';
import { AutenticacaoService } from '../../core/auth/autenticacao.service';
import { ToastService } from '../../core/services/toast.service';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { criarFormularioCadastro } from './cadastro-formulario';
import { EtapaDadosNegocioComponent } from './etapas/etapa-dados-negocio.component';
import { EtapaAcessoComponent } from './etapas/etapa-acesso.component';
import { EtapaRamoComponent } from './etapas/etapa-ramo.component';

const TOTAL_ETAPAS = 3;

@Component({
  selector: 'app-cadastro-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IconeComponent,
    EtapaDadosNegocioComponent,
    EtapaRamoComponent,
    EtapaAcessoComponent,
    CarregandoComponent,
  ],
  templateUrl: './cadastro-page.component.html',
  styleUrl: './cadastro-page.component.css',
})
export class CadastroPageComponent {
  private readonly autenticacaoService = inject(AutenticacaoService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly formulario = criarFormularioCadastro(inject(FormBuilder));
  protected readonly totalEtapas = TOTAL_ETAPAS;
  protected readonly etapaAtual = signal(1);
  protected readonly criandoLoja = signal(false);

  protected readonly ehUltimaEtapa = computed(() => this.etapaAtual() === TOTAL_ETAPAS);
  protected readonly segmentosProgresso = Array.from({ length: TOTAL_ETAPAS }, (_, indice) => indice + 1);

  protected avancar(): void {
    const grupoDaEtapa = this.grupoDaEtapaAtual();
    if (grupoDaEtapa.invalid) {
      grupoDaEtapa.markAllAsTouched();
      return;
    }

    if (this.ehUltimaEtapa()) {
      void this.criarLoja();
      return;
    }

    this.etapaAtual.update((etapa) => etapa + 1);
    window.scrollTo({ top: 0 });
  }

  protected voltar(): void {
    this.etapaAtual.update((etapa) => Math.max(1, etapa - 1));
  }

  private async criarLoja(): Promise<void> {
    if (this.criandoLoja()) {
      return;
    }
    this.criandoLoja.set(true);
    try {
      const caminhoPainel = await this.autenticacaoService.cadastrar(this.formulario.getRawValue());
      await this.router.navigateByUrl(caminhoPainel);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível criar sua loja. Tente de novo.'), 5000);
    } finally {
      this.criandoLoja.set(false);
    }
  }

  private grupoDaEtapaAtual(): AbstractControl {
    const { dadosNegocio, acesso, ramo } = this.formulario.controls;
    switch (this.etapaAtual()) {
      case 1:
        return dadosNegocio;
      case 2:
        return acesso;
      default:
        return ramo;
    }
  }
}
