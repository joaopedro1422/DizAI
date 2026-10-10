import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { IconeComponent } from '../icone/icone.component';

export interface IdeiaRamo {
  titulo: string;
  texto: string;
  /** Rótulo pequeno acima do título, ex.: a categoria. */
  etiqueta?: string;
}

/**
 * Lista de ideias prontas para o ramo da loja (produtos, perguntas...).
 * Tocar numa ideia abre o cadastro já preenchido, para o lojista só ajustar.
 */
@Component({
  selector: 'app-ideias-ramo',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ideias-ramo.component.html',
  styleUrl: './ideias-ramo.component.css',
})
export class IdeiasRamoComponent {
  readonly titulo = input.required<string>();
  readonly descricao = input('');
  readonly ideias = input.required<IdeiaRamo[]>();
  readonly rotuloAcao = input('Usar como modelo');
  readonly escolher = output<number>();
}
