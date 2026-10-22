import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { Foto } from '../../../core/models/galeria.model';
import { gerarLinkWhatsapp } from '../../../core/utils/texto.utils';
import { IconeComponent } from '../icone/icone.component';

/**
 * Foto ampliada sobre fundo escuro. Fecha no X, no Esc ou tocando fora da foto;
 * as setas (ou as teclas ← →) passam para as outras fotos do mesmo álbum.
 * O pai controla a exibição com `@if` e esconde ao receber `fechar`.
 */
@Component({
  selector: 'app-visualizador-foto',
  imports: [IconeComponent, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './visualizador-foto.component.html',
  styleUrl: './visualizador-foto.component.css',
  host: {
    '(document:keydown.escape)': 'fechar.emit()',
    '(document:keydown.arrowleft)': 'anterior()',
    '(document:keydown.arrowright)': 'proxima()',
  },
})
export class VisualizadorFotoComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly fotos = input.required<Foto[]>();
  readonly indiceInicial = input(0);
  /** Nome do álbum, usado na legenda e no texto alternativo. */
  readonly titulo = input('');
  /**
   * Galeria pública: com o WhatsApp e o slug da loja, aparece "Enviar pelo WhatsApp". A mensagem leva o link da
   * foto (/l/{slug}/foto/{id}), que no WhatsApp vira a prévia com a própria foto, sem o cliente tirar print.
   */
  readonly whatsappLoja = input('');
  readonly slugLoja = input('');
  readonly fechar = output<void>();

  protected readonly indice = signal(0);
  protected readonly fotoAtual = computed(() => this.fotos()[this.indice()]);
  protected readonly temVarias = computed(() => this.fotos().length > 1);
  protected readonly linkEnviar = computed(() => {
    const foto = this.fotoAtual();
    if (!this.whatsappLoja() || !this.slugLoja() || !foto || foto.id < 0) {
      return null;
    }
    const linkFoto = `${window.location.origin}/l/${this.slugLoja()}/foto/${foto.id}`;
    const topico = this.titulo() ? ` (${this.titulo()})` : '';
    const texto = `Olá! Gostei desta foto${topico}:\n${linkFoto}`;
    return `${gerarLinkWhatsapp(this.whatsappLoja())}?text=${encodeURIComponent(texto)}`;
  });

  private readonly botaoFechar = viewChild.required<ElementRef<HTMLButtonElement>>('botaoFechar');
  private overflowAnteriorDoBody = '';

  ngOnInit(): void {
    this.indice.set(this.indiceInicial());
  }

  ngAfterViewInit(): void {
    this.overflowAnteriorDoBody = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.botaoFechar().nativeElement.focus({ preventScroll: true });
  }

  ngOnDestroy(): void {
    document.body.style.overflow = this.overflowAnteriorDoBody;
  }

  protected anterior(): void {
    const total = this.fotos().length;
    this.indice.update((atual) => (atual - 1 + total) % total);
  }

  protected proxima(): void {
    this.indice.update((atual) => (atual + 1) % this.fotos().length);
  }
}
