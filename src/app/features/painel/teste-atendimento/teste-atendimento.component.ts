import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { mensagemDoErro } from '../../../core/api/erro-api';
import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { PerfilService } from '../../../core/services/perfil.service';
import { AcaoTeste, MensagemTeste, TesteAtendimentoService } from '../../../core/services/teste-atendimento.service';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { LinhaFormatada, formatarWhatsapp } from './formatacao-whatsapp';

/** Marcador que o backend grava quando o catálogo (PDF/imagens) seria enviado. */
const MARCADOR_CATALOGO = '[Catálogo enviado ao cliente]';

/** Uma linha da conversa na tela: mensagem, aviso do sistema (catálogo, transferência) ou separador de dia. */
type ItemConversa =
  | { tipo: 'mensagem'; deCliente: boolean; linhas: LinhaFormatada[]; hora: string }
  | { tipo: 'aviso'; texto: string };

const AVISOS: Partial<Record<AcaoTeste, string>> = {
  TRANSFERIR_HUMANO: 'Aqui o assistente passaria a conversa para você e te avisaria no celular.',
  SEM_INFORMACAO: 'O assistente não soube responder: aqui a conversa iria para você. Continue o teste normalmente.',
};

/**
 * "Testar atendimento": conversa no estilo WhatsApp em que o lojista escreve como cliente e o assistente responde
 * pelo mesmo caminho do WhatsApp de verdade. Nada vai para o WhatsApp; agendamentos são marcados na agenda de verdade.
 */
@Component({
  selector: 'app-teste-atendimento',
  imports: [FormsModule, IconeComponent, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './teste-atendimento.component.html',
  styleUrl: './teste-atendimento.component.css',
  host: {
    '(document:keydown.escape)': 'fechar.emit()',
  },
})
export class TesteAtendimentoComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly fechar = output<void>();

  private readonly servico = inject(TesteAtendimentoService);
  protected readonly perfil = inject(PerfilService).perfil;
  private readonly rolagem = viewChild<ElementRef<HTMLElement>>('rolagem');
  private readonly campo = viewChild<ElementRef<HTMLTextAreaElement>>('campo');
  private overflowAnteriorDoBody = '';

  protected readonly carregando = signal(true);
  protected readonly mensagens = signal<MensagemTeste[]>([]);
  /** Mensagem já enviada que espera a resposta (aparece na hora, com o "digitando…" do assistente). */
  protected readonly pendente = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);
  protected readonly erro = signal<string | null>(null);
  protected readonly texto = signal('');

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
          },
    ),
  );

  ngOnInit(): void {
    void this.carregar();
  }

  ngAfterViewInit(): void {
    this.overflowAnteriorDoBody = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = this.overflowAnteriorDoBody;
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
    if (!texto || this.pendente()) {
      return;
    }
    this.texto.set('');
    this.aviso.set(null);
    this.erro.set(null);
    this.pendente.set(texto);
    this.rolarParaOFim();
    try {
      const resposta = await this.servico.enviar(texto);
      this.mensagens.set(resposta.mensagens);
      this.aviso.set(resposta.acao ? (AVISOS[resposta.acao] ?? null) : null);
    } catch (erro) {
      this.erro.set(mensagemDoErro(erro, 'O assistente não respondeu agora. Tente de novo.'));
      this.texto.set(texto);   // devolve o texto para não precisar escrever de novo
    } finally {
      this.pendente.set(null);
      this.rolarParaOFim();
      this.campo()?.nativeElement.focus();
    }
  }

  protected async recomecar(): Promise<void> {
    if (this.pendente()) {
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
