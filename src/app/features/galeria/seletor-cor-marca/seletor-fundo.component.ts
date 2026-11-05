import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, output, signal } from '@angular/core';

import { CORES_MARCA } from '../../../core/constants/cores-marca';
import { CorFundoVitrine } from '../../../core/models/vitrine.model';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

/** Uma opção do "Cor de fundo": a cor que pinta a bolinha (null = sem cor, a bolinha mostra um risco). */
interface OpcaoFundo {
  valor: CorFundoVitrine;
  nome: string;
  cor: string | null;
}

/** Branco, os fundos claros de cada cor de destaque (com nome próprio), "Sem cor" e o tema escuro. */
export const OPCOES_FUNDO: OpcaoFundo[] = [
  { valor: 'BRANCO', nome: 'Branco', cor: '#ffffff' },
  ...CORES_MARCA.map((cor) => ({ valor: cor.valor, nome: cor.nomeFundo, cor: cor.fundo })),
  { valor: 'SEM_COR', nome: 'Sem cor (transparente)', cor: null },
  { valor: 'ESCURO', nome: 'Tema escuro (preto)', cor: '#0f0e0d' },
];

@Component({
  selector: 'app-seletor-fundo',
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
      [attr.aria-label]="'Cor de fundo: ' + escolhida().nome"
      (click)="aberto.set(!aberto())"
    >
      <span class="bolinha" [class.bolinha--sem-cor]="!escolhida().cor" [style.background]="escolhida().cor" aria-hidden="true"></span>
      <span class="gatilho__texto">{{ escolhida().nome }}</span>
      <span class="gatilho__seta" aria-hidden="true"><app-icone nome="setaBaixo" [tamanho]="16" [espessura]="2.4" /></span>
    </button>

    @if (aberto()) {
      <div class="lista" role="listbox" aria-label="Cores de fundo">
        <div class="lista__opcoes">
          @for (opcao of opcoes; track opcao.valor) {
            @let marcada = opcao.valor === valor();
            <button type="button" role="option" class="opcao" [class.opcao--marcada]="marcada" [attr.aria-selected]="marcada" (click)="escolher(opcao.valor)">
              <span class="bolinha" [class.bolinha--sem-cor]="!opcao.cor" [style.background]="opcao.cor" aria-hidden="true"></span>
              <span class="opcao__nome">{{ opcao.nome }}</span>
              @if (marcada) {
                <span class="opcao__check"><app-icone nome="check" [tamanho]="15" [espessura]="2.6" /></span>
              }
            </button>
          }
        </div>
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
      gap: 10px;
      width: 100%;
      min-height: 46px;
      padding: 0 12px;
      border: 1px solid var(--cor-borda);
      border-radius: var(--raio-medio);
      background: var(--cor-fundo);
      color: var(--cor-texto);
      font: inherit;
      font-size: 15px;
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

    .gatilho__texto {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .gatilho__seta {
      display: inline-flex;
      flex: none;
      color: var(--cor-texto-suave);
      transition: transform 0.15s ease;
    }

    .gatilho--aberto .gatilho__seta {
      transform: rotate(180deg);
    }

    /* os fundos são claros: a borda deixa a bolinha visível sobre o branco */
    .bolinha {
      flex: none;
      width: 22px;
      height: 22px;
      border: 1px solid #c9cfda;
      border-radius: 50%;
    }

    /* sem cor: branco com um risco na diagonal */
    .bolinha--sem-cor {
      background: linear-gradient(135deg, transparent 46%, #c0392b 46%, #c0392b 54%, transparent 54%), #ffffff;
    }

    .lista {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      z-index: 20;
      overflow: hidden;
      border: 1px solid var(--cor-borda);
      border-radius: 14px;
      background: var(--cor-fundo);
      box-shadow: 0 14px 34px rgba(15, 23, 42, 0.16);
      animation: abrir 0.14s ease-out;
    }

    .lista__opcoes {
      display: flex;
      flex-direction: column;
      max-height: 300px;
      overflow-y: auto;
      padding: 4px;
    }

    .opcao {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
      padding: 0 10px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--cor-texto);
      font: inherit;
      font-size: 14.5px;
      text-align: left;
      cursor: pointer;
    }

    .opcao:hover {
      background: var(--cor-fundo-suave);
    }

    .opcao--marcada {
      background: var(--cor-primaria-clara);
    }

    .opcao__nome {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
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
export class SeletorFundoComponent {
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly valor = input.required<CorFundoVitrine>();
  readonly escolher$ = output<CorFundoVitrine>({ alias: 'escolher' });

  protected readonly opcoes = OPCOES_FUNDO;
  protected readonly aberto = signal(false);
  protected readonly escolhida = computed(() => OPCOES_FUNDO.find((o) => o.valor === this.valor()) ?? OPCOES_FUNDO[0]);

  protected escolher(valor: CorFundoVitrine): void {
    this.escolher$.emit(valor);
    this.aberto.set(false);
  }

  /** Tocou fora do seletor: fecha a lista. */
  protected fecharSeForFora(evento: Event): void {
    if (this.aberto() && !this.elemento.nativeElement.contains(evento.target as Node)) {
      this.aberto.set(false);
    }
  }
}
