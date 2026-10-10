import { Injectable, computed, inject } from '@angular/core';

import { CONTEUDO_POR_RAMO } from '../constants/conteudo-por-ramo';
import { PerfilService } from './perfil.service';

/** Entrega os exemplos e sugestões do ramo atual da loja; muda sozinho se o ramo for editado. */
@Injectable({ providedIn: 'root' })
export class ConteudoRamoService {
  private readonly perfil = inject(PerfilService).perfil;

  readonly conteudo = computed(() => CONTEUDO_POR_RAMO[this.perfil().ramo]);

  /** Ex.: "Ex.: Olá! Que bom te ver aqui na Doce Ana 🎂" */
  readonly exemploSaudacao = computed(
    () => `Ex.: Olá! Que bom te ver aqui na ${this.perfil().nomeLoja} ${this.conteudo().emojiSaudacao}`,
  );
}
