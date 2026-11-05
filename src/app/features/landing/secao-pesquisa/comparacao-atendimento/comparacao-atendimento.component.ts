import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { IconeComponent } from '../../../../shared/components/icone/icone.component';
import type { TipoNegocio } from '../../../demonstracao/conversas-demonstracao';

type Modo = 'com' | 'sem';

/**
 * Uma mensagem da janela: do cliente (direita), da loja (esquerda), um PDF da loja (texto = nome do arquivo,
 * detalhe = páginas e tamanho) ou o aviso de tempo passando (centro).
 */
interface Mensagem {
  de: 'cliente' | 'loja' | 'documento' | 'tempo';
  texto: string;
  detalhe?: string;
  hora?: string;
}

/** Um passo do roteiro: espera, mostra "digitando…" (só no texto da loja) e entra a mensagem. */
interface Passo extends Mensagem {
  esperaMs: number;
}

/** A confirmação padrão do agendamento (`AgendaService.CONFIRMACAO_PADRAO`), preenchida. */
const CONFIRMACAO = `Agendado! ✅

🛠️ Serviço: Corte de cabelo
📅 Data: sexta, 30/10
⏰ Horário: 15:00 às 15:30
👤 Nome: Pedro Almeida

Se precisar remarcar ou cancelar, é só me avisar por aqui.`;

/** Um atendimento da janela: a loja, com ou sem o DizAI, e o resultado que aparece no fim. */
interface Roteiro {
  tipo: TipoNegocio;
  modo: Modo;
  loja: string;
  /** Logo no avatar da janela (sem logo, a inicial sobre a cor). */
  logo?: string;
  inicial: string;
  cor: string;
  status: string;
  passos: Passo[];
  resultado: string;
}

const BARBEARIA = { tipo: 'servicos' as const, loja: 'Barbearia do Léo', inicial: 'L', cor: '#2F6B4F', logo: '/landing/galeria/logos/barbearia-do-leo.svg' };
const CONFEITARIA = { tipo: 'produtos' as const, loja: 'Pedacinho do Céu', inicial: 'P', cor: '#B4466A', logo: '/landing/galeria/logos/pedacinho-do-ceu.jpg' };

/** Na ordem: serviços sem e com o DizAI, depois produtos sem e com; e volta ao início. */
const ROTEIROS: Roteiro[] = [
  {
    ...BARBEARIA,
    modo: 'sem',
    status: 'visto por último às 13:10',
    passos: [
      { de: 'cliente', texto: 'Boa tarde, gostaria de agendar corte de cabelo para amanhã', hora: '14:02', esperaMs: 600 },
      { de: 'tempo', texto: '18 minutos depois', esperaMs: 1400 },
      { de: 'cliente', texto: 'Tem horário livre?', hora: '14:20', esperaMs: 700 },
      { de: 'tempo', texto: '25 minutos depois', esperaMs: 1400 },
      { de: 'cliente', texto: 'Oii?', hora: '14:45', esperaMs: 700 },
      { de: 'tempo', texto: '1 hora depois', esperaMs: 1600 },
      { de: 'loja', texto: 'Olá, quer qual horário?', hora: '15:47', esperaMs: 700 },
      { de: 'tempo', texto: '2 horas depois', esperaMs: 1600 },
      { de: 'loja', texto: 'Olá?', hora: '17:52', esperaMs: 700 },
    ],
    resultado: '1h45 até a primeira resposta. O cliente já foi embora.',
  },
  {
    ...BARBEARIA,
    modo: 'com',
    status: 'online',
    passos: [
      { de: 'cliente', texto: 'Boa tarde, gostaria de agendar corte de cabelo para amanhã', hora: '14:02', esperaMs: 600 },
      { de: 'loja', texto: 'Boa tarde!! Perfeito, para qual horário você deseja agendar?', hora: '14:02', esperaMs: 900 },
      { de: 'cliente', texto: 'Pode ser às 15:00?', hora: '14:03', esperaMs: 1600 },
      { de: 'loja', texto: 'Pode sim, está livre. Qual o nome para o agendamento?', hora: '14:03', esperaMs: 900 },
      { de: 'cliente', texto: 'Pedro Almeida', hora: '14:04', esperaMs: 1500 },
      { de: 'loja', texto: CONFIRMACAO, hora: '14:04', esperaMs: 900 },
    ],
    resultado: 'Horário marcado em 2 minutos',
  },
  {
    ...CONFEITARIA,
    modo: 'sem',
    status: 'visto por último ontem',
    passos: [
      { de: 'cliente', texto: 'Boa tarde! Vocês fazem bolo de aniversário para sábado?', hora: '10:15', esperaMs: 600 },
      { de: 'tempo', texto: '22 minutos depois', esperaMs: 1400 },
      { de: 'cliente', texto: 'Quanto fica um para 20 pessoas?', hora: '10:37', esperaMs: 700 },
      { de: 'tempo', texto: '40 minutos depois', esperaMs: 1400 },
      { de: 'cliente', texto: '??', hora: '11:17', esperaMs: 700 },
      { de: 'tempo', texto: '2 horas depois', esperaMs: 1600 },
      { de: 'loja', texto: 'Oi! Fazemos sim, para quantas pessoas?', hora: '13:25', esperaMs: 700 },
      { de: 'tempo', texto: '5 minutos depois', esperaMs: 1300 },
      { de: 'cliente', texto: 'Já encomendei em outro lugar, obrigado.', hora: '13:30', esperaMs: 700 },
    ],
    resultado: '3h10 até a primeira resposta. A venda foi para outra loja.',
  },
  {
    ...CONFEITARIA,
    modo: 'com',
    status: 'online',
    passos: [
      { de: 'cliente', texto: 'Boa tarde! Vocês fazem bolo de aniversário para sábado?', hora: '10:15', esperaMs: 600 },
      {
        de: 'loja',
        texto: `Boa tarde! Fazemos sim 🎂 O Bolo festivo tem 3 tamanhos:
• P (10 pessoas): R$ 90,00
• M (20 pessoas): R$ 150,00
• G (30 pessoas): R$ 210,00

Para quantas pessoas seria? Te envio o catálogo de sabores aqui embaixo.`,
        hora: '10:15',
        esperaMs: 900,
      },
      { de: 'documento', texto: 'Catálogo de sabores.pdf', detalhe: '2 páginas · PDF · 1,2 MB', hora: '10:15', esperaMs: 700 },
      { de: 'cliente', texto: 'Para 20 pessoas, de brigadeiro', hora: '10:16', esperaMs: 1700 },
      { de: 'loja', texto: 'O M serve 20 pessoas. Vai ser entrega ou retirada?', hora: '10:16', esperaMs: 900 },
      { de: 'cliente', texto: 'Retirada, sábado às 15h', hora: '10:17', esperaMs: 1500 },
      {
        de: 'loja',
        texto: `Anotei o seu pedido, a Camila irá confirmar!
Enquanto isso, envie uma foto do modelo que você quer.`,
        hora: '10:17',
        esperaMs: 900,
      },
    ],
    resultado: 'Pedido anotado em 2 minutos',
  },
];

/** Quanto a loja fica "digitando…" antes da mensagem dela entrar. */
const DIGITANDO_MS = 1300;
/** Quanto o resultado fica na tela antes de trocar para o outro atendimento. */
const RESULTADO_MS = 4200;

/**
 * Seção do MIT: a mesma conversa com o DizAI, resolvida em 2 minutos, e sem ele, com o cliente esperando horas.
 * Serviços (agendar um corte) e produtos (bolo festivo), cada um com e sem; tocam sozinhos enquanto a janela está
 * na tela e param fora dela.
 */
@Component({
  selector: 'app-comparacao-atendimento',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comparacao-atendimento.component.html',
  styleUrl: './comparacao-atendimento.component.css',
})
export class ComparacaoAtendimentoComponent implements AfterViewInit, OnDestroy {
  /** Landing de um tipo: só os atendimentos dele (com e sem); sem tipo, os quatro. */
  readonly tipo = input<TipoNegocio | null>(null);
  private readonly roteiros = computed(() => ROTEIROS.filter((r) => !this.tipo() || r.tipo === this.tipo()));
  protected readonly roteiro = signal(ROTEIROS[0]);
  protected readonly mensagens = signal<Mensagem[]>([]);
  protected readonly digitando = signal(false);
  protected readonly resultado = signal<string | null>(null);
  protected readonly status = signal(ROTEIROS[0].status);

  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly rolagem = viewChild.required<ElementRef<HTMLElement>>('rolagem');
  private observador?: IntersectionObserver;
  private visivel = false;
  private tocando = false;
  private encerrado = false;
  private retomar?: () => void;

  ngAfterViewInit(): void {
    // a janela já abre na loja do tipo da página (antes de começar a tocar)
    this.roteiro.set(this.roteiros()[0]);
    this.status.set(this.roteiros()[0].status);
    this.observador = new IntersectionObserver(([entrada]) => {
      this.visivel = entrada.isIntersecting;
      if (this.visivel) {
        this.retomar?.();
        this.retomar = undefined;
        if (!this.tocando) void this.tocar();
      }
    }, { threshold: 0.35 });
    this.observador.observe(this.elemento.nativeElement);
  }

  ngOnDestroy(): void {
    this.encerrado = true;
    this.observador?.disconnect();
  }

  /** Os quatro atendimentos em sequência, e de novo, enquanto a página estiver aberta. */
  private async tocar(): Promise<void> {
    this.tocando = true;
    while (!this.encerrado) {
      for (const roteiro of this.roteiros()) {
        if (!(await this.tocarRoteiro(roteiro))) return;
      }
    }
  }

  private async tocarRoteiro(roteiro: Roteiro): Promise<boolean> {
    const modo = roteiro.modo;
    this.roteiro.set(roteiro);
    this.status.set(roteiro.status);
    this.mensagens.set([]);
    this.resultado.set(null);
    for (const passo of roteiro.passos) {
      if (!(await this.esperar(passo.esperaMs))) return false;
      if (passo.de === 'loja') {
        this.digitando.set(true);
        if (modo === 'com') this.status.set('digitando…');
        this.rolarParaBaixo();
        if (!(await this.esperar(DIGITANDO_MS))) return false;
        this.digitando.set(false);
        this.status.set(modo === 'com' ? 'online' : roteiro.status);
      }
      const { esperaMs: _, ...mensagem } = passo;
      this.mensagens.update((lista) => [...lista, mensagem]);
      this.rolarParaBaixo();
    }
    if (!(await this.esperar(700))) return false;
    this.resultado.set(roteiro.resultado);
    return this.esperar(RESULTADO_MS);
  }

  /** Espera o tempo; fora da tela, a conversa para e continua quando a janela volta a aparecer. */
  private async esperar(ms: number): Promise<boolean> {
    await new Promise((resolver) => setTimeout(resolver, ms));
    if (!this.visivel && !this.encerrado) {
      await new Promise<void>((resolver) => (this.retomar = resolver));
    }
    return !this.encerrado;
  }

  private rolarParaBaixo(): void {
    requestAnimationFrame(() => {
      const area = this.rolagem().nativeElement;
      const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      area.scrollTo({ top: area.scrollHeight, behavior: suave ? 'smooth' : 'auto' });
    });
  }
}
