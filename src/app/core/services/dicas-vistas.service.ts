import { Injectable } from '@angular/core';

export type Dica = 'cadastro-produtos';

const PREFIXO_CHAVE = 'dizai:dica-vista:';

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

  marcarComoVista(dica: Dica): void {
    try {
      localStorage.setItem(PREFIXO_CHAVE + dica, 'sim');
    } catch {
      // Navegação privada ou armazenamento bloqueado: a dica só volta a aparecer.
    }
  }
}
