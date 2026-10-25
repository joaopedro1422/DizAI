import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, output, signal } from '@angular/core';

import { ESTILOS_COR, fundoDoDestaque } from '../../../core/constants/estilos-cor';
import { EstiloCor } from '../../../core/models/vitrine.model';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

/**
 * Estilo da cor de destaque (Normal, Metálico, Degradê, Vidro) com dropdown próprio: cada opção mostra uma amostra
 * pintada com a cor escolhida naquele estilo. Mesmo desenho do seletor de "Cor de fundo".
 */
@Component({
  selector: 'app-seletor-estilo-cor',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'fecharSeForFora($event)', '(keydown.escape)': 'aberto.set(false)' },
  template: `
    <button
      type="button"
      class="gatilho"
      [class.gatilho--aberto]="aberto()"
      aria-haspopup="listbox"
      [attr.aria-expanded]="aberto()"
      [attr.aria-label]="'Estilo da cor: ' + escolhido().nome"
      (click)="aberto.set(!aberto())"
    >
      <span class="amostra" [style.background]="pintura(escolhido().valor)" aria-hidden="true"></span>
      <span class="textos">
        <span class="textos__nome">{{ escolhido().nome }}</span>
        <span class="textos__descricao">{{ escolhido().descricao }}</span>
      </span>
      <span class="gatilho__seta" aria-hidden="true"><app-icone nome="setaBaixo" [tamanho]="16" [espessura]="2.4" /></span>
    </button>

    @if (aberto()) {
      <div class="lista" role="listbox" aria-label="Estilos da cor">
        @for (estilo of estilos; track estilo.valor) {
          @let marcado = estilo.valor === valor();
          <button type="button" role="option" class="opcao" [class.opcao--marcada]="marcado" [attr.aria-selected]="marcado" (click)="escolher(estilo.valor)">
            <span class="amostra" [style.background]="pintura(estilo.valor)" aria-hidden="true"></span>
            <span class="textos">
              <span class="textos__nome">{{ estilo.nome }}</span>
              <span class="textos__descricao">{{ estilo.descricao }}</span>
            </span>
            @if (marcado) {
              <span class="opcao__check"><app-icone nome="check" [tamanho]="15" [espessura]="2.6" /></span>
            }
          </button>
        }
      </div>
    }
  `,
  styles: `
    :host {
      position: relative;
      display: block;
    }

    .gatilho {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      min-height: 56px;
      padding: 6px 12px 6px 8px;
      border: 1px solid var(--cor-borda);
      border-radius: var(--raio-medio);
      background: var(--cor-fundo);
      color: var(--cor-texto);
      font: inherit;
      text-align: left;
      cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .gatilho:hover,
    .gatilho--aberto {
      border-color: var(--cor-primaria);
    }

    .gatilho--aberto {
      box-shadow: 0 0 0 3px var(--cor-primaria-clara);
    }

    .gatilho__seta {
      display: inline-flex;
      flex: none;
      margin-left: auto;
      color: var(--cor-texto-suave);
      transition: transform 0.15s ease;
    }

    .gatilho--aberto .gatilho__seta {
      transform: rotate(180deg);
    }

    /* a amostra é um "botão" da vitrine pintado no estilo */
    .amostra {
      flex: none;
      width: 52px;
      height: 34px;
      border-radius: 10px;
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
    }

    .textos {
      display: flex;
      flex: 1;
      min-width: 0;
      flex-direction: column;
      gap: 1px;
    }

    .textos__nome {
      font-size: 15px;
      font-weight: 700;
    }

    .textos__descricao {
      overflow: hidden;
      color: var(--cor-texto-suave);
      font-size: 12.5px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .lista {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      z-index: 20;
      display: flex;
      flex-direction: column;
      padding: 4px;
      border: 1px solid var(--cor-borda);
      border-radius: 14px;
      background: var(--cor-fundo);
      box-shadow: 0 14px 34px rgba(15, 23, 42, 0.16);
      animation: abrir 0.14s ease-out;
    }

    .opcao {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 54px;
      padding: 4px 10px 4px 6px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--cor-texto);
      font: inherit;
      text-align: left;
      cursor: pointer;
    }

    .opcao:hover {
      background: var(--cor-fundo-suave);
    }

    .opcao--marcada {
      background: var(--cor-primaria-clara);
    }

    .opcao__check {
      display: inline-flex;
      flex: none;
      color: var(--cor-primaria);
    }

    @keyframes abrir {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
    }
  `,
})
export class SeletorEstiloCorComponent {
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly valor = input.required<EstiloCor>();
  /** A cor de destaque escolhida ("#1E3A72"): as amostras são pintadas com ela. */
  readonly cor = input.required<string>();
  readonly escolher$ = output<EstiloCor>({ alias: 'escolher' });

  protected readonly estilos = ESTILOS_COR;
  protected readonly aberto = signal(false);
  protected readonly escolhido = computed(() => ESTILOS_COR.find((e) => e.valor === this.valor()) ?? ESTILOS_COR[0]);

  protected pintura(estilo: EstiloCor): string {
    return fundoDoDestaque(this.cor(), estilo);
  }

  protected escolher(estilo: EstiloCor): void {
    this.escolher$.emit(estilo);
    this.aberto.set(false);
  }

  /** Tocou fora do seletor: fecha a lista. */
  protected fecharSeForFora(evento: Event): void {
    if (this.aberto() && !this.elemento.nativeElement.contains(evento.target as Node)) {
      this.aberto.set(false);
    }
  }
}
