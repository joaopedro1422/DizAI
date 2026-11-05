import { Component, computed, input } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';

import { FORMAS_PAGAMENTO, FORMAS_RECEBIMENTO } from '../../../core/constants/opcoes-perfil';
import { alternarItem } from '../../../core/utils/colecao.utils';
import { antecedenciaEmMinutos, exemploAntecedencia } from '../../../core/utils/antecedencia';
import { campoComErro } from '../../../core/utils/validadores';
import { UnidadeAntecedencia } from '../../../core/models/perfil.model';
import { GrupoPagamentoEntrega } from '../cadastro-formulario';

@Component({
  selector: 'app-etapa-pagamento-entrega',
  imports: [ReactiveFormsModule],
  templateUrl: './etapa-pagamento-entrega.component.html',
  styleUrl: './etapa.css',
})
export class EtapaPagamentoEntregaComponent {
  readonly grupo = input.required<GrupoPagamentoEntrega>();
  /** Falso quando os campos são usados fora do cadastro (ex.: modal de dados da loja). */
  readonly exibirCabecalho = input(true);
  /** Antecedência mínima para pedidos: só nos ramos de produtos (nos serviços não aparece). */
  readonly exibirAntecedencia = input(true);

  protected readonly formasPagamento = FORMAS_PAGAMENTO;
  /** Nas lojas de produtos (as que têm antecedência), só Entrega e Retirada. */
  protected readonly formasRecebimento = computed(() =>
    this.exibirAntecedencia() ? FORMAS_RECEBIMENTO.filter((forma) => forma.valor !== 'ATENDIMENTO_LOCAL') : FORMAS_RECEBIMENTO,
  );

  protected temErro(controle: AbstractControl): boolean {
    return campoComErro(controle);
  }

  protected ofereceEntrega(): boolean {
    return this.grupo().controls.formasRecebimento.value.includes('ENTREGA');
  }

  /** Marca ou desmarca um item em um controle de lista (chips de múltipla escolha). */
  protected alternar<T>(controle: FormControl<T[]>, valor: T): void {
    controle.setValue(alternarItem(controle.value, valor));
    controle.markAsTouched();
  }

  /** O que o assistente vai dizer com esta antecedência (a mesma conta do backend, com a folga dos prazos longos). */
  protected exemplo(valor: number | null, unidade: UnidadeAntecedencia): string {
    return exemploAntecedencia(antecedenciaEmMinutos(valor ?? 0, unidade));
  }
}
