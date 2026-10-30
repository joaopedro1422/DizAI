import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';

import { exemplosDeProdutos, listaEmTexto } from '../../../core/constants/segmentos';
import { ConteudoRamoService } from '../../../core/services/conteudo-ramo.service';
import { CenaVideo, VideoTutorialComponent } from '../../../shared/components/video-tutorial/video-tutorial.component';

const CENAS: CenaVideo[] = [
  { nome: 'O cadastro', duracao: 7000 },
  { nome: 'Variações de preço', duracao: 10000 },
  { nome: 'Opções que o cliente escolhe', duracao: 11000 },
  { nome: 'Na conversa', duracao: 10000 },
  { nome: 'Adicional que muda com o tamanho', duracao: 10000 },
  { nome: 'Várias opções, mesmo preço', duracao: 10000 },
  { nome: 'As escolhas na conversa', duracao: 10000 },
  { nome: 'Pronto', duracao: 5000 },
];

/**
 * Tutorial do formulário de produto (lojas de produtos), na primeira vez que o lojista abre "Novo produto": o que
 * são as variações de preço e as opções, quando usar cada uma, adicional que muda com o tamanho (um produto por
 * tamanho) e itens genéricos com o mesmo preço (preço da unidade + uma opção). Os exemplos seguem o segmento da loja.
 */
@Component({
  selector: 'app-guia-cadastro',
  imports: [VideoTutorialComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './guia-cadastro.component.html',
  styleUrls: ['../../../shared/components/video-tutorial/cenas-video.css', './guia-cadastro.component.css'],
})
export class GuiaCadastroComponent {
  readonly confirmar = output<void>();
  readonly fechar = output<void>();

  protected readonly cenas = CENAS;

  /** Os exemplos das cenas, do segmento da loja (bolos, salgados, roupas...). */
  protected readonly exemplos = inject(ConteudoRamoService).exemplos;
  protected readonly produtos = computed(() => exemplosDeProdutos(this.exemplos()));
  protected readonly inicial = computed(() => this.exemplos().loja.charAt(0));
  protected readonly listaDeValores = listaEmTexto;
}
