import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { campoComErro } from '../../../core/utils/validadores';
import { GrupoDadosNegocio } from '../cadastro-formulario';

type CampoDadosNegocio = keyof GrupoDadosNegocio['controls'];

/** Passo 1: nome, nome do negócio e descrição. */
@Component({
  selector: 'app-etapa-dados-negocio',
  imports: [ReactiveFormsModule],
  templateUrl: './etapa-dados-negocio.component.html',
  styleUrl: './etapa.css',
})
export class EtapaDadosNegocioComponent {
  readonly grupo = input.required<GrupoDadosNegocio>();
  /** Falso quando os campos são usados fora do cadastro (ex.: modal de dados da loja). */
  readonly exibirCabecalho = input(true);

  protected temErro(campo: CampoDadosNegocio): boolean {
    return campoComErro(this.grupo().controls[campo]);
  }
}
