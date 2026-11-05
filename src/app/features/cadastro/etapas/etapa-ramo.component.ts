import { Component, computed, input, signal } from '@angular/core';

import { RAMOS_PARA_ESCOLHER } from '../../../core/constants/opcoes-perfil';
import { RamoNegocio } from '../../../core/models/perfil.model';
import { EtiquetaOpcao, OpcaoCardComponent } from '../../../shared/components/opcao-card/opcao-card.component';
import { ControleRamo } from '../cadastro-formulario';

const RAMOS_DO_TIPO: Record<string, RamoNegocio[]> = {
  produtos: ['DOCES_SALGADOS', 'PRODUTOS_PERSONALIZADOS'],
  servicos: ['SERVICOS_PRESENCIAIS', 'SERVICOS_PERSONALIZADOS'],
};

/** Passo 2: o ramo que mais se parece com o negócio (ajusta as sugestões iniciais do painel). */
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
      @for (ramo of ramos(); track ramo.valor) {
        <app-opcao-card
          [titulo]="ramo.rotulo"
          [descricao]="ramo.descricao"
          [etiqueta]="etiquetas[ramo.valor] ?? null"
          [selecionado]="controle().value === ramo.valor"
          (selecionar)="selecionar(ramo.valor)"
        />
      }
    </div>
    @if (filtrados()) {
      <button type="button" class="etapa__ver-todos" (click)="verTodos.set(true)">Meu negócio é de outro tipo</button>
    }
  `,
  styleUrl: './etapa.css',
})
export class EtapaRamoComponent {
  readonly controle = input.required<ControleRamo>();

  /** ?tipo= da landing: "produtos" ou "servicos" mostra só os ramos daquele tipo, com o link para ver todos. */
  readonly tipo = input<string | undefined>(undefined);
  protected readonly verTodos = signal(false);
  protected readonly filtrados = computed(() => !this.verTodos() && !!RAMOS_DO_TIPO[this.tipo() ?? '']);
  protected readonly ramos = computed(() => {
    const doTipo = RAMOS_DO_TIPO[this.tipo() ?? ''];
    return this.filtrados() && doTipo ? RAMOS_PARA_ESCOLHER.filter((ramo) => doTipo.includes(ramo.valor)) : RAMOS_PARA_ESCOLHER;
  });
  /** Recurso que vem junto com o ramo: a agenda nos serviços presenciais, os pedidos nos produtos. */
  protected readonly etiquetas: Partial<Record<RamoNegocio, EtiquetaOpcao>> = {
    SERVICOS_PRESENCIAIS: { texto: 'Agenda', icone: 'calendario' },
    DOCES_SALGADOS: { texto: 'Pedidos', icone: 'caixa' },
    PRODUTOS_PERSONALIZADOS: { texto: 'Pedidos', icone: 'caixa' },
  };

  protected selecionar(ramo: RamoNegocio): void {
    this.controle().setValue(ramo);
  }
}
