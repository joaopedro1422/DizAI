import { Component, input } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';

import { FORMAS_PAGAMENTO, FORMAS_RECEBIMENTO, PRAZOS_MINIMOS } from '../../../core/constants/opcoes-perfil';
import { PrazoMinimo } from '../../../core/models/perfil.model';
import { alternarItem } from '../../../core/utils/colecao.utils';
import { campoComErro } from '../../../core/utils/validadores';
import { GrupoPagamentoEntrega } from '../cadastro-formulario';

/**
 * Formas de pagamento, como o cliente recebe e antecedência mínima.
 * Saiu do cadastro e hoje é preenchido no modal "Dados da loja" do painel.
 */
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

  protected readonly formasPagamento = FORMAS_PAGAMENTO;
  protected readonly formasRecebimento = FORMAS_RECEBIMENTO;
  protected readonly prazos = PRAZOS_MINIMOS;

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

  protected escolherPrazo(prazo: PrazoMinimo): void {
    this.grupo().controls.prazoMinimo.setValue(prazo);
  }
}
