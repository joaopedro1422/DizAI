import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../../core/api/erro-api';
import { NumerosPedidos } from '../../../core/models/pedido.model';
import { PedidoService } from '../../../core/services/pedido.service';
import { ToastService } from '../../../core/services/toast.service';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { EstadoVazioComponent } from '../../../shared/components/estado-vazio/estado-vazio.component';
import { formatarReal } from '../textos-pedido';

const PERIODOS = [
  { dias: 7, rotulo: '7 dias' },
  { dias: 30, rotulo: '30 dias' },
  { dias: 90, rotulo: '90 dias' },
];

const DATA_CURTA = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

/**
 * Aba "Números" da tela de pedidos: faturamento (soma dos entregues), quantos foram entregues e o valor médio no
 * período, o que está em andamento agora e a lista dos entregues. Pedidos de teste não contam.
 */
@Component({
  selector: 'app-numeros-pedidos',
  imports: [CarregandoComponent, EstadoVazioComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './numeros-pedidos.component.html',
  styleUrl: './numeros-pedidos.component.css',
})
export class NumerosPedidosComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly toastService = inject(ToastService);

  protected readonly periodos = PERIODOS;
  protected readonly dias = signal(30);
  protected readonly numeros = signal<NumerosPedidos | null>(null);
  protected readonly carregando = signal(true);

  ngOnInit(): void {
    void this.carregar();
  }

  protected escolherPeriodo(dias: number): void {
    if (dias === this.dias()) {
      return;
    }
    this.dias.set(dias);
    void this.carregar();
  }

  protected real(valor: number): string {
    return formatarReal(valor);
  }

  protected data(data: Date | null): string {
    return data ? DATA_CURTA.format(data) : '';
  }

  /** "150 mini salgados: 50 coxinha…" (o primeiro item do resumo, para reconhecer o pedido na lista). */
  protected descricao(resumo: { campo: string; valor: string }[]): string {
    return resumo.find((item) => item.campo.trim().toLowerCase().startsWith('item'))?.valor ?? '';
  }

  private async carregar(): Promise<void> {
    this.carregando.set(true);
    try {
      this.numeros.set(await this.pedidoService.numeros(this.dias()));
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR));
    } finally {
      this.carregando.set(false);
    }
  }
}
