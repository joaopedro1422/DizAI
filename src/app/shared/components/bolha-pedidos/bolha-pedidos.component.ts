import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

import { SessaoService } from '../../../core/auth/sessao.service';
import { ConversaService } from '../../../core/services/conversa.service';
import { IconeComponent } from '../icone/icone.component';

/** De quanto em quanto tempo a bolha confere se chegou pedido novo (só com a aba visível). */
const CONFERIR_A_CADA_MS = 20_000;

@Component({
  selector: 'app-bolha-pedidos',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visivel()) {
      <button
        type="button"
        class="bolha"
        [class.bolha--nova]="pulsando()"
        [attr.aria-label]="rotulo()"
        [title]="rotulo()"
        (click)="abrirChats()"
        (animationend)="pulsando.set(false)"
      >
        <app-icone nome="conversa" [tamanho]="26" [espessura]="2" />
        <span class="bolha__selo" aria-hidden="true">{{ total() > 9 ? '9+' : total() }}</span>
      </button>
    }
  `,
  styles: `
    .bolha {
      position: fixed;
      right: 18px;
      bottom: calc(18px + env(safe-area-inset-bottom));
      z-index: 90;   /* abaixo dos bottom sheets (100) e dos avisos (300) */
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      padding: 0;
      border: none;
      border-radius: 50%;
      background: linear-gradient(150deg, var(--cor-primaria) 0%, #2c4f9e 100%);
      color: #ffffff;
      box-shadow: 0 10px 26px rgba(30, 58, 114, 0.38), 0 2px 6px rgba(15, 23, 42, 0.18);
      cursor: pointer;
      animation: bolha-entrada 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
      transition: transform 0.15s ease;
    }

    .bolha:hover {
      transform: scale(1.05);
    }

    .bolha:active {
      transform: scale(0.96);
    }

    .bolha:focus-visible {
      outline: 3px solid #f5b70a;
      outline-offset: 3px;
    }

    /* chegou pedido novo: um "pulo" e uma onda em volta */
    .bolha--nova {
      animation: bolha-pulo 0.9s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .bolha--nova::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(30, 58, 114, 0.45);
      animation: bolha-onda 0.9s ease-out;
    }

    .bolha__selo {
      position: absolute;
      top: -3px;
      right: -3px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      padding: 0 6px;
      border: 2.5px solid #ffffff;
      border-radius: 999px;
      background: #f5b70a;
      color: #3d2a00;
      font-size: 12px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }

    @media (min-width: 760px) {
      .bolha {
        right: 28px;
        bottom: 28px;
      }
    }

    @keyframes bolha-entrada {
      from {
        opacity: 0;
        transform: scale(0.6) translateY(12px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    @keyframes bolha-pulo {
      0% { transform: scale(1); }
      30% { transform: scale(1.14); }
      55% { transform: scale(0.96); }
      100% { transform: scale(1); }
    }

    @keyframes bolha-onda {
      to { box-shadow: 0 0 0 18px rgba(30, 58, 114, 0); }
    }

    @media (prefers-reduced-motion: reduce) {
      .bolha,
      .bolha--nova,
      .bolha--nova::after {
        animation: none;
      }
    }
  `,
})
export class BolhaPedidosComponent {
  private readonly router = inject(Router);
  private readonly sessao = inject(SessaoService);
  private readonly conversaService = inject(ConversaService);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      map((evento) => (evento as NavigationEnd).urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  private readonly noPainel = computed(() => !!this.sessao.perfilId() && /^\/painel\/[^/?#]+/.test(this.url()));
  private readonly noChats = computed(() => /^\/painel\/[^/?#]+\/chats/.test(this.url()));

  /** Conversas com resumo de pedido esperando o lojista ("Pronto para fechar"). */
  protected readonly total = computed(
    () => this.conversaService.aguardandoDono().filter((conversa) => conversa.motivoEspera === 'PRONTO_PARA_FECHAR').length,
  );
  protected readonly visivel = computed(() => this.noPainel() && !this.noChats() && this.total() > 0);
  protected readonly rotulo = computed(() =>
    this.total() === 1 ? '1 pedido esperando no Chats' : `${this.total()} pedidos esperando no Chats`,
  );
  /** Liga a animação quando o número sobe (pedido novo). */
  protected readonly pulsando = signal(false);
  private ultimoTotal = 0;

  constructor() {
    effect(() => {
      const total = this.total();
      if (total > this.ultimoTotal && this.ultimoTotal > 0) {
        this.pulsando.set(true);
      }
      this.ultimoTotal = total;
    });

    // confere ao entrar no painel, a cada 20 s e ao voltar para a aba (só dentro do painel e com a aba visível)
    const conferir = () => {
      if (this.noPainel() && !this.noChats() && !document.hidden) {
        this.conversaService.abrir().catch(() => undefined);
      }
    };
    effect(() => {
      if (this.noPainel()) {
        conferir();
      }
    });
    const intervalo = window.setInterval(conferir, CONFERIR_A_CADA_MS);
    document.addEventListener('visibilitychange', conferir);
    inject(DestroyRef).onDestroy(() => {
      window.clearInterval(intervalo);
      document.removeEventListener('visibilitychange', conferir);
    });
  }

  protected abrirChats(): void {
    void this.router.navigateByUrl(this.sessao.rotasDoPainel().chats);
  }
}
