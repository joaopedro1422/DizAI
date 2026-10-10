import { ChangeDetectionStrategy, Component, OnDestroy, model, signal } from '@angular/core';

import { IconeComponent } from '../icone/icone.component';

/**
 * Área para escolher uma foto do aparelho, com pré-visualização e botão de remover.
 * O arquivo escolhido fica em `arquivo` (two-way: `[(arquivo)]`).
 */
@Component({
  selector: 'app-seletor-foto',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (previa(); as urlPrevia) {
      <div class="previa">
        <img class="previa__imagem" [src]="urlPrevia" alt="Foto escolhida">
        <button type="button" class="btn btn--secundario btn--pequeno previa__remover" (click)="remover()">
          Trocar foto
        </button>
      </div>
    } @else {
      <label class="area-tracejada seletor">
        <input class="somente-leitor-tela" type="file" accept="image/*" (change)="aoEscolherArquivo($event)">
        <app-icone nome="camera" [tamanho]="22" />
        {{ rotulo }}
      </label>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .seletor {
      min-height: 96px;
      cursor: pointer;
    }

    .seletor:focus-within {
      outline: 2px solid var(--cor-azul);
      outline-offset: 2px;
    }

    .previa {
      position: relative;
      height: 160px;
      overflow: hidden;
      border-radius: var(--raio-medio);
    }

    .previa__imagem {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .previa__remover {
      position: absolute;
      right: 10px;
      bottom: 10px;
    }
  `,
})
export class SeletorFotoComponent implements OnDestroy {
  readonly arquivo = model<File | null>(null);

  protected readonly rotulo = 'Adicionar foto (opcional)';
  protected readonly previa = signal<string | null>(null);

  protected aoEscolherArquivo(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const arquivo = campo.files?.[0] ?? null;
    this.liberarPrevia();
    this.arquivo.set(arquivo);
    this.previa.set(arquivo ? URL.createObjectURL(arquivo) : null);
  }

  protected remover(): void {
    this.liberarPrevia();
    this.arquivo.set(null);
  }

  ngOnDestroy(): void {
    this.liberarPrevia();
  }

  private liberarPrevia(): void {
    const urlAtual = this.previa();
    if (urlAtual) {
      URL.revokeObjectURL(urlAtual);
    }
    this.previa.set(null);
  }
}
