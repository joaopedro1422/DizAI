import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, output, signal } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';

/**
 * "Instruções obrigatórias" como uma lista de regras: cada regra num cartãozinho (editar e remover),
 * um campo para adicionar e as sugestões do ramo. Por baixo continua o mesmo texto, uma regra por linha.
 */
@Component({
  selector: 'app-regras-negocio',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (regras().length > 0) {
      <ul class="regras">
        @for (regra of regras(); track $index; let indice = $index) {
          <li class="regra">
            <app-icone nome="check" [tamanho]="15" [espessura]="2.6" class="regra__marca" />
            @if (editando() === indice) {
              <input
                #edicao
                class="regra__edicao"
                type="text"
                maxlength="300"
                [value]="regra"
                [attr.aria-label]="'Editar a regra ' + (indice + 1)"
                (keydown.enter)="$event.preventDefault(); salvarEdicao(indice, edicao.value)"
                (keydown.escape)="editando.set(null)"
                (blur)="salvarEdicao(indice, edicao.value)"
              >
            } @else {
              <button type="button" class="regra__texto" [attr.aria-label]="'Editar: ' + regra" (click)="editar(indice)">{{ regra }}</button>
            }
            <button type="button" class="regra__remover" [attr.aria-label]="'Remover a regra: ' + regra" (click)="remover(indice)">
              <app-icone nome="fechar" [tamanho]="15" [espessura]="2.2" />
            </button>
          </li>
        }
      </ul>
    }

    <div class="nova">
      <input
        #campo
        class="nova__campo"
        type="text"
        maxlength="300"
        [placeholder]="exemplo()"
        aria-label="Nova regra"
        [value]="nova()"
        (input)="nova.set(campo.value)"
        (keydown.enter)="$event.preventDefault(); adicionar(campo.value)"
      >
      <button type="button" class="btn btn--secundario nova__botao" aria-label="Adicionar regra" title="Adicionar regra" [disabled]="!nova().trim()" (click)="adicionar(campo.value)">
        <app-icone nome="mais" [tamanho]="20" [espessura]="2.2" />
      </button>
    </div>

    @if (sugestoesRestantes().length > 0) {
      <div class="sugestoes">
        <span class="rotulo-maiusculo">Regras comuns no seu ramo</span>
        <div class="sugestoes__lista">
          @for (sugestao of sugestoesRestantes(); track sugestao) {
            <button type="button" class="sugestao" (click)="adicionar(sugestao)">
              <app-icone nome="mais" [tamanho]="14" [espessura]="2.2" />
              {{ sugestao }}
            </button>
          }
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .regras {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .regra {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 6px 10px 12px;
      border: 1px solid var(--cor-borda-suave);
      border-radius: var(--raio-medio);
      background: #F6F8FC;
    }

    .regra__marca {
      flex: none;
      margin-top: 2px;
      color: var(--cor-primaria);
    }

    .regra__texto {
      flex: 1;
      min-width: 0;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--cor-texto);
      font: inherit;
      font-size: 14px;
      line-height: 1.45;
      text-align: left;
      overflow-wrap: anywhere;
      cursor: text;
    }

    .regra__edicao {
      flex: 1;
      min-width: 0;
      margin: -4px 0;
      padding: 4px 8px;
      border: 1px solid var(--cor-primaria);
      border-radius: var(--raio-pequeno);
      background: var(--cor-fundo);
      font: inherit;
      font-size: 14px;
      outline: none;
      box-shadow: 0 0 0 3px rgba(30, 58, 114, 0.15);
    }

    .regra__remover {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: 28px;
      height: 24px;
      margin-top: -2px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: var(--cor-texto-suave);
    }

    .regra__remover:hover {
      background: rgba(15, 23, 42, 0.06);
      color: var(--cor-erro);
    }

    .nova {
      display: flex;
      gap: 8px;
    }

    .nova__campo {
      flex: 1;
      min-width: 0;
      min-height: 44px;
      padding: 0 12px;
      border: 1px dashed var(--cor-borda-forte);
      border-radius: var(--raio-medio);
      background: var(--cor-fundo-tracejado);
      color: var(--cor-texto);
      font: inherit;
      font-size: 14px;
    }

    .nova__campo:focus {
      border-style: solid;
      border-color: var(--cor-primaria);
      outline: none;
      background: var(--cor-fundo);
      box-shadow: 0 0 0 3px rgba(30, 58, 114, 0.15);
    }

    /* só o "+": o campo fica com quase toda a largura */
    .nova__botao {
      flex: none;
      width: 44px;
      min-height: 44px;
      padding: 0;
    }

    .sugestoes {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .sugestoes__lista {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .sugestao {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      width: 100%;
      padding: 10px 12px;
      border: 1px dashed var(--cor-borda-forte);
      border-radius: var(--raio-pequeno);
      background: var(--cor-fundo);
      color: var(--cor-texto-secundario);
      font-size: 13px;
      line-height: 1.45;
      text-align: left;
      transition: border-color 0.15s ease, color 0.15s ease;
    }

    .sugestao:hover {
      border-color: var(--cor-primaria);
      color: var(--cor-primaria);
    }

    .sugestao app-icone {
      flex: none;
      margin-top: 2px;
      color: var(--cor-primaria);
    }
  `,
})
export class RegrasNegocioComponent {
  /** O texto salvo: uma regra por linha. */
  readonly texto = input.required<string>();
  readonly sugestoes = input<string[]>([]);
  readonly exemplo = input('Ex.: Não fazemos entregas aos domingos.');
  readonly mudou = output<string>();

  protected readonly nova = signal('');
  protected readonly editando = signal<number | null>(null);

  protected readonly regras = computed(() =>
    this.texto()
      .split('\n')
      .map((linha) => linha.trim())
      .filter((linha) => linha.length > 0),
  );

  protected readonly sugestoesRestantes = computed(() => {
    const atuais = this.regras().map((regra) => regra.toLowerCase());
    return this.sugestoes().filter((sugestao) => !atuais.includes(sugestao.toLowerCase()));
  });

  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Toque na regra: vira um campo já com o cursor, para corrigir na hora. */
  protected editar(indice: number): void {
    this.editando.set(indice);
    setTimeout(() => this.elemento.nativeElement.querySelector<HTMLInputElement>('.regra__edicao')?.focus());
  }

  protected adicionar(texto: string): void {
    const regra = texto.trim();
    if (!regra) {
      return;
    }
    this.emitir([...this.regras(), regra]);
    this.nova.set('');
  }

  protected remover(indice: number): void {
    this.editando.set(null);
    this.emitir(this.regras().filter((_, i) => i !== indice));
  }

  protected salvarEdicao(indice: number, texto: string): void {
    if (this.editando() !== indice) {
      return;   // o blur depois do Enter não salva duas vezes
    }
    this.editando.set(null);
    const regra = texto.trim();
    this.emitir(regra ? this.regras().map((atual, i) => (i === indice ? regra : atual)) : this.regras().filter((_, i) => i !== indice));
  }

  private emitir(regras: string[]): void {
    this.mudou.emit(regras.join('\n'));
  }
}
