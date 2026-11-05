import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { FotoCompartilhada } from '../../../core/models/loja-publica.model';
import { LojaPublicaService } from '../../../core/services/loja-publica.service';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';

@Component({
  selector: 'app-foto-compartilhada-page',
  imports: [CarregandoComponent, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="foto">
      @if (foto(); as atual) {
        <img class="foto__imagem" [src]="atual.url | urlImagem" [alt]="atual.legenda ?? 'Foto de ' + atual.nomeAlbum" />
      } @else if (erro()) {
        <p class="foto__aviso">Esta foto não está mais disponível.</p>
      } @else {
        <app-carregando texto="Abrindo a foto…" />
      }
    </main>
  `,
  styles: `
    .foto {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100dvh;
      padding: 16px;
      background: #111214;
    }

    .foto__imagem {
      display: block;
      max-width: 100%;
      max-height: calc(100dvh - 32px);
      border-radius: 8px;
      object-fit: contain;
    }

    .foto__aviso {
      color: #e5e7eb;
      font-size: 15px;
    }
  `,
})
export class FotoCompartilhadaPageComponent implements OnInit {
  readonly slug = input.required<string>();
  readonly fotoId = input.required<string>();

  private readonly lojaPublicaService = inject(LojaPublicaService);
  private readonly titulo = inject(Title);

  protected readonly foto = signal<FotoCompartilhada | null>(null);
  protected readonly erro = signal(false);

  async ngOnInit(): Promise<void> {
    try {
      const foto = await this.lojaPublicaService.buscarFoto(this.slug(), this.fotoId());
      this.foto.set(foto);
      this.titulo.setTitle(`${foto.nomeAlbum} · ${foto.nomeLoja}`);
    } catch {
      this.erro.set(true);
    }
  }
}
