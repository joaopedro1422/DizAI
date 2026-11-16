import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';

import { mensagemDoErro } from '../../../core/api/erro-api';
import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { ArmazenamentoFotosService } from '../../../core/services/armazenamento-fotos.service';
import { ToastService } from '../../../core/services/toast.service';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024;

/**
 * "Foto do modelo" do pedido (opcional): a imagem sobe na hora para `lojas/{pasta}/pedidos` e aqui fica só a
 * referência, que vai no pedido (`anexo`). Usado no "Pedido confirmado" do Chats e no "Registrar pedido".
 * enviando: true enquanto a imagem sobe (o modal não deixa salvar antes).
 */
@Component({
  selector: 'app-anexo-pedido',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CarregandoComponent, IconeComponent, UrlImagemPipe],
  template: `
    @if (anexo(); as referencia) {
      <div class="anexo">
        <img class="anexo__foto" [src]="referencia | urlImagem" alt="Foto anexada ao pedido" />
        <span class="anexo__texto">Imagem anexada</span>
        <button type="button" class="btn-icone btn-icone--sem-borda" aria-label="Remover a imagem" (click)="anexo.set(null)">
          <app-icone nome="fechar" [tamanho]="18" />
        </button>
      </div>
    } @else {
      <label class="anexar" [class.anexar--enviando]="enviando()">
        @if (enviando()) {
          <app-carregando modo="inline" [tamanho]="18" />
          Enviando a imagem…
        } @else {
          <app-icone nome="clipe" [tamanho]="18" [espessura]="2" />
          Anexar imagem
        }
        <input class="somente-leitor-tela" type="file" accept="image/*" [disabled]="enviando()" (change)="aoEscolher($event)">
      </label>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .anexar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 48px;
      border: 1px dashed var(--cor-borda-forte);
      border-radius: var(--raio-medio);
      background: var(--cor-fundo-tracejado);
      color: var(--cor-primaria);
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
    }

    .anexar:focus-within {
      outline: 2px solid var(--cor-primaria);
      outline-offset: 2px;
    }

    .anexar--enviando {
      color: var(--cor-texto-suave);
      cursor: progress;
    }

    .anexo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      border: 1px solid var(--cor-borda);
      border-radius: var(--raio-medio);
    }

    .anexo__foto {
      flex: none;
      width: 56px;
      height: 56px;
      border-radius: 10px;
      object-fit: cover;
    }

    .anexo__texto {
      flex: 1;
      font-size: 14px;
      font-weight: 600;
    }
  `,
})
export class AnexoPedidoComponent {
  readonly anexo = model<string | null>(null);
  readonly enviando = model(false);

  private readonly armazenamento = inject(ArmazenamentoFotosService);
  private readonly toastService = inject(ToastService);

  protected async aoEscolher(evento: Event): Promise<void> {
    const campo = evento.target as HTMLInputElement;
    const arquivo = campo.files?.[0];
    campo.value = ''; // permite escolher o mesmo arquivo de novo
    if (!arquivo) return;
    if (!arquivo.type.startsWith('image/')) {
      this.toastService.mostrar('Escolha um arquivo de imagem (JPG, PNG ou WEBP).');
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
      this.toastService.mostrar('A imagem é muito grande. Use uma de até 5 MB.');
      return;
    }
    this.enviando.set(true);
    try {
      const [referencia] = await this.armazenamento.enviar([arquivo], { tipo: 'PEDIDOS' });
      this.anexo.set(referencia);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível enviar a imagem. Tente de novo.'));
    } finally {
      this.enviando.set(false);
    }
  }
}
