import { Injectable, computed, signal } from '@angular/core';

/** Evento do Chrome que permite abrir o convite de instalação na hora certa (não é padrão do TypeScript). */
interface ConviteInstalacao extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    /** Guardado pelo script do index.html, que roda antes do Angular. */
    __dizaiConviteInstalacao?: ConviteInstalacao;
  }
}

export type ResultadoInstalacao = 'instalado' | 'recusado' | 'instrucoes-iphone' | 'indisponivel';

/**
 * Atalho do DizAI na tela do celular (PWA).
 * Android e Chrome: abre o convite nativo de instalação. iPhone: não existe convite, a tela mostra o passo a passo.
 */
@Injectable({ providedIn: 'root' })
export class InstalacaoAppService {
  private readonly convite = signal<ConviteInstalacao | null>(window.__dizaiConviteInstalacao ?? null);

  /** Aberto pelo atalho instalado (e não pelo navegador). */
  readonly instalado = signal(abertoComoApp());
  readonly ehIphone = ehIphoneOuIpad();

  /** Dá para instalar agora: o Chrome ofereceu o convite ou é iPhone (instalação manual). */
  readonly podeInstalar = computed(() => !this.instalado() && (this.convite() !== null || this.ehIphone));

  constructor() {
    window.addEventListener('beforeinstallprompt', (evento) => {
      evento.preventDefault();
      this.convite.set(evento as ConviteInstalacao);
    });
    window.addEventListener('appinstalled', () => {
      this.instalado.set(true);
      this.convite.set(null);
    });
  }

  async instalar(): Promise<ResultadoInstalacao> {
    const convite = this.convite();
    if (convite) {
      await convite.prompt();
      const { outcome } = await convite.userChoice;
      this.convite.set(null); // o convite só pode ser usado uma vez
      if (outcome === 'accepted') {
        this.instalado.set(true);
        return 'instalado';
      }
      return 'recusado';
    }
    return this.ehIphone && !this.instalado() ? 'instrucoes-iphone' : 'indisponivel';
  }
}

function abertoComoApp(): boolean {
  const iphone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iphone || window.matchMedia('(display-mode: standalone)').matches;
}

function ehIphoneOuIpad(): boolean {
  const agente = navigator.userAgent;
  // iPad novo se apresenta como Mac, mas tem tela de toque
  return /iphone|ipad|ipod/i.test(agente) || (/macintosh/i.test(agente) && navigator.maxTouchPoints > 1);
}
