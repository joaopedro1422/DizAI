import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { Album } from '../../../core/models/galeria.model';
import { pluralizar } from '../../../core/utils/colecao.utils';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { ItemMenuAcoes, MenuAcoesComponent } from '../../../shared/components/menu-acoes/menu-acoes.component';

type AcaoAlbum = 'excluir';

/** Fotos exibidas na prévia; a última vira "+N" quando há mais. */
const LIMITE_PREVIA = 8;

/** Card de um tópico da galeria com a prévia das fotos. */
@Component({
  selector: 'app-album-card',
  imports: [IconeComponent, MenuAcoesComponent, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './album-card.component.html',
  styleUrl: './album-card.component.css',
})
export class AlbumCardComponent {
  readonly album = input.required<Album>();
  readonly adicionarFotos = output<void>();
  readonly excluir = output<Album>();

  protected readonly itensMenu: ItemMenuAcoes<AcaoAlbum>[] = [
    { id: 'excluir', rotulo: 'Excluir tópico', icone: 'lixeira', perigo: true },
  ];

  /** O total vem do backend; `fotos` traz só a prévia. */
  protected readonly contagem = computed(() => pluralizar(this.album().quantidadeFotos, 'foto', 'fotos'));

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
