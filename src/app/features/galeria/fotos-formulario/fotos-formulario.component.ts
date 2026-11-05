import { Component, OnDestroy, OnInit, computed, input, output, signal } from '@angular/core';

import { Album } from '../../../core/models/galeria.model';
import { pluralizar } from '../../../core/utils/colecao.utils';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

export interface FotosEscolhidas {
  albumId: number;
  arquivos: File[];
}

interface FotoSelecionada {
  arquivo: File;
  previa: string;
}

const MAXIMO_FOTOS_POR_ENVIO = 20;

@Component({
  selector: 'app-fotos-formulario',
  imports: [IconeComponent, CarregandoComponent],
  templateUrl: './fotos-formulario.component.html',
  styleUrl: './fotos-formulario.component.css',
})
export class FotosFormularioComponent implements OnInit, OnDestroy {
  readonly albuns = input.required<Album[]>();
  readonly albumInicialId = input<number | null>(null);
  readonly enviando = input(false);

  readonly salvo = output<FotosEscolhidas>();
  readonly novoTopico = output<void>();

  protected readonly albumSelecionadoId = signal<number | null>(null);
  protected readonly fotos = signal<FotoSelecionada[]>([]);
  protected readonly erro = signal('');

  protected readonly resumoSelecao = computed(() => {
    const total = this.fotos().length;
    return total === 0 ? 'Nenhuma selecionada' : pluralizar(total, 'selecionada', 'selecionadas');
  });

  protected readonly rotuloBotao = computed(() => {
    if (this.enviando()) {
      return 'Enviando fotos…';
    }
    const total = this.fotos().length;
    return total === 0 ? 'Adicionar fotos' : `Adicionar ${pluralizar(total, 'foto', 'fotos')}`;
  });

  protected readonly podeSalvar = computed(
    () => this.albumSelecionadoId() !== null && this.fotos().length > 0 && !this.enviando(),
  );

  ngOnInit(): void {
    this.albumSelecionadoId.set(this.albumInicialId());
  }

  ngOnDestroy(): void {
    this.fotos().forEach((foto) => URL.revokeObjectURL(foto.previa));
  }

  protected selecionarAlbum(albumId: number): void {
    this.albumSelecionadoId.set(albumId);
    this.erro.set('');
  }

  protected aoEscolherArquivos(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const arquivos = Array.from(campo.files ?? []).filter((arquivo) => arquivo.type.startsWith('image/'));
    campo.value = ''; // permite escolher o mesmo arquivo de novo

    const espacoDisponivel = MAXIMO_FOTOS_POR_ENVIO - this.fotos().length;
    if (arquivos.length > espacoDisponivel) {
      this.erro.set(`Envie no máximo ${MAXIMO_FOTOS_POR_ENVIO} fotos por vez.`);
    } else {
      this.erro.set('');
    }

    const novasFotos = arquivos
      .slice(0, Math.max(0, espacoDisponivel))
      .map((arquivo) => ({ arquivo, previa: URL.createObjectURL(arquivo) }));
    this.fotos.update((atuais) => [...atuais, ...novasFotos]);
  }

  protected removerFoto(fotoRemovida: FotoSelecionada): void {
    URL.revokeObjectURL(fotoRemovida.previa);
    this.fotos.update((atuais) => atuais.filter((foto) => foto !== fotoRemovida));
  }

  protected salvar(): void {
    const albumId = this.albumSelecionadoId();
    if (albumId === null) {
      this.erro.set('Escolha o tópico das fotos.');
      return;
    }
    if (this.fotos().length === 0) {
      this.erro.set('Selecione pelo menos uma foto.');
      return;
    }
    this.salvo.emit({ albumId, arquivos: this.fotos().map((foto) => foto.arquivo) });
  }
}
