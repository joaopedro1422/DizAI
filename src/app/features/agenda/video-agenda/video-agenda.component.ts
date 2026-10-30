import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { exemplosDaAgenda } from '../../../core/constants/segmentos';
import { ConteudoRamoService } from '../../../core/services/conteudo-ramo.service';
import { CenaVideo, VideoTutorialComponent } from '../../../shared/components/video-tutorial/video-tutorial.component';

const CENAS: CenaVideo[] = [
  { nome: 'Boas-vindas', duracao: 6000 },
  { nome: 'Agendamento automático', duracao: 10000 },
  { nome: 'A IA marca na conversa', duracao: 11000 },
  { nome: 'Remarcar e cancelar', duracao: 11000 },
  { nome: 'Lembrete e confirmação', duracao: 10000 },
  { nome: 'Página de agendamento', duracao: 11000 },
  { nome: 'Do seu jeito', duracao: 6000 },
];

/** Vídeo explicativo da agenda, só para os ramos de serviço (cenas no template). */
@Component({
  selector: 'app-video-agenda',
  imports: [VideoTutorialComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-agenda.component.html',
  styleUrls: ['../../../shared/components/video-tutorial/cenas-video.css', './video-agenda.component.css'],
})
export class VideoAgendaComponent {
  readonly rotuloBotao = input('Entendi');
  readonly confirmar = output<void>();
  readonly fechar = output<void>();

  protected readonly cenas = CENAS;

  /** A loja, os horários e as conversas de exemplo, do segmento da loja (barbearia, salão...). */
  protected readonly exemplos = inject(ConteudoRamoService).exemplos;
  protected readonly agenda = computed(() => exemplosDaAgenda(this.exemplos()));
  protected readonly inicial = computed(() => this.exemplos().loja.charAt(0));
}
