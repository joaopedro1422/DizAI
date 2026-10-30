import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { ConteudoRamoService } from '../../../core/services/conteudo-ramo.service';
import { CenaVideo, VideoTutorialComponent } from '../../../shared/components/video-tutorial/video-tutorial.component';

export type TipoVideoPerguntas = 'produtos' | 'servicos';

const CENAS: CenaVideo[] = [
  { nome: 'Boas-vindas', duracao: 6000 },
  { nome: 'Como cadastrar', duracao: 9000 },
  { nome: 'Na conversa', duracao: 10000 },
  { nome: 'Quando o assistente não sabe', duracao: 11000 },
  { nome: 'Vira sugestão', duracao: 11000 },
  { nome: 'Do seu jeito', duracao: 6000 },
];

/** Vídeo explicativo da tela de perguntas frequentes (cenas no template). */
@Component({
  selector: 'app-video-perguntas',
  imports: [VideoTutorialComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-perguntas.component.html',
  styleUrls: ['../../../shared/components/video-tutorial/cenas-video.css', './video-perguntas.component.css'],
})
export class VideoPerguntasComponent {
  readonly tipo = input<TipoVideoPerguntas>('produtos');
  readonly rotuloBotao = input('Entendi');
  readonly confirmar = output<void>();
  readonly fechar = output<void>();

  protected readonly cenas = CENAS;
  /** A loja e as perguntas de exemplo, do segmento da loja (barbearia, bolos...). */
  private readonly exemplos = inject(ConteudoRamoService).exemplos;
  protected readonly exemplo = computed(() => {
    const exemplos = this.exemplos();
    return { ...exemplos.perguntas, loja: exemplos.loja, inicial: exemplos.loja.charAt(0) };
  });
}
