import { Injectable } from '@angular/core';

export type Dica = 'cadastro-produtos' | 'video-perguntas' | 'video-agenda' | 'video-chats' | 'video-atendimento';

const PREFIXO_CHAVE = 'dizai:dica-vista:';

/**
 * TESTE: com true, os vídeos explicativos abrem toda vez que a tela abre.
 * Para voltar a mostrar só na primeira visita, troque para false.
 */
export const VIDEOS_SEMPRE_ABERTOS = false;

/**
 * Lembra quais dicas de orientação o lojista já viu neste navegador.
 * Quando houver login, dá para guardar isso no perfil pelo backend.
 */
@Injectable({ providedIn: 'root' })
export class DicasVistasService {
  jaViu(dica: Dica): boolean {
    try {
      return localStorage.getItem(PREFIXO_CHAVE + dica) === 'sim';
    } catch {
      return false;
    }
  }

  /** O vídeo de uma tela abre na primeira visita (ou sempre, no modo de teste). */
  deveMostrarVideo(dica: Dica): boolean {
    return VIDEOS_SEMPRE_ABERTOS || !this.jaViu(dica);
  }

  marcarComoVista(dica: Dica): void {
    try {
      localStorage.setItem(PREFIXO_CHAVE + dica, 'sim');
    } catch {
      // Navegação privada ou armazenamento bloqueado: a dica só volta a aparecer.
    }
  }
}
