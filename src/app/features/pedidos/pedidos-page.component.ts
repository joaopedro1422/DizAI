import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../core/api/erro-api';
import { SessaoService } from '../../core/auth/sessao.service';
import { Pedido } from '../../core/models/pedido.model';
import { PedidoService } from '../../core/services/pedido.service';
import { chegouAlgoNovo, prepararSinalSonoro, tocarSinalNovo } from '../../core/utils/sinal-sonoro';
import { limparMarcaIcone } from '../../core/utils/marca-icone';
import { ToastService } from '../../core/services/toast.service';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { EstadoVazioComponent } from '../../shared/components/estado-vazio/estado-vazio.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import {
  ConfigMensagensProntas,
  MensagensProntasComponent,
} from '../agenda/mensagens-prontas/mensagens-prontas.component';
import { AcaoPedidoComponent } from './acao-pedido/acao-pedido.component';
import { NumerosPedidosComponent } from './numeros-pedidos/numeros-pedidos.component';
import { AcaoPedido, PedidoCardComponent } from './pedido-card/pedido-card.component';
import { SUGESTOES_PEDIDO, VARIAVEIS_PEDIDO } from './textos-pedido';

type AbaPedidos = 'andamento' | 'numeros';

/** Pedido confirmado em outro aparelho (ex.: no celular) aparece no computador em até 15 s. */
const ATUALIZAR_A_CADA_MS = 15_000;
type FiltroPedidos = 'todos' | 'preparo' | 'prontos';

const TITULOS_ACAO: Record<AcaoPedido, string> = {
  pronto: 'Pedido pronto',
  entregue: 'Pedido entregue',
  cancelar: 'Cancelar pedido',
  valor: 'Valor do pedido',
};

/**
 * Tela "Pedidos" (só lojas de produtos): os pedidos que o lojista confirmou no Chats, até serem entregues, e os
 * números (faturamento, entregues, valor médio). É um caderno de pedidos simples: o fluxo não é obrigatório, dá para
 * marcar como entregue direto, sem passar por "pronto".
 */
@Component({
  selector: 'app-pedidos-page',
  imports: [
    RouterLink,
    IconeComponent,
    CarregandoComponent,
    EstadoVazioComponent,
    BottomSheetComponent,
    PedidoCardComponent,
    AcaoPedidoComponent,
    NumerosPedidosComponent,
    MensagensProntasComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pedidos-page.component.html',
  styleUrls: ['../../shared/estilos-topo-azul.css', './pedidos-page.component.css'],
})
export class PedidosPageComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly toastService = inject(ToastService);
  private readonly rotas = inject(SessaoService).rotasDoPainel;

  protected readonly rotaInicio = computed(() => this.rotas().inicio);
  protected readonly rotaChats = computed(() => this.rotas().chats);
  protected readonly carregando = this.pedidoService.carregando;
  protected readonly pedidos = this.pedidoService.emAndamento;
  protected readonly emPreparo = this.pedidoService.emPreparo;
  protected readonly prontos = this.pedidoService.prontos;

  protected readonly aba = signal<AbaPedidos>('andamento');
  protected readonly filtro = signal<FiltroPedidos>('todos');
  protected readonly pedidosFiltrados = computed(() => {
    switch (this.filtro()) {
      case 'preparo':
        return this.emPreparo();
      case 'prontos':
        return this.prontos();
      default:
        return this.pedidos();
    }
  });

  protected readonly acaoAberta = signal<{ pedido: Pedido; acao: AcaoPedido } | null>(null);
  protected readonly titulosAcao = TITULOS_ACAO;
  protected readonly gerenciandoMensagens = signal(false);

  /** As mensagens prontas dos pedidos usam o mesmo gerenciador da agenda, com as variáveis do pedido. */
  protected readonly configMensagens: ConfigMensagensProntas = {
    mensagens: this.pedidoService.mensagensProntas,
    criar: (mensagem) => this.pedidoService.criarMensagemPronta(mensagem),
    atualizar: (id, mensagem) => this.pedidoService.atualizarMensagemPronta(id, mensagem),
    remover: (id) => this.pedidoService.removerMensagemPronta(id),
    variaveis: VARIAVEIS_PEDIDO,
    sugestoes: SUGESTOES_PEDIDO,
    explicacao:
      'Ao marcar um pedido como pronto ou entregue, você escolhe uma destas mensagens e ela vai pelo WhatsApp para o cliente.',
    exemploTitulo: 'Ex.: Saiu para entrega',
    exemploTexto: 'Ex.: Oi, {nome}! Seu pedido saiu para entrega e já já chega aí.',
    dicaVariaveis: 'Nome e valor são trocados pelos dados de cada pedido.',
  };

  /** Computador (mesmo corte do CSS): os pedidos viram um quadro com as colunas "Em preparo" e "Prontos". */
  private readonly consultaQuadro = window.matchMedia('(min-width: 1024px)');
  protected readonly quadro = signal(this.consultaQuadro.matches);

  constructor() {
    const aoMudarTela = (evento: MediaQueryListEvent) => this.quadro.set(evento.matches);
    this.consultaQuadro.addEventListener('change', aoMudarTela);
    // a tela pode ficar aberta o dia todo (cozinha): os pedidos confirmados no Chats aparecem sozinhos, com um
    // sinal sonoro quando chega um novo. Com a aba escondida não busca; ao voltar para ela, busca na hora.
    prepararSinalSonoro();
    const atualizar = async () => {
      if (document.hidden || this.pedidoService.carregando()) {
        return;
      }
      const antes = this.pedidoService.emAndamento();
      try {
        await this.pedidoService.atualizar();
      } catch {
        return;
      }
      if (chegouAlgoNovo(antes, this.pedidoService.emAndamento())) {
        tocarSinalNovo();
      }
    };
    const atualizacao = window.setInterval(atualizar, ATUALIZAR_A_CADA_MS);
    document.addEventListener('visibilitychange', atualizar);
    window.addEventListener('focus', atualizar);
    inject(DestroyRef).onDestroy(() => {
      this.consultaQuadro.removeEventListener('change', aoMudarTela);
      window.clearInterval(atualizacao);
      document.removeEventListener('visibilitychange', atualizar);
      window.removeEventListener('focus', atualizar);
    });
  }

  ngOnInit(): void {
    void limparMarcaIcone('pedido');
    this.pedidoService.abrir().catch((erro: unknown) => this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR)));
  }

  protected abrirMensagens(): void {
    this.gerenciandoMensagens.set(true);
    this.pedidoService.carregarMensagensProntas().catch((erro: unknown) =>
      this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR)),
    );
  }
}
