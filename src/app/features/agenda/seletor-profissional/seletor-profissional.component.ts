import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, output, signal } from '@angular/core';

import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { Profissional } from '../../../core/models/agenda.model';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

@Component({
  selector: 'app-seletor-profissional',
  imports: [NgTemplateOutlet, IconeComponent, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'fecharSeForFora($event)', '(keydown.escape)': 'aberto.set(false)' },
  template: `
    <button
      type="button"
      class="gatilho"
      [class.gatilho--aberto]="aberto()"
      aria-haspopup="listbox"
      [attr.aria-expanded]="aberto()"
      aria-label="Profissional"
      (click)="aberto.set(!aberto())"
    >
      <ng-container *ngTemplateOutlet="avatar; context: { $implicit: escolhido() }" />
      <span class="gatilho__texto">{{ escolhido()?.nome ?? 'Todos os profissionais' }}</span>
      <span class="gatilho__seta" aria-hidden="true"><app-icone nome="setaBaixo" [tamanho]="16" [espessura]="2.4" /></span>
    </button>

    @if (aberto()) {
      <div class="lista" role="listbox" aria-label="Profissionais">
        <div class="lista__opcoes">
          @if (comTodos()) {
            <button type="button" role="option" class="opcao" [class.opcao--marcada]="!escolhido()" [attr.aria-selected]="!escolhido()" (click)="escolher(null)">
              <ng-container *ngTemplateOutlet="avatar; context: { $implicit: null }" />
              <span class="opcao__nome">Todos os profissionais</span>
              @if (!escolhido()) {
                <span class="opcao__check"><app-icone nome="check" [tamanho]="15" [espessura]="2.6" /></span>
              }
            </button>
          }
          @for (profissional of profissionais(); track profissional.id) {
            @let marcado = profissional.id === escolhido()?.id;
            <button type="button" role="option" class="opcao" [class.opcao--marcada]="marcado" [attr.aria-selected]="marcado" (click)="escolher(profissional.id)">
              <ng-container *ngTemplateOutlet="avatar; context: { $implicit: profissional }" />
              <span class="opcao__nome">{{ profissional.nome }}</span>
              @if (marcado) {
                <span class="opcao__check"><app-icone nome="check" [tamanho]="15" [espessura]="2.6" /></span>
              }
            </button>
          }
        </div>
      </div>
    }

    <!-- foto quadrada com cantos arredondados; sem foto, as iniciais; "Todos", o ícone de pessoas -->
    <ng-template #avatar let-profissional>
      @if (!profissional) {
        <span class="avatar avatar--todos" aria-hidden="true"><app-icone nome="pessoas" [tamanho]="16" [espessura]="2" /></span>
      } @else if (profissional.fotoUrl) {
        <img class="avatar" [src]="profissional.fotoUrl | urlImagem" alt="">
      } @else {
        <span class="avatar avatar--iniciais" aria-hidden="true">{{ iniciais(profissional.nome) }}</span>
      }
    </ng-template>
  `,
  styles: `
    :host {
      position: relative;
      display: block;
    }

    .gatilho {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      min-height: 50px;
      padding: 0 12px 0 10px;
      border: 1.5px solid var(--cor-borda);
      border-radius: 14px;
      background: var(--cor-fundo);
      color: var(--cor-texto);
      font: inherit;
      font-size: 15px;
      text-align: left;
      cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .gatilho:hover,
    .gatilho--aberto {
      border-color: var(--cor-primaria);
    }

    .gatilho--aberto {
      box-shadow: 0 0 0 3px var(--cor-primaria-clara);
    }

    .gatilho__texto {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .gatilho__seta {
      display: inline-flex;
      flex: none;
      color: var(--cor-texto-suave);
      transition: transform 0.15s ease;
    }

    .gatilho--aberto .gatilho__seta {
      transform: rotate(180deg);
    }

    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: 30px;
      height: 30px;
      border-radius: 9px;
      object-fit: cover;
    }

    .avatar--iniciais,
    .avatar--todos {
      background: var(--cor-primaria-clara);
      color: var(--cor-primaria);
      font-size: 12px;
      font-weight: 800;
    }

    .lista {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      z-index: 20;
      overflow: hidden;
      border: 1px solid var(--cor-borda);
      border-radius: 14px;
      background: var(--cor-fundo);
      box-shadow: 0 14px 34px rgba(15, 23, 42, 0.16);
      animation: abrir 0.14s ease-out;
    }

    .lista__opcoes {
      display: flex;
      flex-direction: column;
      max-height: 300px;
      overflow-y: auto;
      padding: 4px;
    }

    .opcao {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 48px;
      padding: 0 10px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--cor-texto);
      font: inherit;
      font-size: 14.5px;
      text-align: left;
      cursor: pointer;
    }

    .opcao:hover {
      background: var(--cor-fundo-suave);
    }

    .opcao--marcada {
      background: var(--cor-primaria-clara);
    }

    .opcao__nome {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .opcao__check {
      display: inline-flex;
      flex: none;
      color: var(--cor-primaria);
    }

    @keyframes abrir {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
    }
  `,
})
export class SeletorProfissionalComponent {
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly profissionais = input.required<Profissional[]>();
  /** O id escolhido; null = todos. */
  readonly escolhidoId = input<string | null>(null);
  readonly comTodos = input(true);
  readonly escolher$ = output<string | null>({ alias: 'escolher' });

  protected readonly aberto = signal(false);
  protected readonly escolhido = computed(() => this.profissionais().find((p) => p.id === this.escolhidoId()) ?? null);

  protected escolher(id: string | null): void {
    this.escolher$.emit(id);
    this.aberto.set(false);
  }

  /** "Lucas Silva" -> "LS". */
  protected iniciais(nome: string): string {
    const partes = nome.trim().split(/\s+/);
    return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
  }

  protected fecharSeForFora(evento: Event): void {
    if (this.aberto() && !this.elemento.nativeElement.contains(evento.target as Node)) {
      this.aberto.set(false);
    }
  }
}
