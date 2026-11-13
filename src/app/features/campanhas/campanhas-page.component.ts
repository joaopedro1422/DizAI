import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { mensagemDoErro } from '../../core/api/erro-api';
import { SessaoService } from '../../core/auth/sessao.service';
import {
  ContatoFeito,
  ContatoSugerido,
  ICONE_DO_TIPO,
  Individuais,
  Oportunidade,
  ResultadoCampanha,
  ResumoCampanha,
  SituacaoCampanhas,
  TipoCampanha,
  TipoDisponivel,
} from '../../core/models/campanha.model';
import { CampanhaService } from '../../core/services/campanha.service';
import { ToastService } from '../../core/services/toast.service';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { ContatoIndividualComponent } from './contato-individual/contato-individual.component';
import { EscolherTipoComponent } from './escolher-tipo/escolher-tipo.component';
import { NovaCampanhaComponent } from './nova-campanha/nova-campanha.component';
import { ResultadoCampanhaComponent } from './resultado-campanha/resultado-campanha.component';

/** O que está aberto por cima da tela: a nova campanha (de um tipo ou de uma oportunidade) ou um relatório. */
interface Abrindo {
  tipo: TipoCampanha;
  oportunidade: Oportunidade | null;
}

/**
 * Campanhas de WhatsApp: as oportunidades que o DizAI encontrou, os tipos para criar e o histórico com o resultado
 * de cada uma. Loja sem clientes suficientes vê o que falta para liberar (as campanhas crescem com o cadastro).
 */
@Component({
  selector: 'app-campanhas-page',
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    IconeComponent,
    CarregandoComponent,
    BottomSheetComponent,
    NovaCampanhaComponent,
    ResultadoCampanhaComponent,
    ContatoIndividualComponent,
    EscolherTipoComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './campanhas-page.component.html',
  styleUrls: ['../../shared/estilos-topo-azul.css', './campanhas-page.component.css'],
})
export class CampanhasPageComponent implements OnInit {
  private readonly campanhaService = inject(CampanhaService);
  private readonly toast = inject(ToastService);
  private readonly rota = inject(ActivatedRoute);
  protected readonly rotas = inject(SessaoService).rotasDoPainel;

  protected readonly carregando = signal(true);
  protected readonly situacao = signal<SituacaoCampanhas | null>(null);
  protected readonly oportunidades = signal<Oportunidade[]>([]);
  protected readonly historico = signal<ResumoCampanha[]>([]);
  /** Clientes para chamar uma a uma (mensagem pronta, sem custo) e os contatos feitos nos últimos 30 dias. */
  protected readonly contatos = signal<ContatoSugerido[]>([]);
  protected readonly contatosFeitos = signal<ContatoFeito[]>([]);
  protected readonly abrindo = signal<Abrindo | null>(null);
  /** O modal "Nova campanha" com os tipos. */
  protected readonly escolhendoTipo = signal(false);
  protected readonly relatorio = signal<ResultadoCampanha | null>(null);
  protected readonly carregandoRelatorio = signal(false);
  protected readonly icones = ICONE_DO_TIPO;
  protected readonly demonstracao = this.campanhaService.demonstracao;

  protected readonly progresso = computed(() => {
    const s = this.situacao();
    return s ? Math.min(100, Math.round((s.aptos / s.minimo) * 100)) : 0;
  });
  /**
   * Nada impede montar a campanha: sem o WhatsApp conectado (ou ainda sem clientes), o lojista escolhe tudo e vê como
   * ela fica; só o "Enviar" do último passo fica travado (NovaCampanhaComponent.bloqueioDoEnvio).
   */
  protected readonly bloqueioDaCriacao = computed<string | null>(() => null);
  protected readonly faturamentoTotal = computed(() => this.historico().reduce((soma, c) => soma + c.faturamento, 0));
  protected readonly convertidosTotal = computed(() => this.historico().reduce((soma, c) => soma + c.converteram, 0));

  ngOnInit(): void {
    this.campanhaService.lerDemonstracao(this.rota.snapshot.queryParamMap.get('demonstracao'));
    void this.carregar();
  }

  protected sairDaDemonstracao(): void {
    this.campanhaService.sairDaDemonstracao();
    void this.carregar();
  }

  private async carregar(): Promise<void> {
    this.carregando.set(true);
    try {
      const [situacao, oportunidades, historico, individuais] = await Promise.all([
        this.campanhaService.situacao(),
        this.campanhaService.oportunidades().catch(() => [] as Oportunidade[]),
        this.campanhaService.historico().catch(() => [] as ResumoCampanha[]),
        this.campanhaService.individuais().catch((): Individuais => ({ sugeridos: [], recentes: [] })),
      ]);
      this.situacao.set(situacao);
      this.contatos.set(individuais.sugeridos);
      this.contatosFeitos.set(individuais.recentes);
      this.oportunidades.set(oportunidades);
      this.historico.set(historico);
      this.abrirPelaRota(oportunidades);
    } catch (erro) {
      this.toast.mostrar(mensagemDoErro(erro, 'Não foi possível abrir as campanhas. Tente de novo.'));
    } finally {
      this.carregando.set(false);
    }
  }

  /** Vindo do card do painel (?oportunidade=chave) ou do resumo (?campanha=id). */
  private abrirPelaRota(oportunidades: Oportunidade[]): void {
    const parametros = this.rota.snapshot.queryParamMap;
    const chave = parametros.get('oportunidade');
    const oportunidade = chave ? oportunidades.find((o) => o.chave === chave) : null;
    if (oportunidade) this.abrirOportunidade(oportunidade);
    const campanha = parametros.get('campanha');
    if (campanha) void this.abrirRelatorio(campanha);
  }

  protected podeCriar(tipo: TipoDisponivel): boolean {
    const s = this.situacao();
    return !!s && tipo.disponivel;
  }

  protected criar(tipo: TipoDisponivel): void {
    if (!this.podeCriar(tipo)) return;
    this.escolhendoTipo.set(false);
    this.abrindo.set({ tipo: tipo.tipo, oportunidade: null });
  }

  protected abrirOportunidade(oportunidade: Oportunidade): void {
    this.abrindo.set({ tipo: oportunidade.tipo, oportunidade });
  }

  protected async dispensar(oportunidade: Oportunidade): Promise<void> {
    this.oportunidades.update((lista) => lista.filter((o) => o.chave !== oportunidade.chave));
    await this.campanhaService.dispensar(oportunidade.chave).catch(() => undefined);
  }

  protected async aoEnviar(resumo: ResumoCampanha): Promise<void> {
    this.abrindo.set(null);
    this.toast.mostrar(
      this.demonstracao()
        ? 'Demonstração: nada foi enviado. Numa campanha de verdade, as mensagens começam a sair agora.'
        : `Campanha a caminho de ${resumo.enviadas} ${resumo.enviadas === 1 ? 'cliente' : 'clientes'}. O resultado aparece aqui.`,
    );
    await this.carregar();
  }

  protected async abrirRelatorio(id: string): Promise<void> {
    this.carregandoRelatorio.set(true);
    try {
      this.relatorio.set(await this.campanhaService.detalhe(id));
    } catch (erro) {
      this.toast.mostrar(mensagemDoErro(erro, 'Não foi possível abrir o resultado.'));
    } finally {
      this.carregandoRelatorio.set(false);
    }
  }

  /** Chamou ou dispensou: sai da lista (a chamada entra em "Quem você chamou" quando a tela abrir de novo). */
  protected tirarContato(contato: ContatoSugerido): void {
    this.contatos.update((lista) => lista.filter((c) => c.id !== contato.id));
  }

  protected async jaCadastrei(): Promise<void> {
    await this.campanhaService.pagamentoResolvido().catch(() => undefined);
    this.situacao.update((s) => (s ? { ...s, pagamentoPendente: false } : s));
    this.toast.mostrar('Pronto! As próximas mensagens tentam de novo.');
  }

  protected rotuloPeriodo(c: ResumoCampanha): string {
    if (c.status === 'ENVIANDO') return 'Enviando…';
    return c.medindo ? 'Medindo o resultado' : 'Concluída';
  }
}
