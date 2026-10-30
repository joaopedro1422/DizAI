import { Injectable, computed, inject } from '@angular/core';

import { CONTEUDO_POR_RAMO } from '../constants/conteudo-por-ramo';
import { segmentoDoPerfil, segmentoOuPadrao, segmentosDoRamo } from '../constants/segmentos';
import { PerfilService } from './perfil.service';

/**
 * Entrega os exemplos e sugestões da loja: os do segmento escolhido (barbearia, bolos...) por cima dos do ramo, e os
 * exemplos dos tutoriais. Muda sozinho se o ramo ou o segmento forem editados.
 */
@Injectable({ providedIn: 'root' })
export class ConteudoRamoService {
  private readonly perfil = inject(PerfilService).perfil;

  /** O segmento escolhido (null = nenhum, ou de outro ramo). */
  readonly segmento = computed(() => segmentoDoPerfil(this.perfil().ramo, this.perfil().segmento));
  /** As opções de segmento do ramo da loja (escolha no onboarding e em Dados da loja). */
  readonly segmentosDoRamo = computed(() => segmentosDoRamo(this.perfil().ramo));

  /** Placeholders e sugestões: os do segmento por cima dos do ramo (o termo do item e os títulos são do ramo). */
  readonly conteudo = computed(() => {
    const doRamo = CONTEUDO_POR_RAMO[this.perfil().ramo];
    const segmento = this.segmento();
    return segmento ? { ...doRamo, ...segmento.conteudo } : doRamo;
  });

  /** O segmento dos exemplos dos tutoriais: o escolhido ou, sem escolha, um negócio típico do ramo. */
  readonly segmentoDosExemplos = computed(() => segmentoOuPadrao(this.perfil().ramo, this.perfil().segmento));
  /** Exemplos dos tutoriais e das prévias do onboarding. */
  readonly exemplos = computed(() => this.segmentoDosExemplos().exemplos);

  /** Ex.: "Ex.: Olá! Que bom te ver aqui na Doce Ana 🎂" */
  readonly exemploSaudacao = computed(
    () => `Ex.: Olá! Que bom te ver aqui na ${this.perfil().nomeLoja} ${this.conteudo().emojiSaudacao}`,
  );
}
