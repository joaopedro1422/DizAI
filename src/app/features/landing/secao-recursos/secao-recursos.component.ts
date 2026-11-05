import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, linkedSignal, signal } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { FechamentoRecursosComponent } from './fechamento-recursos.component';

export type TipoNegocio = 'produtos' | 'servicos';

/** O que cada tipo ganha, em checks verdes logo abaixo das abas (como no hero). */
const DESTAQUES: Record<TipoNegocio, string[]> = {
  produtos: [
    'Faz a triagem e mantém o cliente por perto, até fora do horário',
    'Faz orçamentos e coleta os dados do pedido',
    'Você confirma cada pedido e combina o pagamento',
    'Pedidos organizados numa tela própria, do confirmado ao entregue',
    'Ganhe uma página de portfólio',
  ],
  servicos: [
    'Informa os horários livres da sua agenda',
    'Marca, remarca e cancela agendamentos',
    'Aceita vários profissionais',
    'Lembra, confirma a presença e agradece depois do atendimento',
    'Mensagens personalizadas por você',
  ],
};

/** Gerenciador de pedidos: cada etapa tem a sua mensagem pronta para o cliente. */
const ETAPAS_PEDIDO = [
  { status: 'Confirmado', mensagem: 'Oi, Ana! Seu pedido foi confirmado 😊 Fica pronto sábado às 15h.' },
  { status: 'Pronto', mensagem: 'Ana, seu pedido está pronto para retirada! Total: R$ 135,00' },
  { status: 'Entregue', mensagem: 'Obrigada pela preferência, Ana! Volte sempre 💛' },
];

/** Faturamento da semana de exemplo (altura das barras em %, mesmo desenho dos Números do painel). */
const BARRAS_PEDIDOS = [
  { dia: 'Seg', valor: 38 }, { dia: 'Ter', valor: 30 }, { dia: 'Qua', valor: 52 }, { dia: 'Qui', valor: 46 },
  { dia: 'Sex', valor: 74 }, { dia: 'Sáb', valor: 100 }, { dia: 'Dom', valor: 22 },
];

/** "Faturamento por serviço" em barra 100% (as cores são as --serie-1..4 validadas para daltonismo). */
const FATIAS_SERVICOS = [
  { nome: 'Esmaltação em gel', parte: 42, cor: 'var(--serie-1)' },
  { nome: 'Manicure', parte: 27, cor: 'var(--serie-2)' },
  { nome: 'Pedicure', parte: 19, cor: 'var(--serie-3)' },
  { nome: 'Sobrancelha', parte: 12, cor: 'var(--serie-4)' },
];

/** Agenda de um dia com 3 profissionais: início e duração em "meias horas" a partir das 9h. */
const AGENDA_PROFISSIONAIS = [
  { nome: 'Lucas', blocos: [{ inicio: 0, tamanho: 2, rotulo: 'Corte' }, { inicio: 3, tamanho: 3, rotulo: 'Corte + barba' }] },
  { nome: 'Luis', blocos: [{ inicio: 1, tamanho: 2, rotulo: 'Barba' }, { inicio: 4, tamanho: 2, rotulo: 'Corte' }] },
  { nome: 'Sergio', blocos: [{ inicio: 0, tamanho: 3, rotulo: 'Luzes' }, { inicio: 5, tamanho: 1, rotulo: 'Pezinho' }] },
];

const HORARIOS_LIVRES = ['09:00', '09:30', '10:30', '14:00', '15:30', '17:00'];

const TEMPO_POR_ETAPA_MS = 2800;

@Component({
  selector: 'app-secao-recursos',
  imports: [IconeComponent, FechamentoRecursosComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secao-recursos.component.html',
  styleUrls: ['./secao-recursos.component.css', './ilustracoes-recursos.css'],
})
export class SecaoRecursosComponent {
  /** Landing de um tipo: fixo, sem as abas. Sem ele, as abas Produtos | Serviços. */
  readonly tipoFixo = input<TipoNegocio | null>(null, { alias: 'tipo' });
  protected readonly tipo = linkedSignal<TipoNegocio>(() => this.tipoFixo() ?? 'produtos');
  protected readonly descricao = computed(() => {
    switch (this.tipoFixo()) {
      case 'produtos':
        return 'Feito para quem vende por encomenda: do orçamento ao pedido entregue, com você no controle.';
      case 'servicos':
        return 'Feito para quem atende com hora marcada: da agenda cheia ao cliente que volta.';
      default:
        return 'Escolha o seu tipo de negócio e veja o que temos especialmente para você.';
    }
  });
  protected readonly destaques = computed(() => DESTAQUES[this.tipo()]);

  protected readonly etapasPedido = ETAPAS_PEDIDO;
  protected readonly barrasPedidos = BARRAS_PEDIDOS;
  protected readonly fatiasServicos = FATIAS_SERVICOS;
  protected readonly agendaProfissionais = AGENDA_PROFISSIONAIS;
  protected readonly horariosLivres = HORARIOS_LIVRES;
  protected readonly horasDaGrade = ['9h', '10h', '11h'];

  /** Etapa do pedido em destaque no gerenciador (troca sozinha). */
  protected readonly etapaAtual = signal(0);

  constructor() {
    const temporizador = setInterval(
      () => this.etapaAtual.update((etapa) => (etapa + 1) % ETAPAS_PEDIDO.length),
      TEMPO_POR_ETAPA_MS,
    );
    inject(DestroyRef).onDestroy(() => clearInterval(temporizador));
  }

  protected escolherTipo(tipo: TipoNegocio): void {
    this.tipo.set(tipo);
  }
}
