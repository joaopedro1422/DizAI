import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { Sobre } from '../../../core/models/galeria.model';
import { IconeComponent } from '../icone/icone.component';

/**
 * O tópico "Sobre" na vitrine, nos 3 estilos (Clássico, Janela com selo, Capa com cartão). Também desenha as prévias
 * do painel (com `reservarFoto`, a foto que falta vira um espaço com ícone).
 */
@Component({
  selector: 'app-sobre-vitrine',
  imports: [NgTemplateOutlet, UrlImagemPipe, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #textos>
      @if (rotulo()) {
        <span class="sobre__rotulo">{{ rotulo() }}</span>
      }
      <h2 class="sobre__titulo" [id]="idTitulo()">{{ sobre().titulo }}</h2>
      @if (sobre().estilo === 'JANELA') {
        <span class="janela__traco" aria-hidden="true"></span>
      }
      <p class="sobre__texto">{{ sobre().texto }}</p>
    </ng-template>

    <ng-template #foto let-icone>
      @if (sobre().foto; as ref) {
        <img class="sobre__foto" [src]="ref | urlImagem" [alt]="'Foto de ' + sobre().titulo" loading="lazy">
      } @else {
        <span class="sobre__vazia" aria-hidden="true"><app-icone nome="imagem" [tamanho]="30" /></span>
      }
    </ng-template>

    <div class="sobre">
      @switch (sobre().estilo) {
        @case ('JANELA') {
          <div class="janela" [class.janela--sem-foto]="!comFoto()">
            @if (comFoto()) {
              <div class="janela__moldura">
                <div class="janela__arco"><ng-container [ngTemplateOutlet]="foto" /></div>
                @if (sobre().desde) {
                  <span class="janela__selo"><small>desde</small><b>{{ sobre().desde }}</b></span>
                }
              </div>
            }
            <div>
              @if (!comFoto() && sobre().desde) {
                <span class="janela__selo janela__selo--solto"><small>desde</small><b>{{ sobre().desde }}</b></span>
              }
              <ng-container [ngTemplateOutlet]="textos" />
            </div>
          </div>
        }
        @case ('CAPA') {
          <div class="capa">
            <div class="capa__foto" [class.capa__foto--cor]="!sobre().foto">
              @if (sobre().foto || reservarFoto()) {
                <ng-container [ngTemplateOutlet]="foto" />
              }
            </div>
            <div class="capa__cartao">
              <ng-container [ngTemplateOutlet]="textos" />
              @if (sobre().destaques.length) {
                <ul class="capa__destaques">
                  @for (destaque of sobre().destaques; track $index) {
                    <li>{{ destaque }}</li>
                  }
                </ul>
              }
            </div>
          </div>
        }
        @default {
          <div class="classico" [class.classico--sem-foto]="!comFoto()">
            @if (comFoto()) {
              <div class="classico__foto"><ng-container [ngTemplateOutlet]="foto" /></div>
            }
            <div>
              <ng-container [ngTemplateOutlet]="textos" />
              @if (sobre().assinatura) {
                <span class="sobre__assinatura">{{ sobre().assinatura }}</span>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styleUrl: './sobre-vitrine.component.css',
})
export class SobreVitrineComponent {
  readonly sobre = input.required<Sobre>();
  /** O nome do tópico, pequeno em cima do título ("Sobre nós"). */
  readonly rotulo = input('');
  readonly idTitulo = input<string | null>(null);
  /** Prévias do painel: sem foto, mostra o espaço dela com um ícone. */
  readonly reservarFoto = input(false);

  protected readonly comFoto = computed(() => !!this.sobre().foto || this.reservarFoto());
}
