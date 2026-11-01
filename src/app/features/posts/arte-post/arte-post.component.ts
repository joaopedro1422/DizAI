import { ChangeDetectionStrategy, Component, ElementRef, computed, input, viewChild } from '@angular/core';

import { luminancia, misturar, variaveisDaPaleta } from '../motor/paletas-post';
import { ConteudoPost, DIMENSOES, EstiloPost, FormatoPost, MarcaPost } from '../motor/tipos-post';

/**
 * A arte de um post, desenhada no tamanho real (1080 px de largura) e reduzida para a tela. A estrutura é uma só
 * (marca, mídia, texto, link); o layout, a paleta, o enfeite, o alinhamento, o filtro da foto e os cantos vêm do
 * EstiloPost em atributos data-* e o CSS (arte-*.css) reorganiza tudo. O mesmo elemento vira o PNG (exportar-post).
 */
@Component({
  selector: 'app-arte-post',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './arte-post.component.html',
  styleUrls: [
    './arte-base.css',
    './arte-decor.css',
    './arte-layouts-foto.css',
    './arte-layouts-foto-2.css',
    './arte-layouts-moldura.css',
    './arte-layouts-texto.css',
  ],
})
export class ArtePostComponent {
  readonly marca = input.required<MarcaPost>();
  readonly conteudo = input.required<ConteudoPost>();
  readonly estilo = input.required<EstiloPost>();
  readonly formato = input<FormatoPost>('feed');
  /** Largura em que a prévia aparece na tela (a arte continua com 1080 px por dentro). */
  readonly largura = input(320);

  private readonly arte = viewChild.required<ElementRef<HTMLElement>>('arte');

  protected readonly dimensoes = computed(() => DIMENSOES[this.formato()]);
  protected readonly escala = computed(() => this.largura() / this.dimensoes().largura);
  protected readonly alturaPrevia = computed(() => Math.round(this.dimensoes().altura * this.escala()));

  protected readonly variaveis = computed<Record<string, string>>(() => ({
    ...variaveisDaPaleta(this.estilo().paleta, this.marca()),
    '--fonte-titulo': this.marca().fonteTitulo,
    '--fonte-apoio': `'${this.estilo().fonteApoio}', system-ui, sans-serif`,
    '--cor-marca': this.marca().cor,
    // botões e selos sobre fundo claro (cartão): o preenchimento da loja (metálico, degradê...)
    '--preenchimento-marca': this.marca().preenchimento,
    // a cor da loja como texto sobre branco: escurecida quando é clara demais para ler
    '--cor-marca-escura': luminancia(this.marca().cor) > 0.42 ? misturar(this.marca().cor, '#000000', 0.45) : this.marca().cor,
  }));

  /** Só as fotos que o layout usa (a colagem usa 3, os outros 1). */
  protected readonly fotos = computed(() => {
    const fotos = this.conteudo().fotos;
    const limite = this.estilo().layout === 'colagem' ? 3 : 1;
    return ['tipografico'].includes(this.estilo().layout) ? [] : fotos.slice(0, limite);
  });

  /** O título encolhe com o tamanho do texto, para nunca passar da arte. */
  protected readonly tamanhoTitulo = computed(() => {
    const letras = this.conteudo().titulo.length;
    return letras <= 16 ? 'curto' : letras <= 30 ? 'medio' : 'longo';
  });

  protected readonly inicial = computed(() => this.marca().nome.trim().charAt(0).toUpperCase());
  protected readonly estrelas = computed(() => '★'.repeat(Math.max(1, Math.min(5, this.conteudo().depoimento?.estrelas ?? 5))));

  /** "R$ 80" nunca quebra entre o símbolo e o número. */
  protected semQuebra(texto: string): string {
    return texto.replace(/R\$\s+/g, 'R$\u00a0');
  }

  /** O elemento da arte em tamanho real, para virar imagem. */
  elemento(): HTMLElement {
    return this.arte().nativeElement;
  }
}
