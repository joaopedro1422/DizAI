import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { exemplosDeProdutos, exemplosDeServicos, listaEmTexto } from '../../../core/constants/segmentos';
import { ConteudoRamoService } from '../../../core/services/conteudo-ramo.service';

import { CenaVideo, VideoTutorialComponent } from '../../../shared/components/video-tutorial/video-tutorial.component';

/** Produtos ou serviços: cada um tem o próprio roteiro de cenas. */
export type TipoVideoCadastro = 'produtos' | 'servicos';

/** As animações de cada cena estão no template; aqui só a ordem e o tempo de cada uma. */
const ROTEIROS: Record<TipoVideoCadastro, CenaVideo[]> = {
  produtos: [
    { nome: 'Boas-vindas', duracao: 6000 },
    { nome: 'O que cadastrar', duracao: 8000 },
    { nome: 'Dica 1: preço que muda com o tamanho', duracao: 10000 },
    { nome: 'Dica 2: produto genérico com sabores', duracao: 10000 },
    { nome: 'Dica 3: tamanhos e recheios juntos', duracao: 11000 },
    { nome: 'Descrição e opções', duracao: 11000 },
    { nome: 'Dica 4: antecedência por produto', duracao: 9000 },
    { nome: 'Do seu jeito', duracao: 6000 },
  ],
  servicos: [
    { nome: 'Boas-vindas', duracao: 6000 },
    { nome: 'O que cadastrar', duracao: 9000 },
    { nome: 'A duração do serviço', duracao: 10000 },
    { nome: 'Agenda automática', duracao: 11000 },
    { nome: 'Dica 1: preço que muda com o tipo', duracao: 10000 },
    { nome: 'Dica 2: escolhas do cliente', duracao: 11000 },
    { nome: 'Do seu jeito', duracao: 6000 },
  ],
};

/** Vídeo explicativo da tela de produtos/serviços (cenas em video-cadastro.component.html). */
@Component({
  selector: 'app-video-cadastro',
  imports: [VideoTutorialComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-cadastro.component.html',
  styleUrl: '../../../shared/components/video-tutorial/cenas-video.css',
})
export class VideoCadastroComponent {
  readonly tipo = input<TipoVideoCadastro>('produtos');
  /** Ex.: "produtos" ou "serviços". */
  readonly termoItens = input('produtos');
  readonly rotuloBotao = input('Entendi');
  readonly confirmar = output<void>();
  readonly fechar = output<void>();

  protected readonly cenas = computed(() => ROTEIROS[this.tipo()]);

  /** Os exemplos das cenas, do segmento da loja (barbearia, bolos...). */
  protected readonly exemplos = inject(ConteudoRamoService).exemplos;
  protected readonly produtos = computed(() => exemplosDeProdutos(this.exemplos()));
  protected readonly servicos = computed(() => exemplosDeServicos(this.exemplos()));
  protected readonly inicial = computed(() => this.exemplos().loja.charAt(0));
  protected readonly listaDeValores = listaEmTexto;
}
