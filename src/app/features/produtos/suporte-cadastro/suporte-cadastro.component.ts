import { ChangeDetectionStrategy, Component } from '@angular/core';

import { gerarLinkWhatsapp } from '../../../core/utils/texto.utils';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

/** O WhatsApp do suporte do DizAI para o cadastro da loja. */
const WHATSAPP_SUPORTE = '83988919553';
const MENSAGEM_SUPORTE = 'Olá, gostaria de auxílio individual para configurar o meu negócio';

/**
 * No fim da lista de produtos/serviços: quem está montando o cadastro pode pedir ajuda individual pelo WhatsApp do
 * suporte, com a mensagem pronta.
 */
@Component({
  selector: 'app-suporte-cadastro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconeComponent],
  template: `
    <span class="suporte__texto">Precisa de ajuda para cadastrar? A gente configura com você.</span>
    <a class="btn btn--secundario btn--pequeno suporte__botao" [href]="link" target="_blank" rel="noopener">
      <app-icone nome="headset" [tamanho]="16" [espessura]="2" />
      Suporte
    </a>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 10px 14px;
      margin-top: 18px;
      padding: 14px 0 4px;
      border-top: 1px dashed var(--cor-borda);
      text-align: center;
    }

    .suporte__texto {
      color: var(--cor-texto-suave);
      font-size: 14px;
    }

    .suporte__botao {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  `,
})
export class SuporteCadastroComponent {
  protected readonly link = `${gerarLinkWhatsapp(WHATSAPP_SUPORTE)}?text=${encodeURIComponent(MENSAGEM_SUPORTE)}`;
}
