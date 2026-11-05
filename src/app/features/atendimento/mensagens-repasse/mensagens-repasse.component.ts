import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { ModoPedido } from '../../../core/models/perfil.model';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { FormularioConfiguracoes } from '../../painel/painel-formulario';

/** Textos de sempre (MensagensRepasse no backend): valem quando o campo fica vazio. */
const PADRAO_REPASSE = '1 Minuto!';
const PADRAO_SEM_RESPOSTA = 'Vou confirmar, 1 minuto';

interface LinhaMensagem {
  id: 'repasse' | 'sem-resposta';
  rotulo: string;
  padrao: string;
  exemplo: string;
  controle: FormControl<string>;
}

@Component({
  selector: 'app-mensagens-repasse',
  imports: [ReactiveFormsModule, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mensagens">
      <span class="mensagens__titulo">O que o cliente recebe quando a conversa passa para você</span>
      @for (linha of linhas(); track linha.id) {
        @let texto = linha.controle.value.trim() || linha.padrao;
        <div class="linha" [class.linha--aberta]="aberta() === linha.id">
          <div class="linha__resumo">
            <span class="linha__textos">
              <span class="linha__rotulo">{{ linha.rotulo }}</span>
              <span class="linha__texto">"{{ texto }}"</span>
            </span>
            <button type="button" class="linha__editar" [attr.aria-expanded]="aberta() === linha.id" (click)="alternar(linha.id)">
              @if (aberta() === linha.id) {
                Pronto
              } @else {
                <app-icone nome="editar" [tamanho]="14" [espessura]="2" />
                Editar
              }
            </button>
          </div>
          @if (aberta() === linha.id) {
            <div class="linha__campo">
              <input
                class="campo__entrada"
                type="text"
                maxlength="200"
                [formControl]="linha.controle"
                [placeholder]="'Ex.: ' + linha.exemplo"
                [attr.aria-label]="linha.rotulo"
              >
              <span class="linha__dica">
                Vazio, vale o padrão: "{{ linha.padrao }}".
                @if (linha.controle.value.trim()) {
                  <button type="button" class="linha__padrao" (click)="linha.controle.setValue('')">Voltar ao padrão</button>
                }
              </span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .mensagens {
      display: flex;
      flex-direction: column;
      margin-top: 6px;
      border-top: 1px solid var(--cor-borda-suave);
    }

    .mensagens__titulo {
      padding: 14px 0 4px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--cor-texto-suave);
    }

    .linha {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px 0;
    }

    .linha + .linha {
      border-top: 1px solid var(--cor-borda-suave);
    }

    .linha__resumo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .linha__textos {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .linha__rotulo {
      font-size: 13px;
      font-weight: 700;
    }

    .linha__texto {
      overflow: hidden;
      font-size: 13.5px;
      color: var(--cor-texto-suave);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .linha--aberta .linha__texto {
      display: none;
    }

    .linha__editar,
    .linha__padrao {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      flex: none;
      padding: 6px 4px;
      border: none;
      background: none;
      color: var(--cor-primaria);
      font: inherit;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }

    .linha__padrao {
      padding: 0;
      margin-left: 6px;
      font-size: 12px;
    }

    .linha__campo {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .linha__dica {
      font-size: 12px;
      color: var(--cor-texto-suave);
    }
  `,
})
export class MensagensRepasseComponent {
  readonly formulario = input.required<FormularioConfiguracoes>();
  /** Só ENCAMINHAR_AO_DONO e COLETAR_DADOS passam o pedido para o dono (a tela só mostra este bloco nesses modos). */
  readonly modo = input.required<ModoPedido>();

  protected readonly aberta = signal<LinhaMensagem['id'] | null>(null);

  protected readonly linhas = computed<LinhaMensagem[]>(() => {
    const controles = this.formulario().controls;
    const coleta = this.modo() === 'COLETAR_DADOS';
    return [
      {
        id: 'repasse',
        rotulo: coleta ? 'Ao anotar o pedido' : 'Ao chamar você',
        padrao: PADRAO_REPASSE,
        exemplo: coleta ? '1 minuto, aguarde a confirmação' : 'Já chamo o responsável, 1 minuto',
        controle: coleta ? controles.mensagemRepassePedido : controles.mensagemRepasseNaHora,
      },
      {
        id: 'sem-resposta',
        rotulo: 'Quando não souber responder',
        padrao: PADRAO_SEM_RESPOSTA,
        exemplo: 'Vou conferir com o responsável, 1 minuto',
        controle: controles.mensagemSemResposta,
      },
    ];
  });

  protected alternar(id: LinhaMensagem['id']): void {
    this.aberta.update((atual) => (atual === id ? null : id));
  }
}
