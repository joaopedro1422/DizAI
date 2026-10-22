import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { mensagemDoErro } from '../../core/api/erro-api';
import { SessaoService } from '../../core/auth/sessao.service';
import { Estatisticas } from '../../core/models/estatisticas.model';
import { EstatisticasService } from '../../core/services/estatisticas.service';
import { ToastService } from '../../core/services/toast.service';
import { CabecalhoPaginaComponent } from '../../shared/components/cabecalho-pagina/cabecalho-pagina.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { NomeIcone } from '../../shared/components/icone/icones';

const PERIODOS = [
  { dias: 7, rotulo: '7 dias' },
  { dias: 30, rotulo: '30 dias' },
  { dias: 90, rotulo: '90 dias' },
];

interface Indicador {
  icone: NomeIcone;
  tom: 'azul' | 'verde' | 'ambar' | 'rosa';
  valor: number;
  rotulo: string;
  detalhe: string;
}

/**
 * "Estatísticas" (menu de 3 pontinhos do perfil): o que o assistente fez no período e quanto tempo
 * o lojista deixou de passar respondendo. Fica fora do painel para não poluir a configuração.
 */
@Component({
  selector: 'app-estatisticas-page',
  imports: [RouterLink, CabecalhoPaginaComponent, CarregandoComponent, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './estatisticas-page.component.html',
  styleUrl: './estatisticas-page.component.css',
})
export class EstatisticasPageComponent implements OnInit {
  private readonly estatisticasService = inject(EstatisticasService);
  private readonly toastService = inject(ToastService);
  private readonly rotas = inject(SessaoService).rotasDoPainel;

  protected readonly periodos = PERIODOS;
  protected readonly dias = signal(30);
  protected readonly carregando = signal(true);
  protected readonly numeros = signal<Estatisticas | null>(null);
  protected readonly rotaPerguntas = computed(() => this.rotas().perguntas);

  /** "6h 20min", "45 min" ou "0 min". */
  protected readonly tempoEconomizado = computed(() => {
    const minutos = this.numeros()?.minutosEconomizados ?? 0;
    if (minutos < 60) {
      return { valor: String(minutos), unidade: 'min' };
    }
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;
    return { valor: resto === 0 ? `${horas}h` : `${horas}h ${resto}`, unidade: resto === 0 ? '' : 'min' };
  });

  /** Média por dia: "12 min" ou "1h 5min". */
  protected readonly mediaPorDia = computed(() => {
    const minutos = this.numeros()?.minutosPorDia ?? 0;
    if (minutos < 60) {
      return `${minutos} min`;
    }
    const resto = minutos % 60;
    return resto === 0 ? `${Math.floor(minutos / 60)}h` : `${Math.floor(minutos / 60)}h ${resto}min`;
  });

  /** Há quanto tempo a conta existe: "12 dias" / "de utilização" (no dia em que foi criada, "1º dia"). */
  protected readonly idadeDaConta = computed(() => {
    const dias = this.numeros()?.diasDeConta;
    if (dias === null || dias === undefined) {
      return null;
    }
    if (dias === 0) {
      return { valor: '1º dia', texto: 'de utilização' };
    }
    let valor: string;
    if (dias < 60) {
      valor = `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
    } else if (dias < 365) {
      valor = `${Math.floor(dias / 30)} meses`;
    } else {
      const anos = Math.floor(dias / 365);
      valor = `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    }
    return { valor, texto: 'de utilização' };
  });

  protected readonly indicadores = computed<Indicador[]>(() => {
    const n = this.numeros();
    if (!n) {
      return [];
    }
    const fechamento: Indicador =
      n.agendamentos !== null
        ? { icone: 'calendario', tom: 'verde', valor: n.agendamentos, rotulo: 'Agendamentos', detalhe: 'marcados pelo assistente' }
        : {
            icone: 'caixa',
            tom: 'verde',
            valor: n.pedidosEncaminhados,
            rotulo: n.servico ? 'Atendimentos fechados' : 'Pedidos',
            detalhe: 'prontos para você fechar',
          };
    return [
      { icone: 'conversa', tom: 'azul', valor: n.atendimentos, rotulo: 'Atendimentos', detalhe: 'clientes atendidos' },
      fechamento,
      { icone: 'checkDuplo', tom: 'ambar', valor: n.respostasDoAssistente, rotulo: 'Respostas', detalhe: 'enviadas por ele' },
      { icone: 'pergunta', tom: 'rosa', valor: n.perguntasSemResposta, rotulo: 'Sem resposta', detalhe: 'passadas para você' },
    ];
  });

  protected readonly vazio = computed(() => this.numeros()?.atendimentos === 0);

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

  private async carregar(): Promise<void> {
    this.carregando.set(true);
    try {
      this.numeros.set(await this.estatisticasService.buscar(this.dias()));
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível carregar as estatísticas. Tente de novo.'));
    } finally {
      this.carregando.set(false);
    }
  }
}
