import { Directive, ElementRef, inject, signal } from '@angular/core';

/**
 * Foto que ainda não carregou: no lugar dela, um brilho que passa sobre um fundo translúcido no tom da página
 * (`.img-suave` em styles.css, o mesmo "esqueleto" da tela de posts, mais discreto). Quando a foto chega, ela entra
 * com um fade. Se falhar, o brilho para e fica o fundo translúcido.
 * Uso: <img appImagemSuave [src]="..." />
 */
@Directive({
  selector: 'img[appImagemSuave]',
  host: {
    class: 'img-suave',
    '[class.img-suave--pronta]': 'pronta()',
    '[class.img-suave--falhou]': 'falhou()',
    '(load)': 'pronta.set(true)',
    '(error)': 'falhou.set(true)',
  },
})
export class ImagemSuaveDirective {
  protected readonly pronta = signal(false);
  protected readonly falhou = signal(false);

  constructor() {
    // imagem que já estava no cache do navegador termina antes do (load) ser ligado
    const img = inject<ElementRef<HTMLImageElement>>(ElementRef).nativeElement;
    queueMicrotask(() => {
      if (img.complete && img.naturalWidth > 0) this.pronta.set(true);
    });
  }
}
