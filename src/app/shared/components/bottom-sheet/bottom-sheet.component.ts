import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  input,
  output,
} from '@angular/core';

import { IconeComponent } from '../icone/icone.component';

let proximoIdTitulo = 0;

/**
 * Modal que sobe da parte de baixo da tela (no celular) e fica centralizado no computador.
 * O pai controla a exibição com `@if` e fecha ao receber `fechar`.
 */
@Component({
  selector: 'app-bottom-sheet',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.css',
  host: {
    '(document:keydown.escape)': 'fechar.emit()',
  },
})
export class BottomSheetComponent implements AfterViewInit, OnDestroy {
  readonly titulo = input.required<string>();
  /** Cor de fundo da janela (ex.: a prévia do fundo da vitrine); null = o branco de sempre. */
  readonly fundo = input<string | null>(null);
  readonly fechar = output<void>();

  protected readonly idTitulo = `bottom-sheet-titulo-${++proximoIdTitulo}`;

  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private overflowAnteriorDoBody = '';

  ngAfterViewInit(): void {
    this.overflowAnteriorDoBody = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.focarPrimeiroCampo();
  }

  ngOnDestroy(): void {
    document.body.style.overflow = this.overflowAnteriorDoBody;
  }

  private focarPrimeiroCampo(): void {
    const primeiroCampo = this.elemento.nativeElement.querySelector<HTMLElement>(
      '.folha__conteudo input:not([type="file"]), .folha__conteudo textarea, .folha__conteudo button',
    );
    primeiroCampo?.focus();
  }
}
