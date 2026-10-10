import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output, signal } from '@angular/core';

import { IconeComponent } from '../icone/icone.component';
import { NomeIcone } from '../icone/icones';

export interface ItemMenuAcoes<T extends string = string> {
  id: T;
  rotulo: string;
  icone: NomeIcone;
  /** Ação destrutiva ou de saída, exibida em vermelho. */
  perigo?: boolean;
}

/**
 * Botão de três pontinhos que abre uma pequena lista de ações.
 * Fecha ao escolher um item, ao clicar fora ou ao apertar Esc.
 */
@Component({
  selector: 'app-menu-acoes',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-acoes.component.html',
  styleUrl: './menu-acoes.component.css',
  host: {
    '(document:click)': 'fecharAoClicarFora($event)',
    '(document:keydown.escape)': 'aberto.set(false)',
  },
})
export class MenuAcoesComponent<T extends string = string> {
  readonly itens = input.required<ItemMenuAcoes<T>[]>();
  readonly rotuloBotao = input('Mais opções');
  readonly escolher = output<T>();

  protected readonly aberto = signal(false);

  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  protected alternar(): void {
    this.aberto.update((aberto) => !aberto);
  }

  protected selecionar(item: ItemMenuAcoes<T>): void {
    this.aberto.set(false);
    this.escolher.emit(item.id);
  }

  protected fecharAoClicarFora(evento: MouseEvent): void {
    if (this.aberto() && !this.elemento.nativeElement.contains(evento.target as Node)) {
      this.aberto.set(false);
    }
  }
}
