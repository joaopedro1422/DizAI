import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
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
import { ConfigMensagensProntas } from '../agenda/mensagens-prontas/mensagens-prontas.component';
import { AcaoPedidoComponent } from './acao-pedido/acao-pedido.component';
import { NumerosPedidosComponent } from './numeros-pedidos/numeros-pedidos.component';
import { RegistrarPedidoComponent } from './registrar-pedido/registrar-pedido.component';
import { AcaoPedido, PedidoCardComponent } from './pedido-card/pedido-card.component';
import { AGRADECIMENTO_PADRAO, AVISO_PRONTO_PADRAO, SUGESTOES_PEDIDO, VARIAVEIS_PEDIDO, preencherAviso } from './textos-pedido';
import { EnvioAoVivoComponent, MensagemAoVivo } from './envio-ao-vivo/envio-ao-vivo.component';
import { MensagensPedidosComponent } from './mensagens-pedidos/mensagens-pedidos.component';
import { RestringirAgendaComponent } from './restringir-agenda/restringir-agenda.component';
import { SECOES_DOS_PEDIDOS, SecaoPedidos, infoDaSecaoDosPedidos } from './secoes-pedidos';
import { ID_PEDIDO_EXEMPLO, passosDoTourDosPedidos, pedidoDeExemplo } from './tour-pedidos';
import { MenuLateralComponent } from '../../shared/components/menu-lateral/menu-lateral.component';
import { DicaSobrepostaComponent } from '../../shared/components/dica-sobreposta/dica-sobreposta.component';
import { AlvoTourDirective } from '../painel/onboarding/alvo-tour.directive';
import { OnboardingTourComponent } from '../painel/onboarding/onboarding-tour.component';
import { OnboardingTourService } from '../painel/onboarding/onboarding-tour.service';
import { ConteudoRamoService } from '../../core/services/conteudo-ramo.service';
import { DicasVistasService } from '../../core/services/dicas-vistas.service';
import { PerfilService } from '../../core/services/perfil.service';

/** Pedido confirmado em outro aparelho (ex.: no celular) aparece no computador em até 15 s. */
const ATUALIZAR_A_CADA_MS = 15_000;
type FiltroPedidos = 'todos' | 'preparo' | 'prontos';

const TITULOS_ACAO: Record<AcaoPedido, string> = {
  pronto: 'Pedido pronto',
  entregue: 'Pedido entregue',
  cancelar: 'Cancelar pedido',
  valor: 'Valor do pedido',
};

@Component({
  selector: 'app-pedidos-page',
  imports: [
    RegistrarPedidoComponent,
    RouterLink,
    IconeComponent,
    CarregandoComponent,
    EstadoVazioComponent,
    BottomSheetComponent,
    PedidoCardComponent,
    AcaoPedidoComponent,
    NumerosPedidosComponent,
    MensagensPedidosComponent,
    RestringirAgendaComponent,
    MenuLateralComponent,
    EnvioAoVivoComponent,
    DicaSobrepostaComponent,
    OnboardingTourComponent,
    AlvoTourDirective,
    NgTemplateOutlet,
  ],
  // o tour dos pedidos guarda os próprios alvos (menu, pedido de exemplo, mensagem enviada)
  providers: [OnboardingTourService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pedidos-page.component.html',
  styleUrls: ['../../shared/estilos-tela-com-menu.css', './pedidos-page.component.css'],
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

  private readonly dicasVistas = inject(DicasVistasService);
  protected readonly exemplos = inject(ConteudoRamoService).exemplos;
  private readonly perfil = inject(PerfilService).perfil;
  protected readonly nomeLoja = computed(() => this.perfil().nomeLoja ?? '');

  /** Menu lateral: as páginas da tela (o grupo inteiro é o destaque de um passo do tour). */
  protected readonly grupos = [{ itens: SECOES_DOS_PEDIDOS, alvoTour: 'pedidos-secoes' as const }];
  protected readonly secao = signal<SecaoPedidos>('pedidos');
  protected readonly infoSecao = computed(() => infoDaSecaoDosPedidos(this.secao()));
  protected readonly menuAberto = signal(false);

  // ---------------------------------------------------------------- pedido de exemplo do tour (só na tela)
  protected readonly idExemplo = ID_PEDIDO_EXEMPLO;
  protected readonly exemplo = signal<Pedido | null>(null);
  /** A mensagem que acabou de "sair" para o cliente do exemplo (lista de uma, para a animação tocar de novo). */
  protected readonly envioAoVivo = signal<MensagemAoVivo[]>([]);
  protected readonly convidarTour = signal(false);
  private readonly tour = viewChild.required(OnboardingTourComponent);

  /** Os pedidos de verdade e, durante o tour, o de exemplo na frente. */
  protected readonly pedidosNaTela = computed(() => {
    const exemplo = this.exemplo();
    return exemplo ? [exemplo, ...this.pedidos()] : this.pedidos();
  });
  protected readonly emPreparoNaTela = computed(() => this.pedidosNaTela().filter((pedido) => pedido.status !== 'PRONTO'));
  protected readonly prontosNaTela = computed(() => this.pedidosNaTela().filter((pedido) => pedido.status === 'PRONTO'));

  protected readonly filtro = signal<FiltroPedidos>('todos');
  protected readonly pedidosFiltrados = computed(() => {
    switch (this.filtro()) {
      case 'preparo':
        return this.emPreparoNaTela();
      case 'prontos':
        return this.prontosNaTela();
      default:
        return this.pedidosNaTela();
    }
  });

  protected readonly acaoAberta = signal<{ pedido: Pedido; acao: AcaoPedido } | null>(null);
  protected readonly titulosAcao = TITULOS_ACAO;

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

  /** "Registrar pedido" aberto. */
  protected readonly registrando = signal(false);

  protected pedidoRegistrado(entregue: boolean): void {
    this.registrando.set(false);
    this.toastService.mostrar(entregue ? 'Pedido registrado como entregue' : 'Pedido registrado em preparo');
  }

  ngOnInit(): void {
    void limparMarcaIcone('pedido');
    this.pedidoService
      .abrir()
      .then(() => this.convidarTour.set(this.dicasVistas.deveMostrarVideo('tour-pedidos')))
      .catch((erro: unknown) => this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR)));
  }

  /** Página escolhida no menu: fecha a gaveta e volta ao topo. */
  protected irPara(secao: SecaoPedidos): void {
    this.secao.set(secao);
    this.menuAberto.set(false);
    window.scrollTo({ top: 0 });
  }

  // ---------------------------------------------------------------- tour dos pedidos

  protected comecarTour(): void {
    this.convidarTour.set(false);
    this.dicasVistas.marcarComoVista('tour-pedidos');
    this.filtro.set('todos');
    this.tour().iniciarCom(
      passosDoTourDosPedidos({
        abrirMenu: () => this.menuAberto.set(true),
        fecharMenu: () => this.menuAberto.set(false),
        irPara: (secao) => this.irPara(secao),
        mostrarExemplo: () => {
          if (!this.exemplo()) {
            this.envioAoVivo.set([]);
            this.exemplo.set(pedidoDeExemplo(this.exemplos()));
          }
        },
        esconderEnvio: () => this.envioAoVivo.set([]),
      }),
    );
  }

  protected dispensarTour(): void {
    this.convidarTour.set(false);
    this.dicasVistas.marcarComoVista('tour-pedidos');
  }

  /** Fim do tour (ou "Pular"): o exemplo some e a tela volta aos pedidos. */
  protected aoEncerrarTour(): void {
    this.exemplo.set(null);
    this.envioAoVivo.set([]);
    this.irPara('pedidos');
  }

  protected aoAcaoDoExemplo(acao: AcaoPedido): void {
    const exemplo = this.exemplo();
    if (!exemplo) {
      return;
    }
    const nome = exemplo.nomeCliente;
    if (acao === 'pronto' && exemplo.status !== 'PRONTO') {
      this.exemplo.set({ ...exemplo, status: 'PRONTO', prontoEm: new Date() });
      this.envioAoVivo.set([{ cliente: nome, texto: preencherAviso(AVISO_PRONTO_PADRAO, nome, exemplo.valor) }]);
    } else if (acao === 'entregue' && exemplo.status === 'PRONTO') {
      this.exemplo.set(null);
      this.envioAoVivo.set([{ cliente: nome, texto: preencherAviso(AGRADECIMENTO_PADRAO, nome, exemplo.valor) }]);
    } else {
      return;
    }
    // espera o cartão da mensagem entrar na tela antes de destacar
    setTimeout(() => this.tour().proximoPasso(), 450);
  }
}
