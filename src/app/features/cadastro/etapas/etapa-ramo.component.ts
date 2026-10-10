import { Component, input } from '@angular/core';

import { RAMOS_NEGOCIO } from '../../../core/constants/opcoes-perfil';
import { RamoNegocio } from '../../../core/models/perfil.model';
import { OpcaoCardComponent } from '../../../shared/components/opcao-card/opcao-card.component';
import { ControleRamo } from '../cadastro-formulario';

/** Passo 3: o ramo que mais se parece com o negócio. */
@Component({
  selector: 'app-etapa-ramo',
  imports: [OpcaoCardComponent],
  template: `
    <div class="etapa__cabecalho">
      <h1 id="titulo-ramo" class="etapa__titulo">Qual destes mais se parece com o seu negócio?</h1>
      <p class="etapa__descricao">
        Escolha o mais próximo, mesmo que não seja exato. Isso só ajusta as sugestões iniciais,
        e você pode cadastrar qualquer produto depois.
      </p>
    </div>

    <div class="etapa__lista-opcoes" role="radiogroup" aria-labelledby="titulo-ramo">
      @for (ramo of ramos; track ramo.valor) {
        <app-opcao-card
          [titulo]="ramo.rotulo"
          [descricao]="ramo.descricao"
          [selecionado]="controle().value === ramo.valor"
          (selecionar)="selecionar(ramo.valor)"
        />
      }
    </div>
  `,
  styleUrl: './etapa.css',
})
export class EtapaRamoComponent {
  readonly controle = input.required<ControleRamo>();

  protected readonly ramos = RAMOS_NEGOCIO;

  protected selecionar(ramo: RamoNegocio): void {
    this.controle().setValue(ramo);
  }
}
