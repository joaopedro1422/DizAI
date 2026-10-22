import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { CenaVideo, VideoTutorialComponent } from '../../../shared/components/video-tutorial/video-tutorial.component';

const CENAS: CenaVideo[] = [
  { nome: 'Boas-vindas', duracao: 6000 },
  { nome: 'Portfólio', duracao: 8000 },
  { nome: 'Catálogo em imagem', duracao: 8000 },
  { nome: 'Apresentação do negócio', duracao: 8000 },
  { nome: 'O assistente envia o link', duracao: 10000 },
  { nome: 'Personalizável', duracao: 9000 },
  { nome: 'Link na bio do Instagram', duracao: 9000 },
  { nome: 'Do seu jeito', duracao: 6000 },
];

/** Fotos de exemplo da landing (public/landing/galeria). */
const PASTA = '/landing/galeria';

/** Vídeo explicativo da galeria (cenas no template). */
@Component({
  selector: 'app-video-galeria',
  imports: [VideoTutorialComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-galeria.component.html',
  styleUrls: ['../../../shared/components/video-tutorial/cenas-video.css', './video-galeria.component.css'],
})
export class VideoGaleriaComponent {
  readonly rotuloBotao = input('Entendi');
  readonly confirmar = output<void>();
  readonly fechar = output<void>();

  protected readonly cenas = CENAS;
  protected readonly pasta = PASTA;
  protected readonly bolos = ['03', '08', '05', '04', '06', '01'].map((foto) => `${PASTA}/bolos/${foto}.webp`);
  protected readonly unhas = ['02', '03', '04', '05', '06', '07'].map((foto) => `${PASTA}/unhas/${foto}.webp`);
  protected readonly moveis = ['02', '03', '04', '05', '06', '07'].map((foto) => `${PASTA}/moveis/${foto}.webp`);
}
