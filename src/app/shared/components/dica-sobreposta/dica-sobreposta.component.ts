import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  input,
  output,
  viewChild,
} from '@angular/core';

import { IconeComponent } from '../icone/icone.component';
import { NomeIcone } from '../icone/icones';

export interface ItemDica {
  icone: NomeIcone;
  titulo: string;
  texto: string;
}

let proximoIdDica = 0;

/**
 * Janela de orientação com fundo escurecido, no mesmo visual do tour do painel.
 * O pai controla a exibição com `@if` e esconde ao receber `confirmar`.
 */
@Component({
  selector: 'app-dica-sobreposta',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dica-sobreposta.component.html',
  styleUrl: './dica-sobreposta.component.css',
  host: {
    '(document:keydown.escape)': 'aoPressionarEsc()',
  },
})
export class DicaSobrepostaComponent implements AfterViewInit, OnDestroy {
  readonly titulo = input.required<string>();
  readonly icone = input<NomeIcone>('lampada');
  /** Linha curta acima do título, ex.: "Boas-vindas ao DizAI". */
  readonly sobretitulo = input('');
  readonly descricao = input('');
  readonly itens = input<ItemDica[]>([]);
  readonly rotuloBotao = input('Entendi');
  /** Segundo botão, só texto (ex.: "Agora não"). Vazio = sem o botão. */
  readonly rotuloSecundario = input('');
  readonly confirmar = output<void>();
  readonly secundario = output<void>();

  protected readonly idTitulo = `dica-titulo-${++proximoIdDica}`;
  private readonly botao = viewChild.required<ElementRef<HTMLButtonElement>>('botao');
  private overflowAnteriorDoBody = '';

  ngAfterViewInit(): void {
    this.overflowAnteriorDoBody = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.botao().nativeElement.focus({ preventScroll: true });
  }

  /** Esc fecha pelo caminho mais leve: o botão secundário, quando existe. */
  protected aoPressionarEsc(): void {
    if (this.rotuloSecundario()) {
      this.secundario.emit();
    } else {
      this.confirmar.emit();
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = this.overflowAnteriorDoBody;
  }
}
