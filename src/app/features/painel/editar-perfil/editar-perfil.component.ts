import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { RAMOS_NEGOCIO } from '../../../core/constants/opcoes-perfil';
import { DadosLoja, RamoNegocio } from '../../../core/models/perfil.model';
import { PerfilService } from '../../../core/services/perfil.service';
import { formatarTelefone } from '../../../core/utils/texto.utils';
import { campoComErro, telefoneValido } from '../../../core/utils/validadores';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { criarGrupoDadosNegocio, criarGrupoPagamentoEntrega } from '../../cadastro/cadastro-formulario';
import { EtapaDadosNegocioComponent } from '../../cadastro/etapas/etapa-dados-negocio.component';
import { EtapaPagamentoEntregaComponent } from '../../cadastro/etapas/etapa-pagamento-entrega.component';

/**
 * Formulário do modal "Dados da loja". Reaproveita os campos e validações do cadastro,
 * já preenchidos com o perfil atual.
 */
@Component({
  selector: 'app-editar-perfil',
  imports: [ReactiveFormsModule, EtapaDadosNegocioComponent, EtapaPagamentoEntregaComponent, CarregandoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './editar-perfil.component.html',
  styleUrl: './editar-perfil.component.css',
})
export class EditarPerfilComponent {
  readonly salvo = output<void>();

  private readonly perfilService = inject(PerfilService);

  protected readonly ramos = RAMOS_NEGOCIO;
  protected readonly salvando = signal(false);
  protected readonly formulario = this.criarFormularioPreenchido();

  protected whatsappComErro(): boolean {
    return campoComErro(this.formulario.controls.whatsapp);
  }

  protected formatarWhatsapp(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    this.formulario.controls.whatsapp.setValue(formatarTelefone(campo.value));
  }

  protected escolherRamo(ramo: RamoNegocio): void {
    this.formulario.controls.ramo.setValue(ramo);
  }

  protected async salvar(): Promise<void> {
    if (this.salvando()) {
      return;
    }
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.salvando.set(true);
    try {
      await this.perfilService.atualizarDadosLoja(this.montarDadosLoja());
      this.salvo.emit();
    } finally {
      this.salvando.set(false);
    }
  }

  private montarDadosLoja(): DadosLoja {
    const { dadosNegocio, whatsapp, ramo, pagamentoEntrega } = this.formulario.getRawValue();
    return { dadosNegocio: { ...dadosNegocio, whatsapp }, ramo, pagamentoEntrega };
  }

  private criarFormularioPreenchido() {
    const fb = inject(FormBuilder);
    const formulario = fb.nonNullable.group({
      dadosNegocio: criarGrupoDadosNegocio(fb),
      whatsapp: ['', [Validators.required, telefoneValido]],
      ramo: fb.nonNullable.control<RamoNegocio>('OUTRO'),
      pagamentoEntrega: criarGrupoPagamentoEntrega(fb),
    });
    const perfil = this.perfilService.perfil();
    formulario.setValue({
      dadosNegocio: {
        nomeResponsavel: perfil.nomeResponsavel,
        nomeLoja: perfil.nomeLoja,
        descricao: perfil.descricao,
      },
      whatsapp: perfil.whatsapp,
      ramo: perfil.ramo,
      pagamentoEntrega: {
        formasPagamento: perfil.formasPagamento,
        formasRecebimento: perfil.formasRecebimento,
        distanciaMaximaKm: perfil.distanciaMaximaKm,
        taxaEntrega: perfil.taxaEntrega,
        prazoMinimo: perfil.prazoMinimo,
      },
    });
    return formulario;
  }
}
