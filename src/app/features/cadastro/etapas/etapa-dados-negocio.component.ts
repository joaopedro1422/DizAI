import { Component, computed, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { CONTEUDO_POR_RAMO } from '../../../core/constants/conteudo-por-ramo';
import { RamoNegocio } from '../../../core/models/perfil.model';
import { campoComErro } from '../../../core/utils/validadores';
import { GrupoDadosNegocio } from '../cadastro-formulario';

type CampoDadosNegocio = keyof GrupoDadosNegocio['controls'];

/** Passo 2: nome, nome do negócio e descrição (os exemplos seguem o ramo escolhido no passo 1). */
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
  /** Ramo escolhido: deixa os exemplos do nome e da descrição com a cara do negócio. */
  readonly ramo = input<RamoNegocio | null | undefined>(null);
  protected readonly exemplos = computed(() => CONTEUDO_POR_RAMO[this.ramo() || 'SERVICOS_PRESENCIAIS']);

  protected temErro(campo: CampoDadosNegocio): boolean {
    return campoComErro(this.grupo().controls[campo]);
  }
}
