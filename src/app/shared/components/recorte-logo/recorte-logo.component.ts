import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

/** O lado da logo recortada (o backend guarda a logo com até 640 px). */
const LADO_SAIDA = 640;
const ZOOM_MAXIMO = 4;

/**
 * Recorte da logo antes de enviar: a imagem num quadro quadrado com o círculo da vitrine por cima; o lojista arrasta
 * (dedo ou mouse) e dá zoom (controle, pinça ou roda do mouse). A imagem sempre cobre o quadro (nunca sobra espaço
 * vazio). "Usar esta logo" recorta no navegador e devolve um arquivo quadrado de 640 px (PNG continua PNG, para
 * manter o fundo transparente; o resto vira JPEG).
 */
@Component({
  selector: 'app-recorte-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="recorte" role="dialog" aria-modal="true" aria-labelledby="recorte-titulo">
      <div class="recorte__painel">
        <h2 class="recorte__titulo" id="recorte-titulo">Ajuste a sua logo</h2>
        <p class="recorte__dica">Arraste para posicionar e use o zoom. O círculo mostra como ela aparece na vitrine.</p>

        <div
          #area
          class="recorte__area"
          (pointerdown)="tocar($event)"
          (pointermove)="mover($event)"
          (pointerup)="soltar($event)"
          (pointercancel)="soltar($event)"
          (wheel)="rodar($event)"
        >
          @if (url(); as fonte) {
            <img
              class="recorte__imagem"
              [src]="fonte"
              alt=""
              draggable="false"
              [style.width.px]="larguraNatural()"
              [style.height.px]="alturaNatural()"
              [style.transform]="transformacao()"
              (load)="carregou($event)"
            />
          }
          <span class="recorte__mascara" aria-hidden="true"></span>
        </div>

        <label class="recorte__zoom">
          <span class="recorte__zoom-icone" aria-hidden="true">−</span>
          <input
            type="range"
            min="1"
            [max]="zoomMaximo"
            step="0.01"
            aria-label="Zoom da logo"
            [value]="zoom()"
            (input)="definirZoom(+$any($event.target).value)"
          />
          <span class="recorte__zoom-icone" aria-hidden="true">+</span>
        </label>

        <div class="recorte__botoes">
          <button type="button" class="btn btn--secundario" (click)="cancelado.emit()">Cancelar</button>
          <button type="button" class="btn btn--primario" [disabled]="!pronta() || recortando()" (click)="confirmar()">
            {{ recortando() ? 'Preparando…' : 'Usar esta logo' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './recorte-logo.component.css',
})
export class RecorteLogoComponent {
  readonly arquivo = input.required<File>();
  readonly recortado = output<File>();
  readonly cancelado = output<void>();

  protected readonly zoomMaximo = ZOOM_MAXIMO;
  private readonly area = viewChild.required<ElementRef<HTMLElement>>('area');

  protected readonly url = signal<string | null>(null);
  protected readonly larguraNatural = signal(0);
  protected readonly alturaNatural = signal(0);
  /** O lado do quadro na tela (medido; muda com a largura). */
  private readonly lado = signal(300);
  protected readonly zoom = signal(1);
  /** Onde fica o canto de cima à esquerda da imagem, no quadro. */
  private readonly x = signal(0);
  private readonly y = signal(0);
  protected readonly pronta = signal(false);
  protected readonly recortando = signal(false);

  /** A escala que faz a imagem cobrir o quadro (zoom 1). */
  private readonly escalaBase = computed(() => {
    const w = this.larguraNatural();
    const h = this.alturaNatural();
    return w && h ? Math.max(this.lado() / w, this.lado() / h) : 1;
  });
  private readonly escala = computed(() => this.escalaBase() * this.zoom());
  protected readonly transformacao = computed(
    () => `translate(${this.x()}px, ${this.y()}px) scale(${this.escala()})`,
  );

  /** Os dedos na tela (1 = arrastar, 2 = pinça). */
  private readonly ponteiros = new Map<number, { x: number; y: number }>();
  private distanciaPinca = 0;

  constructor() {
    const destruir = inject(DestroyRef);
    afterNextRender(() => {
      const url = URL.createObjectURL(this.arquivo());
      this.url.set(url);
      destruir.onDestroy(() => URL.revokeObjectURL(url));
      const elemento = this.area().nativeElement;
      const medir = () => {
        const novo = elemento.clientWidth;
        if (!novo || novo === this.lado()) return;
        // mantém o mesmo enquadramento ao mudar o tamanho do quadro
        const proporcao = novo / this.lado();
        this.lado.set(novo);
        this.x.update((v) => v * proporcao);
        this.y.update((v) => v * proporcao);
        this.limitar();
      };
      medir();
      const observador = new ResizeObserver(medir);
      observador.observe(elemento);
      destruir.onDestroy(() => observador.disconnect());
    });
  }

  protected carregou(evento: Event): void {
    const img = evento.target as HTMLImageElement;
    this.larguraNatural.set(img.naturalWidth);
    this.alturaNatural.set(img.naturalHeight);
    this.lado.set(this.area().nativeElement.clientWidth || this.lado());
    this.zoom.set(1);
    // começa centralizada
    this.x.set((this.lado() - img.naturalWidth * this.escala()) / 2);
    this.y.set((this.lado() - img.naturalHeight * this.escala()) / 2);
    this.pronta.set(true);
  }

  protected definirZoom(valor: number, centroX = this.lado() / 2, centroY = this.lado() / 2): void {
    const novo = Math.min(ZOOM_MAXIMO, Math.max(1, valor));
    const antes = this.escala();
    // o ponto embaixo do centro (ou dos dedos) continua no mesmo lugar
    const px = (centroX - this.x()) / antes;
    const py = (centroY - this.y()) / antes;
    this.zoom.set(novo);
    const depois = this.escala();
    this.x.set(centroX - px * depois);
    this.y.set(centroY - py * depois);
    this.limitar();
  }

  protected tocar(evento: PointerEvent): void {
    (evento.currentTarget as HTMLElement).setPointerCapture(evento.pointerId);
    this.ponteiros.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
    if (this.ponteiros.size === 2) this.distanciaPinca = this.distancia();
  }

  protected mover(evento: PointerEvent): void {
    const anterior = this.ponteiros.get(evento.pointerId);
    if (!anterior) return;
    evento.preventDefault();
    if (this.ponteiros.size === 1) {
      this.x.update((v) => v + evento.clientX - anterior.x);
      this.y.update((v) => v + evento.clientY - anterior.y);
      this.ponteiros.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
      this.limitar();
      return;
    }
    this.ponteiros.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
    const distancia = this.distancia();
    if (this.distanciaPinca > 0) {
      const caixa = this.area().nativeElement.getBoundingClientRect();
      const [a, b] = [...this.ponteiros.values()];
      this.definirZoom(
        this.zoom() * (distancia / this.distanciaPinca),
        (a.x + b.x) / 2 - caixa.left,
        (a.y + b.y) / 2 - caixa.top,
      );
    }
    this.distanciaPinca = distancia;
  }

  protected soltar(evento: PointerEvent): void {
    this.ponteiros.delete(evento.pointerId);
    this.distanciaPinca = this.ponteiros.size === 2 ? this.distancia() : 0;
  }

  protected rodar(evento: WheelEvent): void {
    evento.preventDefault();
    const caixa = this.area().nativeElement.getBoundingClientRect();
    this.definirZoom(this.zoom() * Math.exp(-evento.deltaY * 0.0015), evento.clientX - caixa.left, evento.clientY - caixa.top);
  }

  /** Recorta o quadro visível e devolve o arquivo quadrado. */
  protected async confirmar(): Promise<void> {
    const img = this.area().nativeElement.querySelector('img');
    if (!img || !this.pronta()) return;
    this.recortando.set(true);
    try {
      const s = this.escala();
      const ladoOrigem = this.lado() / s;
      const saida = Math.round(Math.min(LADO_SAIDA, ladoOrigem));
      const canvas = document.createElement('canvas');
      canvas.width = saida;
      canvas.height = saida;
      const contexto = canvas.getContext('2d')!;
      const png = this.arquivo().type === 'image/png';
      if (!png) {
        contexto.fillStyle = '#ffffff';
        contexto.fillRect(0, 0, saida, saida);
      }
      contexto.imageSmoothingQuality = 'high';
      contexto.drawImage(img, -this.x() / s, -this.y() / s, ladoOrigem, ladoOrigem, 0, 0, saida, saida);
      const tipo = png ? 'image/png' : 'image/jpeg';
      const blob = await new Promise<Blob | null>((resolver) => canvas.toBlob(resolver, tipo, 0.9));
      if (!blob) throw new Error('recorte vazio');
      this.recortado.emit(new File([blob], png ? 'logo.png' : 'logo.jpg', { type: tipo }));
    } finally {
      this.recortando.set(false);
    }
  }

  /** A imagem sempre cobre o quadro: não deixa sobrar espaço vazio em nenhum lado. */
  private limitar(): void {
    const s = this.escala();
    const minimoX = this.lado() - this.larguraNatural() * s;
    const minimoY = this.lado() - this.alturaNatural() * s;
    this.x.update((v) => Math.min(0, Math.max(minimoX, v)));
    this.y.update((v) => Math.min(0, Math.max(minimoY, v)));
  }

  private distancia(): number {
    const [a, b] = [...this.ponteiros.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  }
}
