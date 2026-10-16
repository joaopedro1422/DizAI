import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../core/api/erro-api';
import { NovaPerguntaFrequente } from '../../core/models/pergunta-frequente.model';
import { PerguntaSemResposta } from '../../core/models/estatisticas.model';
import { ConteudoRamoService } from '../../core/services/conteudo-ramo.service';
import { EstatisticasService } from '../../core/services/estatisticas.service';
import { PerguntaFrequenteService } from '../../core/services/pergunta-frequente.service';
import { ToastService } from '../../core/services/toast.service';
import { pluralizar } from '../../core/utils/colecao.utils';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { CabecalhoPaginaComponent } from '../../shared/components/cabecalho-pagina/cabecalho-pagina.component';
import { EstadoVazioComponent } from '../../shared/components/estado-vazio/estado-vazio.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { IdeiaRamo, IdeiasRamoComponent } from '../../shared/components/ideias-ramo/ideias-ramo.component';
import { PerguntaFormularioComponent } from './pergunta-formulario/pergunta-formulario.component';

@Component({
  selector: 'app-perguntas-page',
  imports: [
    CabecalhoPaginaComponent,
    IconeComponent,
    BottomSheetComponent,
    EstadoVazioComponent,
    PerguntaFormularioComponent,
    IdeiasRamoComponent,
    CarregandoComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './perguntas-page.component.html',
  styleUrls: ['../../shared/estilos-listagem.css', './perguntas-page.component.css'],
})
export class PerguntasPageComponent implements OnInit {
  private readonly perguntaService = inject(PerguntaFrequenteService);
  private readonly toastService = inject(ToastService);

  protected readonly perguntas = this.perguntaService.perguntas;
  protected readonly modalAberto = signal(false);
  protected readonly salvando = signal(false);
  protected readonly carregando = this.perguntaService.carregando;
  protected readonly modeloEscolhido = signal<NovaPerguntaFrequente | null>(null);

  private readonly estatisticasService = inject(EstatisticasService);
  /** O que os clientes perguntaram e o assistente não soube responder: vira pergunta frequente com um toque. */
  protected readonly semResposta = this.estatisticasService.perguntasSemResposta;
  /** Sugestão sendo respondida agora (sai da lista quando a pergunta frequente é salva). */
  private readonly respondendo = signal<PerguntaSemResposta | null>(null);
  protected readonly descartando = signal<string | null>(null);

  private readonly conteudo = inject(ConteudoRamoService).conteudo;

  /** Perguntas comuns no ramo da loja que ainda não foram cadastradas. */
  private readonly sugestoesDisponiveis = computed(() => {
    const cadastradas = new Set(this.perguntas().map((item) => item.pergunta.toLowerCase()));
    return this.conteudo().perguntasSugeridas.filter((sugestao) => !cadastradas.has(sugestao.pergunta.toLowerCase()));
  });

  protected readonly ideiasPerguntas = computed<IdeiaRamo[]>(() =>
    this.sugestoesDisponiveis().map((sugestao) => ({ titulo: sugestao.pergunta, texto: sugestao.resposta })),
  );

  protected readonly subtitulo = computed(() => {
    const total = this.perguntas().length;
    const quantidade = total === 0 ? 'Nenhuma pergunta ainda' : pluralizar(total, 'pergunta', 'perguntas');
    return `${quantidade}. O assistente usa estas respostas quando o cliente perguntar algo parecido.`;
  });

  ngOnInit(): void {
    this.perguntaService
      .carregar()
      .catch((erro: unknown) => this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR)));
    // as sugestões são um extra: se falharem, a tela continua normal
    this.estatisticasService.carregarPerguntasSemResposta().catch(() => undefined);
  }

  protected abrirModal(): void {
    this.respondendo.set(null);
    this.modeloEscolhido.set(null);
    this.modalAberto.set(true);
  }

  /** Abre o formulário com a pergunta do cliente; falta só escrever a resposta. */
  protected responder(sugestao: PerguntaSemResposta): void {
    this.respondendo.set(sugestao);
    this.modeloEscolhido.set({ pergunta: sugestao.pergunta, resposta: '' });
    this.modalAberto.set(true);
  }

  protected async descartar(sugestao: PerguntaSemResposta): Promise<void> {
    this.descartando.set(sugestao.id);
    try {
      await this.estatisticasService.resolverPerguntaSemResposta(sugestao.id);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível descartar. Tente de novo.'));
    } finally {
      this.descartando.set(null);
    }
  }

  protected usarIdeia(indice: number): void {
    this.respondendo.set(null);
    this.modeloEscolhido.set(this.sugestoesDisponiveis()[indice] ?? null);
    this.modalAberto.set(true);
  }

  protected fecharModal(): void {
    this.modalAberto.set(false);
  }

  protected async adicionarPergunta(novaPergunta: NovaPerguntaFrequente): Promise<void> {
    this.salvando.set(true);
    try {
      await this.perguntaService.adicionar(novaPergunta);
      const sugestao = this.respondendo();
      if (sugestao) {
        this.respondendo.set(null);
        await this.estatisticasService.resolverPerguntaSemResposta(sugestao.id).catch(() => undefined);
      }
      this.fecharModal();
      this.toastService.mostrar('Pergunta adicionada');
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível salvar. Tente de novo.'));
    } finally {
      this.salvando.set(false);
    }
  }
}
