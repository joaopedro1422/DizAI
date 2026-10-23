/**
 * Sinal sonoro curto ("ding-dong") para avisar que chegou algo novo numa tela aberta (Agenda, Pedidos).
 * Gerado com a Web Audio API, sem arquivo de som.
 *
 * O navegador só deixa tocar som depois que a pessoa interage com a página (toque, clique ou tecla):
 * `prepararSinalSonoro` destrava o áudio na primeira interação. Sem nenhuma interação desde que a tela abriu,
 * o sinal não sai (limite do navegador).
 */
let contexto: AudioContext | null = null;
let preparado = false;

function obterContexto(): AudioContext | null {
  if (contexto) {
    return contexto;
  }
  const Construtor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Construtor) {
    return null;
  }
  contexto = new Construtor();
  return contexto;
}

/** Destrava o áudio na primeira interação com a página (pode ser chamada por várias telas). */
export function prepararSinalSonoro(): void {
  if (preparado) {
    return;
  }
  preparado = true;
  const destravar = () => {
    void obterContexto()?.resume().catch(() => undefined);
    window.removeEventListener('pointerdown', destravar);
    window.removeEventListener('keydown', destravar);
  };
  window.addEventListener('pointerdown', destravar);
  window.addEventListener('keydown', destravar);
}

/** Toca duas notas curtas e suaves. Falha em silêncio (navegador sem áudio ou ainda bloqueado). */
export function tocarSinalNovo(): void {
  const ctx = obterContexto();
  if (!ctx) {
    return;
  }
  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => undefined);
  }
  const agora = ctx.currentTime;
  nota(ctx, 880, agora, 0.18);
  nota(ctx, 1318.5, agora + 0.16, 0.3);
}

function nota(ctx: AudioContext, frequencia: number, inicio: number, duracao: number): void {
  const oscilador = ctx.createOscillator();
  const volume = ctx.createGain();
  oscilador.type = 'sine';
  oscilador.frequency.value = frequencia;
  volume.gain.setValueAtTime(0.0001, inicio);
  volume.gain.exponentialRampToValueAtTime(0.35, inicio + 0.02);
  volume.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
  oscilador.connect(volume).connect(ctx.destination);
  oscilador.start(inicio);
  oscilador.stop(inicio + duracao + 0.05);
}

/** Algum id da lista nova que não estava na anterior (ex.: agendamento ou pedido que chegou). */
export function chegouAlgoNovo(antes: readonly { id: string }[], depois: readonly { id: string }[]): boolean {
  const conhecidos = new Set(antes.map((item) => item.id));
  return depois.some((item) => !conhecidos.has(item.id));
}
