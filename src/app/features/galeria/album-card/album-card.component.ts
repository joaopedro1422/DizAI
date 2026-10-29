import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { Album, Feedback } from '../../../core/models/galeria.model';
import { pluralizar } from '../../../core/utils/colecao.utils';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { MapaLojaComponent } from '../../../shared/components/mapa-loja/mapa-loja.component';
import { ItemMenuAcoes, MenuAcoesComponent } from '../../../shared/components/menu-acoes/menu-acoes.component';

type AcaoAlbum = 'excluir';
type AcaoFeedback = 'editar' | 'excluir';

/** Fotos exibidas na prévia; a última vira "+N" quando há mais. */
const LIMITE_PREVIA = 8;

/** Card de um tópico da galeria com a prévia das fotos. */
@Component({
  selector: 'app-album-card',
  imports: [IconeComponent, MenuAcoesComponent, UrlImagemPipe, MapaLojaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './album-card.component.html',
  styleUrl: './album-card.component.css',
})
export class AlbumCardComponent {
  readonly album = input.required<Album>();
  readonly adicionarFotos = output<void>();
  readonly excluir = output<Album>();
  /** Tópico de feedbacks: novo, editar e excluir um depoimento. */
  readonly adicionarFeedback = output<void>();
  readonly editarFeedback = output<Feedback>();
  readonly excluirFeedback = output<Feedback>();

  protected readonly ehFeedbacks = computed(() => this.album().tipo === 'FEEDBACKS');
  protected readonly ehLocalizacao = computed(() => this.album().tipo === 'LOCALIZACAO');
  /** "Como chegar": trocar o endereço do mapa. */
  readonly editarEndereco = output<void>();
  protected readonly itensMenuFeedback: ItemMenuAcoes<AcaoFeedback>[] = [
    { id: 'editar', rotulo: 'Editar', icone: 'editar' },
    { id: 'excluir', rotulo: 'Excluir', icone: 'lixeira', perigo: true },
  ];
  protected readonly estrelas = [1, 2, 3, 4, 5];

  /** "20/10/2026" a partir de "2026-10-20". */
  protected dataCurta(data: string | null): string {
    return data ? data.split('-').reverse().join('/') : '';
  }

  protected aoEscolherNoFeedback(acao: AcaoFeedback, feedback: Feedback): void {
    if (acao === 'editar') {
      this.editarFeedback.emit(feedback);
    } else {
      this.excluirFeedback.emit(feedback);
    }
  }

  protected readonly itensMenu: ItemMenuAcoes<AcaoAlbum>[] = [
    { id: 'excluir', rotulo: 'Excluir tópico', icone: 'lixeira', perigo: true },
  ];

  /** O total vem do backend; `fotos` traz só a prévia. */
  protected readonly contagem = computed(() =>
    this.ehLocalizacao()
      ? 'Mapa na vitrine'
      : this.ehFeedbacks()
      ? pluralizar(this.album().feedbacks.length, 'feedback', 'feedbacks')
      : pluralizar(this.album().quantidadeFotos, 'foto', 'fotos'),
  );

  private readonly temMaisFotosQueAPrevia = computed(() => this.album().quantidadeFotos > LIMITE_PREVIA);

  /** Fotos mostradas inteiras (reserva o último espaço para o "+N" quando precisa). */
  protected readonly fotosVisiveis = computed(() => {
    const limite = this.temMaisFotosQueAPrevia() ? LIMITE_PREVIA - 1 : LIMITE_PREVIA;
    return this.album().fotos.slice(0, limite);
  });

  protected readonly fotosRestantes = computed(() =>
    this.temMaisFotosQueAPrevia() ? this.album().quantidadeFotos - (LIMITE_PREVIA - 1) : 0,
  );

  protected aoEscolherAcao(acao: AcaoAlbum): void {
    if (acao === 'excluir') {
      this.excluir.emit(this.album());
    }
  }
}
