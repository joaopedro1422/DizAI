import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { SegmentoNegocio } from '../../../core/constants/segmentos';
import { ConteudoRamoService } from '../../../core/services/conteudo-ramo.service';
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

/** Os segmentos com fotos de exemplo de verdade; os outros mostram quadrinhos com o emoji do negócio. */
const FOTOS_DO_SEGMENTO: Partial<Record<SegmentoNegocio, { pasta: string; fotos: string[] }>> = {
  BOLOS_TORTAS: { pasta: 'bolos', fotos: ['03', '08', '05', '04', '06', '01'] },
  DOCES: { pasta: 'bolos', fotos: ['05', '04', '06', '03', '08', '01'] },
  MANICURE: { pasta: 'unhas', fotos: ['02', '03', '04', '05', '06', '07'] },
  CASA_DECORACAO: { pasta: 'cortinas', fotos: ['01', '02', '03', '04', '05', '06'] },
  REFORMAS_REPAROS: { pasta: 'eletricista', fotos: ['01', '02', '03', '04', '05', '06'] },
};

/** Vídeo explicativo da galeria (cenas no template); a loja, os tópicos e a conversa seguem o segmento da loja. */
@Component({
  selector: 'app-video-galeria',
  imports: [VideoTutorialComponent, NgTemplateOutlet],
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
  private readonly conteudoRamo = inject(ConteudoRamoService);
  protected readonly exemplos = this.conteudoRamo.exemplos;
  protected readonly inicial = computed(() => this.exemplos().loja.charAt(0));
  /** As fotos do segmento (vazio = quadrinhos com o emoji). */
  protected readonly fotos = computed(() => {
    const conjunto = FOTOS_DO_SEGMENTO[this.conteudoRamo.segmentoDosExemplos().valor];
    return conjunto ? conjunto.fotos.map((foto) => `${PASTA}/${conjunto.pasta}/${foto}.webp`) : [];
  });
  /** Quadrinhos no lugar das fotos (6, com o emoji do negócio em fundos claros alternados). */
  protected readonly quadrinhos = [0, 1, 2, 3, 4, 5];
  /** O cardápio em imagem só existe para doces e bolos. */
  protected readonly temCardapio = computed(() => ['BOLOS_TORTAS', 'DOCES'].includes(this.conteudoRamo.segmentoDosExemplos().valor));
}
