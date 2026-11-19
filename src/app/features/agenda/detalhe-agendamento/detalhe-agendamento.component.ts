import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { Agendamento } from '../../../core/models/agenda.model';
import { diaPorExtenso, formatarDuracao } from '../../../core/utils/datas-agenda';
import { gerarLinkWhatsapp } from '../../../core/utils/texto.utils';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { formatarReal } from '../../pedidos/textos-pedido';

/** O conteúdo do modal aberto ao tocar num card da agenda. */
@Component({
  selector: 'app-detalhe-agendamento',
  imports: [IconeComponent, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './detalhe-agendamento.component.html',
  styleUrl: './detalhe-agendamento.component.css',
})
export class DetalheAgendamentoComponent {
  readonly agendamento = input.required<Agendamento>();
  readonly variosProfissionais = input(false);

  readonly editarValor = output<void>();
  readonly cancelar = output<void>();
  /** "Confirmar presença" manual (o cliente avisou que vem por ligação, pessoalmente...). */
  readonly confirmarPresenca = output<void>();
  /** Enquanto a confirmação vai ao servidor. */
  readonly confirmando = input(false);

  protected readonly linkWhatsapp = computed(() => gerarLinkWhatsapp(this.agendamento().whatsapp));
  protected readonly duracao = computed(() => formatarDuracao(this.agendamento().duracaoMinutos));
  protected readonly dia = computed(() => {
    const texto = diaPorExtenso(this.agendamento().data);
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  });
  protected readonly valor = computed(() => {
    const valor = this.agendamento().valor;
    return valor === null ? 'Sem valor' : formatarReal(Number(valor));
  });
  protected readonly agendadoEm = computed(() => {
    const data = new Date(this.agendamento().criadoEm);
    const dia = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${dia} às ${hora}`;
  });

  protected precoDoProduto(preco: number | null, aPartirDe: boolean): string {
    return preco === null ? '' : (aPartirDe ? 'a partir de ' : '') + formatarReal(Number(preco));
  }
}
