/** Tempo mínimo da abertura na tela, para a logo não "piscar" quando o app carrega rápido. */
const TEMPO_MINIMO_MS = 900;
const DURACAO_SAIDA_MS = 350;

/**
 * Tira a abertura estilo app nativo (div #abertura do index.html) quando a primeira tela fica pronta.
 * Fora do app instalado a abertura nem aparece, e esta função só remove o elemento escondido.
 */
export function encerrarAbertura(): void {
  const abertura = document.getElementById('abertura');
  if (!abertura) {
    return;
  }
  const espera = Math.max(0, TEMPO_MINIMO_MS - performance.now());
  setTimeout(() => {
    abertura.classList.add('abertura--saindo');
    setTimeout(() => abertura.remove(), DURACAO_SAIDA_MS);
  }, espera);
}

/** Registra o service worker (public/sw.js): ele só mostra as notificações push, sem cache de páginas. */
export function registrarServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  }
}
