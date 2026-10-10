import { Pipe, PipeTransform } from '@angular/core';

import { environment } from '../../../environments/environment';

/**
 * O banco guarda só a referência da imagem (ex.: "lojas/studio-bella/galeria/unhas-em-gel/{uuid}.jpg").
 * Para exibir, a referência vira o endereço de download do arquivo:
 * - com Firebase: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{referência}?alt=media
 *   (as regras do Storage liberam a leitura pública de lojas/**);
 * - sem Firebase (desenvolvimento): {apiUrl}/arquivos/{referência}, servido pelo backend.
 * Valores antigos que já são URLs completas passam direto.
 */
export function urlDaImagem(referencia: string | null | undefined): string | null {
  if (!referencia) {
    return null;
  }
  if (/^(https?:|blob:|data:)/.test(referencia)) {
    return referencia;
  }
  const bucket = environment.firebaseStorageBucket;
  return bucket
    ? `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(referencia)}?alt=media`
    : `${environment.apiUrl}/arquivos/${referencia}`;
}

/** Uso no template: <img [src]="foto.url | urlImagem"> */
@Pipe({ name: 'urlImagem' })
export class UrlImagemPipe implements PipeTransform {
  transform(referencia: string | null | undefined): string | null {
    return urlDaImagem(referencia);
  }
}
