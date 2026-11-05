import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { mensagemDoErro } from '../../../core/api/erro-api';
import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { PerfilService } from '../../../core/services/perfil.service';
import { AcaoTeste, MensagemTeste, RespostaTeste, TesteAtendimentoService } from '../../../core/services/teste-atendimento.service';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { LinhaFormatada, formatarWhatsapp } from './formatacao-whatsapp';
import { marcarTesteFeito } from '../onboarding/progresso-onboarding';
import { ramoDeServico } from '../../../core/models/perfil.model';
import { DicaSobrepostaComponent } from '../../../shared/components/dica-sobreposta/dica-sobreposta.component';
import { LojaPublicaService } from '../../../core/services/loja-publica.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { Router } from '@angular/router';
import { SessaoService } from '../../../core/auth/sessao.service';
import { ClienteAutomatico } from './cliente-automatico';

/** Marcador que o backend grava quando o catálogo (PDF/imagens) seria enviado. */
const MARCADOR_CATALOGO = '[Catálogo enviado ao cliente]';

/** Uma linha da conversa na tela: mensagem, aviso do sistema (catálogo, transferência) ou separador de dia. */
type ItemConversa =
  | { tipo: 'mensagem'; deCliente: boolean; linhas: LinhaFormatada[]; hora: string; audio: NotaDeVoz | null }
  | { tipo: 'aviso'; texto: string };

/** Áudio do cliente: o backend grava a transcrição com esta marca na frente (AudioClienteService.PREFIXO). */
const MARCA_AUDIO = '🎤 ';

/** A transcrição desenhada como a nota de voz do WhatsApp: ondas, duração estimada e o texto escondido. */
interface NotaDeVoz {
  ondas: number[];
  duracao: string;
  transcricao: string;
}

/** Ondas fixas para o mesmo texto (o áudio não é guardado, então o desenho sai do próprio texto). */
function notaDeVoz(transcricao: string, segundos?: number): NotaDeVoz {
  let semente = 7;
  for (const letra of transcricao) {
    semente = (semente * 31 + letra.charCodeAt(0)) % 9973;
  }
  const ondas = Array.from({ length: 30 }, (_, i) => 22 + ((semente * (i + 3) * 17) % 78));
  // sem a duração real, estima pela fala (umas 2,5 palavras por segundo)
  const total = segundos ?? Math.max(1, Math.round(transcricao.split(/\s+/).filter(Boolean).length / 2.5));
  return { ondas, duracao: `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`, transcricao };
}

/** De quanto em quanto tempo a tela busca as mensagens enquanto o assistente responde. */
const ACOMPANHAR_A_CADA_MS = 700;

/** Texto da mensagem pendente enquanto o áudio é transcrito (a tela desenha a nota de voz). */
const TRANSCREVENDO = '🎤 Transcrevendo o áudio…';

/** Quanto a janela do próximo passo espera depois da resposta (para dar tempo de ler). */
const ESPERA_PROXIMO_PASSO_MS = 2500;

/** Primeiro teste: o tempo para o lojista ler a resposta antes de o "cliente" escrever de novo. */
const ESPERA_CLIENTE_AUTOMATICO_MS = 1800;

/** Limite da gravação no teste: passou disso, envia o que já gravou. */
const DURACAO_MAXIMA_AUDIO_S = 120;

const AVISOS: Partial<Record<AcaoTeste, string>> = {
  TRANSFERIR_HUMANO: 'Aqui o assistente passaria a conversa para você e te avisaria no celular.',
  SEM_INFORMACAO: 'O assistente não soube responder: aqui a conversa iria para você. Continue o teste normalmente.',
};

@Component({
  selector: 'app-teste-atendimento',
  imports: [DicaSobrepostaComponent, FormsModule, IconeComponent, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './teste-atendimento.component.html',
  styleUrls: ['./teste-atendimento.component.css', './nota-voz-teste.css'],
  host: {
    '(document:keydown.escape)': 'fechar.emit()',
  },
})
export class TesteAtendimentoComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly fechar = output<void>();
  /** Mensagem do primeiro teste (vinda do onboarding): é enviada sozinha assim que a conversa abre. */
  readonly textoInicial = input('');
  /** Primeiro teste do onboarding: depois da resposta (nos serviços, do horário marcado) abre o próximo passo. */
  readonly primeiroTeste = input(false);
  /** "Voltar ao painel" da janela do próximo passo. */
  readonly voltarAoPainel = output<void>();
  /** Janela depois do primeiro teste: produtos = voltar ao painel; serviços = conhecer a agenda online. */
  protected readonly proximoPasso = signal<'produtos' | 'pedido' | 'servicos' | null>(null);
  private proximoPassoMostrado = false;

  private readonly servico = inject(TesteAtendimentoService);
  private readonly produtos = inject(ProdutoService);
  private readonly lojaPublica = inject(LojaPublicaService);
  private clienteAutomatico: ClienteAutomatico | null = null;
  protected readonly automatico = signal(false);
  private esperaAutomatico: number | undefined;
  protected readonly perfil = inject(PerfilService).perfil;
  private readonly rolagem = viewChild<ElementRef<HTMLElement>>('rolagem');
  private readonly campo = viewChild<ElementRef<HTMLTextAreaElement>>('campo');
  private overflowAnteriorDoBody = '';

  protected readonly carregando = signal(true);
  protected readonly mensagens = signal<MensagemTeste[]>([]);
  /** Mensagem já enviada que ainda não voltou do servidor (aparece na hora, antes da lista atualizar). */
  protected readonly pendente = signal<string | null>(null);
  /** Esperando a resposta do assistente: o "digitando…" fica até ela chegar. */
  protected readonly respondendo = signal(false);
  protected readonly aviso = signal<string | null>(null);
  protected readonly erro = signal<string | null>(null);
  protected readonly texto = signal('');

  /** Gravação de áudio (como a nota de voz do WhatsApp): o backend transcreve e o assistente responde o que foi dito. */
  protected readonly podeGravar = typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
  protected readonly gravando = signal(false);
  protected readonly segundosGravados = signal(0);
  protected readonly tempoGravado = computed(() => {
    const total = this.segundosGravados();
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  });
  private gravador: MediaRecorder | null = null;
  private pedacos: Blob[] = [];
  private relogioGravacao: number | undefined;
  private gravacaoCancelada = false;

  /** Notas de voz com a transcrição aberta (posição na conversa). */
  protected readonly transcricoesAbertas = signal<ReadonlySet<number>>(new Set());
  /** Enquanto o áudio gravado é transcrito, aparece como nota de voz com o tempo gravado. */
  protected readonly audioPendente = computed(() =>
    this.pendente() === TRANSCREVENDO ? notaDeVoz('', this.segundosGravados()) : null,
  );

  protected readonly inicial = computed(() => this.perfil().nomeLoja.trim().charAt(0).toUpperCase() || '?');

  protected readonly itens = computed<ItemConversa[]>(() =>
    this.mensagens().map((mensagem) =>
      mensagem.texto === MARCADOR_CATALOGO
        ? { tipo: 'aviso', texto: '📎 Aqui o assistente enviaria o seu catálogo' }
        : {
            tipo: 'mensagem',
            deCliente: mensagem.origem === 'CLIENTE',
            linhas: formatarWhatsapp(mensagem.texto),
            hora: horaDe(mensagem.criadoEm),
            audio: mensagem.origem === 'CLIENTE' && mensagem.texto.startsWith(MARCA_AUDIO)
              ? notaDeVoz(mensagem.texto.slice(MARCA_AUDIO.length).trim())
              : null,
          },
    ),
  );

  ngOnInit(): void {
    if (this.primeiroTeste()) {
      this.automatico.set(true);
      void Promise.all([this.carregar(), this.prepararClienteAutomatico()]).then(([, cliente]) => this.comecarAutomatico(cliente));
      return;
    }
    // a mensagem pronta sai sozinha (sem o lojista precisar acertar o texto)
    void this.carregar().then(() => {
      if (this.textoInicial().trim()) {
        this.texto.set(this.textoInicial());
        void this.enviar();
      }
    });
  }

  private async prepararClienteAutomatico(): Promise<ClienteAutomatico | null> {
    const perfil = this.perfil();
    const servico = ramoDeServico(perfil.ramo);
    const nome = perfil.nomeResponsavel?.trim() || 'Cliente';
    try {
      if (!this.produtos.produtos().length) {
        await this.produtos.carregar();
      }
      const item = this.produtos.produtos().find((produto) => !produto.produtoAVenda) ?? null;
      if (!servico) {
        return new ClienteAutomatico({
          servico,
          nome,
          produto: item,
          horarios: perfil.horariosFuncionamento,
          horarioLivre: perfil.horarioLivre,
          antecedenciaLojaMinutos: perfil.antecedenciaMinutos,
        });
      }
      let primeiroHorario: { data: string; hora: string } | null = null;
      try {
        const agenda = await this.lojaPublica.buscarAgenda(perfil.slug);
        const alvo = agenda.servicos.find((s) => s.id === item?.id) ?? agenda.servicos[0];
        if (alvo) {
          const dias = await this.lojaPublica.buscarHorarios(perfil.slug, [alvo.id]);
          const dia = dias.find((d) => d.aberto && d.horarios.length);
          primeiroHorario = dia ? { data: dia.data, hora: dia.horarios[0] } : null;
        }
      } catch {
        // sem a agenda online o cliente escolhe um dos horários que o assistente mostrar
      }
      return new ClienteAutomatico({ servico, nome, nomeServico: item?.nome, primeiroHorario });
    } catch {
      return null;
    }
  }

  private comecarAutomatico(cliente: ClienteAutomatico | null): void {
    this.clienteAutomatico = cliente;
    if (!cliente) {
      this.terminarAutomatico();
      return;
    }
    void this.enviarComoCliente(cliente.primeira());
  }

  /** Depois de cada resposta: o "cliente" responde sozinho ou a conversa volta para o lojista. */
  private continuarAutomatico(resposta: RespostaTeste): void {
    const ultima = [...resposta.mensagens].reverse().find((m) => m.origem !== 'CLIENTE');
    const proxima = this.clienteAutomatico?.proxima(ultima?.texto ?? '', resposta.acao) ?? null;
    if (!proxima) {
      this.terminarAutomatico();
      return;
    }
    this.esperaAutomatico = window.setTimeout(() => void this.enviarComoCliente(proxima), ESPERA_CLIENTE_AUTOMATICO_MS);
  }

  private terminarAutomatico(): void {
    if (!this.automatico()) {
      return;
    }
    this.automatico.set(false);
    this.clienteAutomatico = null;
    // o tutorial continua: a janela do próximo passo (nos serviços, só com o horário marcado)
    this.conferirProximoPasso(this.ultimaAcao);
    this.campo()?.nativeElement.focus();
  }

  private ultimaAcao: AcaoTeste | null = null;

  private async enviarComoCliente(texto: string): Promise<void> {
    await this.conversar(texto, () => this.servico.enviar(texto));
  }

  private readonly router = inject(Router);
  private readonly rotas = inject(SessaoService).rotasDoPainel;

  protected irParaOFechamento(destino: 'chats' | 'agenda'): void {
    void this.router.navigate([this.rotas()[destino]], { queryParams: { fechamento: 1 } });
  }

  /** No primeiro teste: produtos, logo depois da primeira resposta; serviços, quando o horário é marcado. */
  private conferirProximoPasso(acao: AcaoTeste | null | undefined): void {
    if (!this.primeiroTeste() || this.proximoPassoMostrado || this.automatico()) {
      return;
    }
    const servico = ramoDeServico(this.perfil().ramo);
    if (servico && acao !== 'AGENDAR') {
      return;
    }
    this.proximoPassoMostrado = true;
    // um respiro para o lojista ler a resposta antes da janela
    const passo = servico ? 'servicos' : acao === 'TRANSFERIR_HUMANO' ? 'pedido' : 'produtos';
    window.setTimeout(() => this.proximoPasso.set(passo), ESPERA_PROXIMO_PASSO_MS);
  }

  ngAfterViewInit(): void {
    this.overflowAnteriorDoBody = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = this.overflowAnteriorDoBody;
    window.clearTimeout(this.esperaAutomatico);
    this.cancelarGravacao();   // fechou gravando: descarta e libera o microfone
  }

  private async carregar(): Promise<void> {
    try {
      this.mensagens.set(await this.servico.mensagens());
    } catch (erro) {
      this.erro.set(mensagemDoErro(erro, 'Não foi possível abrir o teste. Tente de novo.'));
    } finally {
      this.carregando.set(false);
      this.rolarParaOFim();
      this.campo()?.nativeElement.focus();
    }
  }

  /** Enter envia; Shift+Enter quebra a linha. */
  protected aoTeclar(evento: KeyboardEvent): void {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault();
      void this.enviar();
    }
  }

  protected async enviar(): Promise<void> {
    const texto = this.texto().trim();
    if (!texto || this.respondendo() || this.automatico()) {
      return;
    }
    this.texto.set('');
    // em caso de erro, devolve o texto para não precisar escrever de novo
    await this.conversar(texto, () => this.servico.enviar(texto), () => this.texto.set(texto));
  }

  /** Começa a gravar (pede o microfone na primeira vez). Tocar de novo no botão envia; a lixeira descarta. */
  protected async gravar(): Promise<void> {
    if (this.respondendo() || this.gravando()) {
      return;
    }
    this.erro.set(null);
    let microfone: MediaStream;
    try {
      microfone = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      this.erro.set('Libere o microfone no navegador para gravar um áudio.');
      return;
    }
    const tipo = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'].find((t) => MediaRecorder.isTypeSupported(t));
    const gravador = new MediaRecorder(microfone, tipo ? { mimeType: tipo } : undefined);
    this.gravador = gravador;
    this.pedacos = [];
    this.gravacaoCancelada = false;
    gravador.ondataavailable = (evento) => {
      if (evento.data.size > 0) {
        this.pedacos.push(evento.data);
      }
    };
    gravador.onstop = () => {
      microfone.getTracks().forEach((faixa) => faixa.stop());
      window.clearInterval(this.relogioGravacao);
      this.gravando.set(false);
      if (!this.gravacaoCancelada) {
        void this.enviarAudio(new Blob(this.pedacos, { type: gravador.mimeType }));
      }
    };
    gravador.start();
    this.gravando.set(true);
    this.segundosGravados.set(0);
    this.relogioGravacao = window.setInterval(() => {
      this.segundosGravados.update((s) => s + 1);
      if (this.segundosGravados() >= DURACAO_MAXIMA_AUDIO_S) {
        this.pararGravacao();   // limite: envia o que já gravou
      }
    }, 1000);
  }

  protected pararGravacao(): void {
    if (this.gravador?.state === 'recording') {
      this.gravador.stop();
    }
  }

  protected cancelarGravacao(): void {
    this.gravacaoCancelada = true;
    this.pararGravacao();
  }

  private async enviarAudio(audio: Blob): Promise<void> {
    if (this.segundosGravados() < 1 || audio.size < 1000) {
      this.erro.set('Áudio muito curto. Toque no microfone, fale e toque em enviar.');
      return;
    }
    await this.conversar(TRANSCREVENDO, () => this.servico.enviarAudio(audio));
  }

  protected alternarTranscricao(posicao: number): void {
    this.transcricoesAbertas.update((abertas) => {
      const novas = new Set(abertas);
      if (!novas.delete(posicao)) {
        novas.add(posicao);
      }
      return novas;
    });
  }

  /** Mostra a mensagem do cliente pendente, acompanha a saudação e põe a resposta do assistente na tela. */
  private async conversar(pendente: string, enviar: () => Promise<RespostaTeste>, aoFalhar?: () => void): Promise<void> {
    this.aviso.set(null);
    this.erro.set(null);
    this.pendente.set(pendente);
    this.respondendo.set(true);
    this.rolarParaOFim();
    // como no WhatsApp: a saudação é gravada antes da IA responder, então aparece primeiro
    let terminou = false;
    const acompanhar = window.setInterval(() => void this.acompanhar(() => terminou), ACOMPANHAR_A_CADA_MS);
    try {
      const resposta = await enviar();
      terminou = true;
      this.mensagens.set(resposta.mensagens);
      marcarTesteFeito(this.perfil().id);
      this.ultimaAcao = resposta.acao;
      this.aviso.set(resposta.acao ? (AVISOS[resposta.acao] ?? null) : null);
      if (this.automatico()) {
        this.continuarAutomatico(resposta);
      } else {
        this.conferirProximoPasso(resposta.acao);
      }
    } catch (erro) {
      terminou = true;
      this.erro.set(mensagemDoErro(erro, 'O assistente não respondeu agora. Tente de novo.'));
      aoFalhar?.();
      this.terminarAutomatico();
    } finally {
      window.clearInterval(acompanhar);
      this.pendente.set(null);
      this.respondendo.set(false);
      this.rolarParaOFim();
      this.campo()?.nativeElement.focus();
    }
  }

  /** Enquanto o assistente pensa, traz o que já foi gravado (a mensagem do cliente e a saudação). */
  private async acompanhar(terminou: () => boolean): Promise<void> {
    try {
      const lista = await this.servico.mensagens();
      if (terminou() || lista.length <= this.mensagens().length) {
        return;
      }
      this.mensagens.set(lista);
      if (lista.some((m) => m.origem === 'CLIENTE' && m.texto === this.pendente())) {
        this.pendente.set(null);   // a mensagem do cliente já está na lista
      }
      this.rolarParaOFim();
    } catch {
      // só uma espiada: a resposta completa chega pelo envio
    }
  }

  protected async recomecar(): Promise<void> {
    if (this.respondendo() || this.automatico()) {
      return;
    }
    try {
      await this.servico.recomecar();
      this.mensagens.set([]);
      this.aviso.set(null);
      this.erro.set(null);
    } catch (erro) {
      this.erro.set(mensagemDoErro(erro, 'Não foi possível recomeçar. Tente de novo.'));
    }
    this.campo()?.nativeElement.focus();
  }

  private rolarParaOFim(): void {
    setTimeout(() => {
      const area = this.rolagem()?.nativeElement;
      area?.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
    });
  }
}

function horaDe(iso: string): string {
  const data = new Date(iso);
  return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
}
