import { ChangeDetectionStrategy, Component, ElementRef, computed, input, model, viewChild } from '@angular/core';

import { hojeIso, somarDias } from '../../../core/utils/datas-agenda';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { rotuloDoDia } from '../dias-pedidos';

/**
 * "Para quando é o pedido?": Hoje, Amanhã ou outra data (abre o calendário do aparelho). Usado no "Registrar pedido",
 * e no "Pedido confirmado" do Chats. O valor é "AAAA-MM-DD"; null = ainda não escolheu.
 * doResumo: o que a conversa disse sobre a data ("sábado, 21/11, às 10:00"), mostrado embaixo para conferir.
 */
@Component({
  selector: 'app-seletor-data-pedido',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconeComponent],
  template: `
    <div class="opcoes" role="radiogroup" [attr.aria-label]="rotulo()" [class.opcoes--erro]="erro()">
      <button type="button" role="radio" class="opcao" [class.opcao--ativa]="valor() === hoje" [attr.aria-checked]="valor() === hoje" (click)="valor.set(hoje)">
        Hoje
      </button>
      <button type="button" role="radio" class="opcao" [class.opcao--ativa]="valor() === amanha" [attr.aria-checked]="valor() === amanha" (click)="valor.set(amanha)">
        Amanhã
      </button>
      <button type="button" role="radio" class="opcao opcao--outra" [class.opcao--ativa]="outraData()" [attr.aria-checked]="outraData()" (click)="abrirCalendario()">
        <app-icone nome="calendario" [tamanho]="16" [espessura]="2" />
        {{ outraData() ? rotuloOutra() : 'Outra data' }}
      </button>
      <input
        #campoData
        class="data-nativa"
        type="date"
        tabindex="-1"
        aria-hidden="true"
        [min]="minimo"
        [value]="valor() ?? ''"
        (change)="aoEscolher($event)"
      />
    </div>
    @if (doResumo(); as texto) {
      <span class="da-conversa">
        <app-icone nome="conversa" [tamanho]="14" [espessura]="2" />
        Na conversa: <b>{{ texto }}</b>
      </span>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .opcoes {
      position: relative;
      display: grid;
      grid-template-columns: 1fr 1fr 1.5fr;
      gap: 8px;
    }

    .opcao {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-height: 46px;
      padding: 0 10px;
      border: 1.5px solid var(--cor-borda);
      border-radius: 14px;
      background: var(--cor-fundo);
      color: var(--cor-texto);
      font-size: 14.5px;
      font-weight: 600;
      white-space: nowrap;
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }

    .opcao:hover:not(.opcao--ativa) {
      border-color: var(--cor-borda-forte);
    }

    .opcao--ativa {
      border-color: var(--cor-primaria);
      background: var(--cor-primaria-clara);
      color: var(--cor-primaria);
      font-weight: 700;
    }

    .opcao--outra {
      color: var(--cor-primaria);
    }

    .opcoes--erro .opcao {
      border-color: var(--cor-erro);
    }

    /* o calendário do aparelho: o campo fica escondido embaixo da 3ª opção e abre pelo showPicker */
    .data-nativa {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
    }

    .da-conversa {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--cor-texto-suave);
      font-size: 13px;
    }

    .da-conversa b {
      color: var(--cor-texto);
    }
  `,
})
export class SeletorDataPedidoComponent {
  readonly valor = model<string | null>(null);
  readonly rotulo = input('Para quando é o pedido?');
  readonly doResumo = input<string | null>(null);
  readonly erro = input(false);

  protected readonly hoje = hojeIso();
  protected readonly amanha = somarDias(this.hoje, 1);
  protected readonly minimo = this.hoje;
  protected readonly outraData = computed(() => {
    const valor = this.valor();
    return !!valor && valor !== this.hoje && valor !== this.amanha;
  });
  protected readonly rotuloOutra = computed(() => rotuloDoDia(this.valor() ?? this.hoje, this.hoje));

  private readonly campoData = viewChild.required<ElementRef<HTMLInputElement>>('campoData');

  protected abrirCalendario(): void {
    const campo = this.campoData().nativeElement;
    try {
      campo.showPicker();
    } catch {
      campo.focus();
      campo.click();
    }
  }

  protected aoEscolher(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    if (valor) this.valor.set(valor);
  }
}
