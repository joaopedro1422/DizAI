import { ChangeDetectionStrategy, Component, ElementRef, OnInit, computed, inject, input, output, signal } from '@angular/core';

import { Cliente } from '../../../core/models/cliente.model';
import { ClienteService } from '../../../core/services/cliente.service';
import { IconeComponent } from '../icone/icone.component';

/** O cliente do registro manual: escolhido da lista (nome e número de lá) ou novo (digitado). */
export interface ClienteDoRegistro {
  nome: string;
  whatsapp: string;
  /** Id do cliente da lista; null = novo. */
  id: string | null;
}

/** "(83) 99999-0000", "83999990000" e "+55 83 9999-0000" viram a mesma chave (como o `Telefone.chave` do back). */
export function chaveDoNumero(texto: string): string {
  let digitos = texto.replace(/\D/g, '').replace(/^0+/, '');
  if (digitos.length === 10 || digitos.length === 11) digitos = '55' + digitos;
  if (digitos.length === 13 && digitos.startsWith('55') && digitos[4] === '9') {
    digitos = digitos.slice(0, 4) + digitos.slice(5);
  }
  return digitos;
}

/**
 * Cliente do pedido/agendamento manual: escolhe da lista de Clientes (com busca) ou, pelo "Novo cliente", digita
 * nome e WhatsApp. O número digitado que já é de um cliente oferece usar o cadastro dele (o histórico não se divide).
 */
@Component({
  selector: 'app-seletor-cliente',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'fecharSeForFora($event)', '(keydown.escape)': 'aberto.set(false)' },
  template: `
    @if (!novo()) {
      <button
        type="button"
        class="gatilho"
        [class.gatilho--aberto]="aberto()"
        [class.gatilho--vazio]="!escolhido()"
        [class.gatilho--erro]="erro() && !escolhido()"
        aria-haspopup="listbox"
        [attr.aria-expanded]="aberto()"
        [attr.aria-label]="'Cliente: ' + (escolhido()?.nome ?? 'nenhum')"
        (click)="abrir()"
      >
        <span class="avatar" [class.avatar--vazio]="!escolhido()" aria-hidden="true">
          @if (escolhido(); as cliente) {
            {{ iniciais(cliente.nome) }}
          } @else {
            <app-icone nome="pessoa" [tamanho]="16" />
          }
        </span>
        <span class="gatilho__textos">
          @if (escolhido(); as cliente) {
            <span class="gatilho__nome">{{ cliente.nome }}</span>
            <span class="gatilho__numero">{{ cliente.whatsapp || 'Sem WhatsApp' }}</span>
          } @else {
            <span class="gatilho__nome">Escolha o cliente</span>
          }
        </span>
        <span class="gatilho__seta" aria-hidden="true"><app-icone nome="setaBaixo" [tamanho]="16" [espessura]="2.4" /></span>
      </button>

      @if (aberto()) {
        <div class="lista" role="listbox" aria-label="Clientes cadastrados">
          <span class="busca">
            <app-icone nome="busca" [tamanho]="15" />
            <input #campoBusca type="search" placeholder="Buscar por nome ou número" aria-label="Buscar cliente" [value]="busca()" (input)="busca.set($any($event.target).value)">
          </span>
          <div class="lista__opcoes">
            @for (cliente of filtrados(); track cliente.id) {
              @let marcado = cliente.id === escolhido()?.id;
              <button type="button" role="option" class="opcao" [class.opcao--marcada]="marcado" [attr.aria-selected]="marcado" (click)="escolher(cliente)">
                <span class="avatar" aria-hidden="true">{{ iniciais(cliente.nome) }}</span>
                <span class="opcao__textos">
                  <span class="opcao__nome">{{ cliente.nome }}</span>
                  <span class="opcao__numero">{{ cliente.whatsapp || 'Sem WhatsApp' }}</span>
                </span>
                @if (marcado) {
                  <span class="opcao__check"><app-icone nome="check" [tamanho]="15" [espessura]="2.6" /></span>
                }
              </button>
            } @empty {
              <p class="lista__vazia">
                {{ carregando() ? 'Carregando os clientes…' : clientes().length === 0 ? 'Nenhum cliente cadastrado ainda.' : 'Nenhum cliente com esse nome ou número.' }}
              </p>
            }
          </div>
        </div>
      }

      <button type="button" class="novo" (click)="cadastrarNovo()">
        <app-icone nome="mais" [tamanho]="15" [espessura]="2.4" /> Novo cliente
      </button>
    } @else {
      <div class="novo-cliente">
        <div class="novo-cliente__topo">
          <strong>Novo cliente</strong>
          @if (clientes().length > 0) {
            <button type="button" class="link" (click)="voltarParaLista()">Escolher um cadastrado</button>
          }
        </div>
        <div class="campo">
          <label [for]="id + '-nome'" class="campo__rotulo">Nome</label>
          <input [id]="id + '-nome'" class="campo__entrada" type="text" maxlength="100" placeholder="Ex.: Maria Souza" [value]="nome()" (input)="digitarNome($any($event.target).value)">
        </div>
        <div class="campo">
          <label [for]="id + '-whatsapp'" class="campo__rotulo">WhatsApp <span class="campo__rotulo-opcional">(opcional)</span></label>
          <input [id]="id + '-whatsapp'" class="campo__entrada" type="tel" inputmode="tel" autocomplete="off" placeholder="(83) 99999-0000" [value]="whatsapp()" (input)="digitarNumero($any($event.target).value)">
          @if (mesmoNumero(); as cliente) {
            <span class="ja-existe" role="status">
              <span>Este número já é de <strong>{{ cliente.nome }}</strong>.</span>
              <button type="button" class="link" (click)="escolher(cliente)">Usar este cliente</button>
            </span>
          } @else if (dica()) {
            <span class="campo__dica">{{ dica() }}</span>
          }
        </div>
      </div>
    }
    @if (erro() && !preenchido()) {
      <span class="campo__erro" role="alert">{{ novo() ? 'Informe o nome do cliente.' : 'Escolha o cliente ou cadastre um novo.' }}</span>
    }
  `,
  styleUrl: './seletor-cliente.component.css',
})
export class SeletorClienteComponent implements OnInit {
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly clienteService = inject(ClienteService);

  /** Mostra o aviso de obrigatório (o formulário tentou salvar sem cliente). */
  readonly erro = input(false);
  /** Dica embaixo do WhatsApp do cliente novo. */
  readonly dica = input('');
  readonly mudou = output<ClienteDoRegistro>();

  private static sequencia = 0;
  protected readonly id = `seletor-cliente-${++SeletorClienteComponent.sequencia}`;

  protected readonly clientes = computed(() =>
    [...this.clienteService.clientes()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
  );
  protected readonly carregando = signal(true);
  protected readonly aberto = signal(false);
  protected readonly busca = signal('');
  protected readonly escolhido = signal<Cliente | null>(null);
  protected readonly novo = signal(false);
  protected readonly nome = signal('');
  protected readonly whatsapp = signal('');

  protected readonly filtrados = computed(() => {
    const termo = semAcento(this.busca().trim());
    if (!termo) return this.clientes();
    const digitos = termo.replace(/\D/g, '');
    return this.clientes().filter(
      (c) => semAcento(c.nome).includes(termo) || (digitos.length >= 3 && c.numero.includes(digitos)),
    );
  });

  /** O número digitado no cliente novo que já pertence a um cliente da lista. */
  protected readonly mesmoNumero = computed<Cliente | null>(() => {
    const chave = chaveDoNumero(this.whatsapp());
    if (chave.length < 12) return null;
    return this.clientes().find((c) => c.numero && chaveDoNumero(c.numero) === chave) ?? null;
  });

  protected readonly preenchido = computed(() => (this.novo() ? !!this.nome().trim() : !!this.escolhido()));

  ngOnInit(): void {
    // sem a lista (erro ou loja nova), o lojista cadastra pelo "Novo cliente"
    this.clienteService
      .carregar()
      .catch(() => undefined)
      .finally(() => {
        this.carregando.set(false);
        if (this.clientes().length === 0) this.novo.set(true);
      });
  }

  protected abrir(): void {
    this.busca.set('');
    this.aberto.set(!this.aberto());
    if (this.aberto()) {
      setTimeout(() => this.elemento.nativeElement.querySelector<HTMLInputElement>('.busca input')?.focus());
    }
  }

  protected escolher(cliente: Cliente): void {
    this.escolhido.set(cliente);
    this.novo.set(false);
    this.aberto.set(false);
    this.mudou.emit({ nome: cliente.nome, whatsapp: cliente.whatsapp, id: cliente.id });
  }

  protected cadastrarNovo(): void {
    this.escolhido.set(null);
    this.aberto.set(false);
    this.novo.set(true);
    this.avisarNovo();
  }

  protected voltarParaLista(): void {
    this.novo.set(false);
    this.nome.set('');
    this.whatsapp.set('');
    this.mudou.emit({ nome: '', whatsapp: '', id: null });
  }

  protected digitarNome(valor: string): void {
    this.nome.set(valor);
    this.avisarNovo();
  }

  protected digitarNumero(valor: string): void {
    this.whatsapp.set(valor);
    this.avisarNovo();
  }

  private avisarNovo(): void {
    this.mudou.emit({ nome: this.nome(), whatsapp: this.whatsapp(), id: null });
  }

  protected iniciais(nome: string): string {
    const partes = nome.trim().split(/\s+/).filter(Boolean);
    return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase() || '?';
  }

  protected fecharSeForFora(evento: Event): void {
    if (this.aberto() && !this.elemento.nativeElement.contains(evento.target as Node)) {
      this.aberto.set(false);
    }
  }
}

function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}
