import { ChangeDetectionStrategy, Component, computed, effect, inject, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SessaoService } from '../../../core/auth/sessao.service';
import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { ramoDeServico, ramoUsaAgenda } from '../../../core/models/perfil.model';
import { AgendaService } from '../../../core/services/agenda.service';
import { EstatisticasService } from '../../../core/services/estatisticas.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { ContatoIgnoradoService } from '../../../core/services/contato-ignorado.service';
import { GaleriaService } from '../../../core/services/galeria.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { PerguntaFrequenteService } from '../../../core/services/pergunta-frequente.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { pluralizar } from '../../../core/utils/colecao.utils';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { AlvoTourDirective } from '../onboarding/alvo-tour.directive';

/** Cabem duas fotos e o "+N" no canto do card quadrado. */
const MINIATURAS_GALERIA = 2;

/**
 * Cards de navegação do painel ("Seu negócio"): Agenda (serviços) ou Pedidos (produtos), Produtos, Perguntas,
 * Galeria e Contatos a ignorar.
 */
@Component({
  selector: 'app-atalhos-secoes',
  imports: [RouterLink, IconeComponent, AlvoTourDirective, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './atalhos-secoes.component.html',
  styleUrl: './atalhos-secoes.component.css',
})
export class AtalhosSecoesComponent {
  private readonly produtoService = inject(ProdutoService);
  private readonly perguntaService = inject(PerguntaFrequenteService);
  private readonly galeriaService = inject(GaleriaService);
  private readonly contatoIgnoradoService = inject(ContatoIgnoradoService);

  protected readonly rotas = inject(SessaoService).rotasDoPainel;

  /** Só as contas de DIZAI_ADMIN_NUMEROS veem o atalho do gerenciamento. */
  private readonly perfil = inject(PerfilService).perfil;
  protected readonly ehAdmin = computed(() => this.perfil().admin === true);

  private readonly agendaService = inject(AgendaService);
  private readonly estatisticasService = inject(EstatisticasService);
  /** Perguntas que o assistente não soube responder, esperando o lojista virar pergunta frequente. */
  protected readonly perguntasParaResponder = computed(() => this.estatisticasService.perguntasSemResposta().length);
  /** O card da agenda só existe nos ramos com agenda (serviços presenciais). */
  protected readonly usaAgenda = computed(() => ramoUsaAgenda(this.perfil().ramo));
  protected readonly agendaAtiva = computed(() => this.perfil().agendaAtiva === true);
  /** A agenda ativa é o modo "Agendamento automático": o assistente marca sozinho. */
  protected readonly estadoAgenda = computed(() => (this.agendaAtiva() ? 'Automática' : 'Desligada'));

  protected readonly resumoAgenda = computed(() => {
    if (!this.agendaAtiva()) {
      return 'Agendamento automático pelo WhatsApp';
    }
    const hoje = this.agendaService.confirmadosHoje().length;
    return hoje === 0 ? 'Nenhum horário hoje' : `${pluralizar(hoje, 'horário', 'horários')} hoje`;
  });

  /** O próximo horário de hoje que ainda não passou. */
  protected readonly proximoHorario = computed(() => {
    const agora = new Date();
    const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
    return this.agendaService.confirmadosHoje().find((a) => a.fim > horaAtual) ?? null;
  });

  private readonly pedidoService = inject(PedidoService);
  /** Lojas de produtos têm a tela de pedidos (os serviços têm a agenda), no mesmo lugar do card da agenda. */
  protected readonly usaPedidos = computed(() => !ramoDeServico(this.perfil().ramo));
  protected readonly prontos = computed(() => this.pedidoService.prontos().length);
  protected readonly resumoPedidos = computed(() => {
    const total = this.pedidoService.emAndamento().length;
    return total === 0 ? 'Nenhum pedido em andamento' : `${pluralizar(total, 'pedido', 'pedidos')} em andamento`;
  });
  /** O pedido mais antigo em andamento: é o próximo a sair. */
  protected readonly proximoPedido = computed(() => this.pedidoService.emAndamento()[0] ?? null);

  protected descricaoPedido(resumo: { campo: string; valor: string }[]): string {
    return resumo.find((item) => item.campo.trim().toLowerCase().startsWith('item'))?.valor ?? '';
  }

  constructor() {
    this.estatisticasService.carregarPerguntasSemResposta().catch(() => undefined);
    effect(() => {
      if (this.usaPedidos()) {
        untracked(() => this.pedidoService.carregar().catch(() => undefined));
      }
    });
    // carrega os horários de hoje só para quem tem agenda (falhar aqui não atrapalha o painel)
    effect(() => {
      if (this.usaAgenda()) {
        untracked(() => this.agendaService.carregarAgendamentos().catch(() => undefined));
      }
    });
  }

  protected readonly resumoProdutos = computed(() => {
    const total = this.produtoService.produtos().length;
    return total === 0 ? 'Nenhum ainda' : pluralizar(total, 'cadastrado', 'cadastrados');
  });

  protected readonly resumoPerguntas = computed(() => {
    const total = this.perguntaService.perguntas().length;
    return total === 0 ? 'Nenhuma ainda' : pluralizar(total, 'pergunta', 'perguntas');
  });

  protected readonly resumoContatosIgnorados = computed(() => {
    const total = this.contatoIgnoradoService.contatos().length;
    return total === 0 ? 'Nenhum ainda' : pluralizar(total, 'contato', 'contatos');
  });

  protected readonly resumoGaleria = computed(() => {
    const albuns = this.galeriaService.albuns().length;
    if (albuns === 0) {
      return 'Nenhum álbum';
    }
    return pluralizar(this.galeriaService.totalFotos(), 'foto', 'fotos');
  });

  protected readonly miniaturasGaleria = computed(() =>
    this.galeriaService
      .albuns()
      .flatMap((album) => album.fotos)
      .slice(0, MINIATURAS_GALERIA),
  );

  protected readonly fotosRestantes = computed(() =>
    Math.max(0, this.galeriaService.totalFotos() - MINIATURAS_GALERIA),
  );
}
