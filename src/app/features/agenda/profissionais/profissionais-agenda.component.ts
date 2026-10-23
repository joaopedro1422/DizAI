import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { mensagemDoErro } from '../../../core/api/erro-api';
import { Profissional } from '../../../core/models/agenda.model';
import { AgendaService } from '../../../core/services/agenda.service';
import { ToastService } from '../../../core/services/toast.service';
import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { ArmazenamentoFotosService } from '../../../core/services/armazenamento-fotos.service';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

/**
 * Card "Quem atende" (Agenda → Configure): só o nome de cada profissional, sem login próprio. O primeiro é o dono.
 * Com um só, a agenda, a página pública e o assistente funcionam como sempre; com 2 ou mais, o cliente escolhe com
 * quem. Salva na hora (fora da barra "Salvar" dos horários).
 */
@Component({
  selector: 'app-profissionais-agenda',
  imports: [IconeComponent, CarregandoComponent, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="cartao">
      <div>
        <h2 class="cartao__titulo">Quem atende</h2>
        <p class="cartao__descricao">
          Com mais de um, o cliente escolhe com quem marcar. Os dias e horários valem para todos. Toque no círculo para pôr a foto.
        </p>
      </div>

      <ul class="lista">
        @for (profissional of profissionais(); track profissional.id) {
          <li class="profissional">
            <!-- foto: aparece no "Com quem?" da agenda online; toque para escolher ou trocar -->
            <label class="avatar" [class.avatar--enviando]="enviandoFoto() === profissional.id" [attr.aria-label]="'Foto de ' + profissional.nome" title="Trocar foto">
              <input class="somente-leitor-tela" type="file" accept="image/jpeg,image/png,image/webp" [disabled]="!!enviandoFoto()" (change)="escolherFoto(profissional, $event)">
              @if (enviandoFoto() === profissional.id) {
                <app-carregando modo="inline" [tamanho]="18" />
              } @else if (profissional.fotoUrl) {
                <img class="avatar__foto" [src]="profissional.fotoUrl | urlImagem" alt="">
              } @else {
                <span class="avatar__iniciais">{{ iniciais(profissional.nome) }}</span>
              }
              <span class="avatar__camera" aria-hidden="true"><app-icone nome="camera" [tamanho]="11" [espessura]="2.2" /></span>
            </label>
            @if (editando() === profissional.id) {
              <input
                #edicao
                class="campo__entrada profissional__edicao"
                type="text"
                maxlength="60"
                [value]="profissional.nome"
                aria-label="Nome do profissional"
                (keydown.enter)="$event.preventDefault(); renomear(profissional, edicao.value)"
                (keydown.escape)="editando.set(null)"
                (blur)="renomear(profissional, edicao.value)"
              >
            } @else {
              <button type="button" class="profissional__nome" [attr.aria-label]="'Trocar o nome de ' + profissional.nome" (click)="editando.set(profissional.id)">
                {{ profissional.nome }}
                @if (profissional.principal) {
                  <span class="profissional__selo">principal</span>
                }
              </button>
            }
            @if (!profissional.principal) {
              <button type="button" class="btn-icone btn-icone--sem-borda" [attr.aria-label]="'Remover ' + profissional.nome" [disabled]="ocupado()" (click)="remover(profissional)">
                <app-icone nome="lixeira" [tamanho]="17" />
              </button>
            }
          </li>
        }
      </ul>

      <div class="novo">
        <input
          #campo
          class="campo__entrada novo__campo"
          type="text"
          maxlength="60"
          placeholder="Nome do profissional"
          aria-label="Nome do novo profissional"
          [value]="novoNome()"
          (input)="novoNome.set(campo.value)"
          (keydown.enter)="$event.preventDefault(); adicionar()"
        >
        <button type="button" class="btn btn--secundario novo__botao" aria-label="Adicionar profissional" title="Adicionar profissional" [disabled]="!novoNome().trim() || ocupado()" (click)="adicionar()">
          @if (ocupado()) {
            <app-carregando modo="inline" [tamanho]="18" />
          } @else {
            <app-icone nome="mais" [tamanho]="20" [espessura]="2.2" />
          }
        </button>
      </div>
      <span class="campo__dica">Toque para alterar o nome</span>
    </section>
  `,
  styles: `
    /* mesmo card das outras seções de Configure (o CSS de lá não alcança este componente) */
    :host {
      display: block;
    }

    .cartao {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 16px;
      border: 1px solid var(--cor-borda-suave);
      border-radius: var(--raio-grande);
      background: var(--cor-fundo);
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04);
    }

    .cartao__titulo {
      font-size: 16px;
      font-weight: 700;
    }

    .cartao__descricao {
      margin-top: 4px;
      font-size: 13px;
      line-height: 1.5;
      color: var(--cor-texto-suave);
    }

    .cartao .campo__dica {
      margin-top: -6px;
    }

    .lista {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .profissional {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 4px 6px 6px;
      border: 1px solid var(--cor-borda-suave);
      border-radius: var(--raio-medio);
      background: var(--cor-fundo);
    }

    .profissional__nome {
      display: flex;
      flex: 1;
      align-items: center;
      gap: 8px;
      min-height: 40px;
      padding: 0;
      border: none;
      background: none;
      color: var(--cor-texto);
      font: inherit;
      font-size: 15px;
      font-weight: 600;
      text-align: left;
      cursor: text;
    }

    .avatar {
      position: relative;
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--cor-primaria-clara);
      color: var(--cor-primaria);
      cursor: pointer;
    }

    .avatar:focus-within {
      outline: 2px solid var(--cor-primaria);
      outline-offset: 2px;
    }

    .avatar__foto {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .avatar__iniciais {
      font-size: 14px;
      font-weight: 800;
    }

    .avatar__camera {
      position: absolute;
      right: -2px;
      bottom: -2px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border: 2px solid var(--cor-fundo);
      border-radius: 50%;
      background: var(--cor-primaria);
      color: #ffffff;
    }

    .profissional__selo {
      padding: 2px 8px;
      border-radius: var(--raio-pilula);
      background: var(--cor-primaria-clara);
      color: var(--cor-primaria);
      font-size: 11px;
      font-weight: 700;
    }

    .profissional__edicao {
      flex: 1;
      min-height: 40px;
    }

    .novo {
      display: flex;
      gap: 8px;
    }

    .novo__campo {
      flex: 1;
      min-width: 0;
    }

    .novo__botao {
      flex: none;
      width: 44px;
      min-height: 44px;
      padding: 0;
    }
  `,
})
export class ProfissionaisAgendaComponent {
  private readonly agendaService = inject(AgendaService);
  private readonly toastService = inject(ToastService);

  protected readonly profissionais = this.agendaService.profissionais;
  protected readonly novoNome = signal('');
  protected readonly editando = signal<string | null>(null);
  protected readonly ocupado = signal(false);
  /** id do profissional cuja foto está subindo. */
  protected readonly enviandoFoto = signal<string | null>(null);
  private readonly armazenamentoFotos = inject(ArmazenamentoFotosService);

  /** "Lucas Silva" -> "LS". */
  protected iniciais(nome: string): string {
    const partes = nome.trim().split(/\s+/);
    return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
  }

  /** Sobe a foto (lojas/{slug}/profissionais) e grava no profissional. */
  protected async escolherFoto(profissional: Profissional, evento: Event): Promise<void> {
    const entrada = evento.target as HTMLInputElement;
    const arquivo = entrada.files?.[0];
    entrada.value = '';
    if (!arquivo || this.enviandoFoto()) {
      return;
    }
    if (!/^image\/(jpeg|png|webp)$/.test(arquivo.type)) {
      this.toastService.mostrar('Use uma foto JPG, PNG ou WEBP.');
      return;
    }
    this.enviandoFoto.set(profissional.id);
    try {
      const [referencia] = await this.armazenamentoFotos.enviar([arquivo], { tipo: 'PROFISSIONAIS' });
      await this.agendaService.trocarFotoProfissional(profissional.id, referencia);
      this.toastService.mostrar(`Foto de ${profissional.nome} atualizada`);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível enviar a foto. Tente de novo.'));
    } finally {
      this.enviandoFoto.set(null);
    }
  }

  protected async adicionar(): Promise<void> {
    const nome = this.novoNome().trim();
    if (!nome || this.ocupado()) {
      return;
    }
    await this.executar(async () => {
      await this.agendaService.adicionarProfissional(nome);
      this.novoNome.set('');
      this.toastService.mostrar(`${nome} foi adicionado à agenda`);
    });
  }

  protected async renomear(profissional: Profissional, texto: string): Promise<void> {
    if (this.editando() !== profissional.id) {
      return;
    }
    this.editando.set(null);
    const nome = texto.trim();
    if (!nome || nome === profissional.nome) {
      return;
    }
    await this.executar(() => this.agendaService.renomearProfissional(profissional.id, nome));
  }

  protected async remover(profissional: Profissional): Promise<void> {
    await this.executar(async () => {
      await this.agendaService.removerProfissional(profissional.id);
      this.toastService.mostrar(`${profissional.nome} saiu da agenda`);
    });
  }

  private async executar(acao: () => Promise<void>): Promise<void> {
    this.ocupado.set(true);
    try {
      await acao();
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível salvar. Tente de novo.'));
    } finally {
      this.ocupado.set(false);
    }
  }
}
