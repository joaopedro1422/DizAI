import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, output, signal } from '@angular/core';

import { Produto } from '../../../core/models/produto.model';
import { formatarDuracao } from '../../../core/utils/datas-agenda';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

/** A partir de quantos serviços aparece a busca dentro da lista. */
const SERVICOS_PARA_BUSCA = 7;

@Component({
  selector: 'app-seletor-servico',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'fecharSeForFora($event)', '(keydown.escape)': 'aberto.set(false)' },
  template: `
    <button
      type="button"
      class="gatilho"
      [class.gatilho--aberto]="aberto()"
      [class.gatilho--vazio]="escolhidos().length === 0"
      aria-haspopup="listbox"
      [attr.aria-expanded]="aberto()"
      (click)="alternar()"
    >
      <span class="gatilho__icone" aria-hidden="true"><app-icone nome="brilho" [tamanho]="17" [espessura]="2" /></span>
      <span class="gatilho__texto">{{ texto() }}</span>
      @if (escolhidos().length > 0) {
        <span class="gatilho__duracao"><app-icone nome="relogio" [tamanho]="13" [espessura]="2" />{{ duracao(duracaoTotal()) }}</span>
      }
      <span class="gatilho__seta" aria-hidden="true"><app-icone nome="setaBaixo" [tamanho]="16" [espessura]="2.4" /></span>
    </button>

    @if (aberto()) {
      <div class="lista" role="listbox" [attr.aria-multiselectable]="multiplo()" aria-label="Serviços">
        @if (servicos().length >= buscaAPartirDe) {
          <label class="lista__busca">
            <app-icone nome="busca" [tamanho]="15" [espessura]="2" />
            <span class="somente-leitor-tela">Buscar serviço</span>
            <input type="search" placeholder="Buscar serviço" autocomplete="off" [value]="busca()" (input)="busca.set($any($event.target).value)">
          </label>
        }
        <div class="lista__opcoes">
          @for (servico of filtrados(); track servico.id) {
            @let marcado = escolhidos().includes(servico.id);
            <button type="button" role="option" class="opcao" [class.opcao--marcada]="marcado" [attr.aria-selected]="marcado" (click)="escolher(servico)">
              <span class="opcao__marca" aria-hidden="true">
                @if (marcado) {
                  <app-icone nome="check" [tamanho]="13" [espessura]="3" />
                }
              </span>
              <span class="opcao__nome">{{ servico.nome }}</span>
              <span class="opcao__duracao"><app-icone nome="relogio" [tamanho]="13" [espessura]="2" />{{ duracao(servico.duracaoMinutos ?? 0) }}</span>
            </button>
          } @empty {
            <span class="lista__vazio">Nenhum serviço encontrado.</span>
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
      min-height: 50px;
      padding: 0 12px 0 10px;
      border: 1.5px solid var(--cor-borda);
      border-radius: 14px;
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

    .gatilho__icone {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: 30px;
      height: 30px;
      border-radius: 9px;
      background: var(--cor-primaria-clara);
      color: var(--cor-primaria);
    }

    .gatilho__texto {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .gatilho--vazio .gatilho__texto {
      font-weight: 500;
      color: var(--cor-texto-suave);
    }

    .gatilho__duracao,
    .opcao__duracao {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      flex: none;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--cor-texto-suave);
      font-variant-numeric: tabular-nums;
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

    .lista {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      z-index: 20;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid var(--cor-borda);
      border-radius: 14px;
      background: var(--cor-fundo);
      box-shadow: 0 14px 34px rgba(15, 23, 42, 0.16);
      animation: abrir 0.14s ease-out;
    }

    .lista__busca {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 8px 4px;
      padding: 0 10px;
      border-radius: 10px;
      background: var(--cor-fundo-suave);
      color: var(--cor-texto-suave);
    }

    .lista__busca input {
      flex: 1;
      min-width: 0;
      min-height: 38px;
      border: none;
      background: transparent;
      color: var(--cor-texto);
      font: inherit;
      font-size: 14px;
      outline: none;
    }

    .lista__opcoes {
      display: flex;
      flex-direction: column;
      max-height: 264px;
      overflow-y: auto;
      padding: 4px;
    }

    .opcao {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 46px;
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

    .opcao__marca {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: 20px;
      height: 20px;
      border: 1.5px solid var(--cor-borda-forte);
      border-radius: 6px;
      color: #ffffff;
    }

    .opcao--marcada .opcao__marca {
      border-color: var(--cor-primaria);
      background: var(--cor-primaria);
    }

    .opcao__nome {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .lista__vazio {
      padding: 14px 10px;
      font-size: 13.5px;
      color: var(--cor-texto-suave);
    }

    @keyframes abrir {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
    }
  `,
})
export class SeletorServicoComponent {
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly servicos = input.required<Produto[]>();
  readonly escolhidos = input<number[]>([]);
  readonly multiplo = input(false);
  readonly textoVazio = input('Selecione o serviço');
  /** O serviço tocado (no múltiplo, quem chama marca ou desmarca). */
  readonly escolher$ = output<Produto>({ alias: 'escolher' });

  protected readonly aberto = signal(false);
  protected readonly busca = signal('');
  protected readonly buscaAPartirDe = SERVICOS_PARA_BUSCA;

  protected readonly selecionados = computed(() => this.servicos().filter((s) => this.escolhidos().includes(s.id)));
  protected readonly texto = computed(() => {
    const nomes = this.selecionados().map((s) => s.nome);
    return nomes.length === 0 ? this.textoVazio() : nomes.join(' + ');
  });
  protected readonly duracaoTotal = computed(() => this.selecionados().reduce((total, s) => total + (s.duracaoMinutos ?? 0), 0));
  protected readonly filtrados = computed(() => {
    const termo = simplificar(this.busca());
    return termo ? this.servicos().filter((s) => simplificar(s.nome).includes(termo)) : this.servicos();
  });

  protected alternar(): void {
    this.aberto.update((aberto) => !aberto);
    this.busca.set('');
  }

  protected escolher(servico: Produto): void {
    this.escolher$.emit(servico);
    if (!this.multiplo()) {
      this.aberto.set(false);
    }
  }

  protected duracao(minutos: number): string {
    return minutos > 0 ? formatarDuracao(minutos) : '—';
  }

  /** Tocou fora do seletor: fecha a lista. */
  protected fecharSeForFora(evento: Event): void {
    if (this.aberto() && !this.elemento.nativeElement.contains(evento.target as Node)) {
      this.aberto.set(false);
    }
  }
}

function simplificar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}
