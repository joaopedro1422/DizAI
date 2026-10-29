import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';

import { mensagemDoErro } from '../../../core/api/erro-api';
import { Conversa, MensagemConversa } from '../../../core/models/conversa.model';
import { ConversaService } from '../../../core/services/conversa.service';
import { ToastService } from '../../../core/services/toast.service';
import { gerarLinkWhatsapp } from '../../../core/utils/texto.utils';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { TempoDecorridoPipe } from '../../../shared/pipes/tempo-decorrido.pipe';

/**
 * Chats → Em andamento, ao tocar numa conversa: quem é (nome e número), as 2 últimas mensagens e o que dá para fazer:
 * assumir (o assistente para de responder) ou devolver ao assistente, e abrir no WhatsApp.
 */
@Component({
  selector: 'app-detalhe-conversa',
  imports: [AvatarComponent, CarregandoComponent, IconeComponent, TempoDecorridoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="detalhe">
      <div class="pessoa">
        <app-avatar modo="icone" [nome]="nome()" [tamanho]="48" />
        <div class="pessoa__textos">
          <strong class="pessoa__nome">{{ nome() }}</strong>
          @if (conversa().nomeCliente) {
            <span class="pessoa__numero">{{ conversa().whatsapp }}</span>
          }
        </div>
        <span class="estado" [class.estado--dono]="!comAssistente()">
          <span class="estado__ponto"></span>
          {{ textoEstado() }}
        </span>
      </div>

      <div class="mensagens" aria-label="Últimas mensagens">
        @if (carregando()) {
          <app-carregando modo="inline" [tamanho]="22" />
        } @else {
          @for (mensagem of mensagens(); track $index) {
            <div class="mensagem" [class.mensagem--loja]="mensagem.origem !== 'CLIENTE'">
              <span class="mensagem__quem">
                {{ mensagem.origem === 'CLIENTE' ? nome() : mensagem.origem === 'DONO' ? 'Você' : 'Assistente' }}
                · {{ mensagem.criadoEm | tempoDecorrido }}
              </span>
              <p class="mensagem__texto">{{ mensagem.texto }}</p>
            </div>
          } @empty {
            <p class="mensagens__vazio">Ainda não há mensagens nesta conversa.</p>
          }
        }
      </div>

      <div class="acoes">
        @if (conversa().status === 'IA_ATIVA') {
          <button type="button" class="btn btn--primario btn--grande btn--bloco" [disabled]="salvando()" [attr.aria-busy]="salvando()" (click)="assumir()">
            @if (salvando()) {
              <app-carregando modo="inline" variante="claro" [tamanho]="20" />
            } @else {
              <app-icone nome="pessoa" [tamanho]="18" [espessura]="2" />
            }
            Assumir conversa
          </button>
          <p class="acoes__dica">O assistente para de responder este cliente. Você continua pelo WhatsApp.</p>
        } @else if (conversa().status === 'HUMANO_ATIVO') {
          <button type="button" class="btn btn--secundario btn--grande btn--bloco" [disabled]="salvando()" [attr.aria-busy]="salvando()" (click)="devolver()">
            @if (salvando()) {
              <app-carregando modo="inline" [tamanho]="20" />
            } @else {
              <app-icone nome="headset" [tamanho]="18" [espessura]="2" />
            }
            Devolver ao assistente
          </button>
          <p class="acoes__dica">O assistente volta a responder as próximas mensagens deste cliente.</p>
        }
        <a class="btn btn--texto btn--bloco" [href]="linkWhatsapp()" target="_blank" rel="noopener">
          <app-icone nome="conversa" [tamanho]="18" [espessura]="2" />
          Abrir no WhatsApp
        </a>
      </div>
    </div>
  `,
  styles: `
    .detalhe {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .pessoa {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .pessoa__textos {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .pessoa__nome {
      overflow: hidden;
      font-size: 16px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .pessoa__numero {
      font-size: 13px;
      color: var(--cor-texto-suave);
      font-variant-numeric: tabular-nums;
    }

    .estado {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      flex: none;
      padding: 4px 10px;
      border-radius: var(--raio-pilula);
      background: var(--cor-azul-fundo);
      color: var(--cor-azul);
      font-size: 12px;
      font-weight: 700;
    }

    .estado__ponto {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .estado--dono {
      background: var(--cor-ambar-fundo);
      color: var(--cor-ambar);
    }

    /* as mensagens no jeito do WhatsApp: cliente à esquerda, loja à direita */
    .mensagens {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-height: 80px;
      padding: 14px;
      border-radius: var(--raio-medio);
      background: #EFEAE2;
    }

    .mensagem {
      align-self: flex-start;
      max-width: 85%;
      padding: 8px 11px;
      border-radius: 4px 12px 12px 12px;
      background: #ffffff;
      box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13);
    }

    .mensagem--loja {
      align-self: flex-end;
      border-radius: 12px 4px 12px 12px;
      background: #D9FDD3;
    }

    .mensagem__quem {
      display: block;
      margin-bottom: 2px;
      font-size: 11.5px;
      font-weight: 700;
      color: #667781;
    }

    .mensagem__texto {
      font-size: 14px;
      line-height: 1.45;
      color: #111B21;
      white-space: pre-line;
      overflow-wrap: anywhere;
    }

    .mensagens__vazio {
      margin: auto;
      font-size: 13px;
      color: #667781;
    }

    .acoes {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .acoes .btn {
      gap: 8px;
    }

    .acoes__dica {
      margin-bottom: 4px;
      font-size: 12.5px;
      line-height: 1.45;
      color: var(--cor-texto-suave);
      text-align: center;
    }
  `,
})
export class DetalheConversaComponent implements OnInit {
  private readonly conversaService = inject(ConversaService);
  private readonly toastService = inject(ToastService);

  readonly conversa = input.required<Conversa>();
  /** A conversa mudou de dono (assumida ou devolvida): a tela fecha o modal. */
  readonly alterada = output<void>();

  protected readonly mensagens = signal<MensagemConversa[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);

  protected readonly nome = computed(() => this.conversa().nomeCliente || this.conversa().whatsapp);
  protected readonly comAssistente = computed(() => this.conversa().status === 'IA_ATIVA');
  protected readonly textoEstado = computed(() => {
    const status = this.conversa().status;
    if (status === 'EM_PEDIDO') {
      return 'Pedido em preparo';
    }
    return status === 'HUMANO_ATIVO' ? 'Você está atendendo' : 'Assistente atendendo';
  });
  protected readonly linkWhatsapp = computed(() => gerarLinkWhatsapp(this.conversa().whatsapp));

  async ngOnInit(): Promise<void> {
    try {
      this.mensagens.set(await this.conversaService.ultimasMensagens(this.conversa().id, 2));
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível carregar as mensagens.'));
    } finally {
      this.carregando.set(false);
    }
  }

  protected async assumir(): Promise<void> {
    await this.mudar(
      () => this.conversaService.assumir(this.conversa().id),
      `Você assumiu a conversa com ${this.nome()}. O assistente não responde mais este cliente.`,
    );
  }

  protected async devolver(): Promise<void> {
    await this.mudar(
      () => this.conversaService.marcarComoResolvida(this.conversa().id),
      `O assistente voltou a atender ${this.nome()}`,
    );
  }

  private async mudar(acao: () => Promise<unknown>, aviso: string): Promise<void> {
    if (this.salvando()) {
      return;
    }
    this.salvando.set(true);
    try {
      await acao();
      this.toastService.mostrar(aviso);
      this.alterada.emit();
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível atualizar a conversa. Tente de novo.'));
    } finally {
      this.salvando.set(false);
    }
  }
}
