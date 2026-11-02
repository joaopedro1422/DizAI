/**
 * A cor principal da logo, tirada dos pixels da imagem no navegador (a logo já chega como data URL pelo backend,
 * então o canvas não fica "sujo" pelo CORS). Serve para as lojas em que a cor de destaque da vitrine não é a cor da
 * marca: muitas logos têm um fundo colorido (um círculo, um quadrado) com o desenho em branco.
 *
 * Conta: a imagem reduzida a 64×64; cada pixel opaco cai num "balde" de cor (4 bits por canal). Branco, quase branco
 * e cinza não contam como cor. Vale o balde colorido com mais pixels (com um bônus para cores mais vivas), se ele
 * tiver pelo menos 6% da logo; logo toda escura (preta, grafite) devolve esse escuro; logo só branca/cinza, null.
 */
const LADO = 64;
const MINIMO_COLORIDO = 0.06;

export async function corDaLogo(dataUrl: string): Promise<string | null> {
  const imagem = await carregar(dataUrl);
  if (!imagem) return null;
  const canvas = document.createElement('canvas');
  canvas.width = LADO;
  canvas.height = LADO;
  const contexto = canvas.getContext('2d', { willReadFrequently: true });
  if (!contexto) return null;
  contexto.drawImage(imagem, 0, 0, LADO, LADO);
  let pixels: Uint8ClampedArray;
  try {
    pixels = contexto.getImageData(0, 0, LADO, LADO).data;
  } catch {
    return null;   // imagem de outro domínio: o navegador não deixa ler
  }

  const coloridos = new Map<number, { soma: [number, number, number]; quantos: number; saturacao: number }>();
  let opacos = 0;
  let escuros = 0;
  const somaEscuros: [number, number, number] = [0, 0, 0];
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 160) continue;
    const [r, g, b] = [pixels[i], pixels[i + 1], pixels[i + 2]];
    opacos++;
    const maior = Math.max(r, g, b);
    const menor = Math.min(r, g, b);
    const saturacao = maior === 0 ? 0 : (maior - menor) / maior;
    if (maior < 70) {
      escuros++;
      somaEscuros[0] += r;
      somaEscuros[1] += g;
      somaEscuros[2] += b;
      continue;
    }
    if (saturacao < 0.22) continue;   // branco, creme claro, cinza
    const balde = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const atual = coloridos.get(balde) ?? { soma: [0, 0, 0] as [number, number, number], quantos: 0, saturacao: 0 };
    atual.soma[0] += r;
    atual.soma[1] += g;
    atual.soma[2] += b;
    atual.quantos++;
    atual.saturacao += saturacao;
    coloridos.set(balde, atual);
  }
  if (opacos === 0) return null;

  let melhor: { soma: [number, number, number]; quantos: number; saturacao: number } | null = null;
  let melhorNota = 0;
  for (const balde of coloridos.values()) {
    const nota = balde.quantos * (0.6 + balde.saturacao / balde.quantos);
    if (nota > melhorNota) {
      melhorNota = nota;
      melhor = balde;
    }
  }
  // juntando os baldes vizinhos do vencedor: a mesma cor com sombra/antisserrilhado conta junto
  if (melhor && somarVizinhos(coloridos, melhor) / opacos >= MINIMO_COLORIDO) {
    return hex(melhor.soma.map((c) => c / melhor!.quantos) as [number, number, number]);
  }
  if (escuros / opacos >= 0.25) {
    return hex(somaEscuros.map((c) => c / escuros) as [number, number, number]);
  }
  return null;
}

/** Quantos pixels têm uma cor parecida com a do balde vencedor (distância pequena no RGB). */
function somarVizinhos(
  baldes: Map<number, { soma: [number, number, number]; quantos: number }>,
  alvo: { soma: [number, number, number]; quantos: number },
): number {
  const [r, g, b] = alvo.soma.map((c) => c / alvo.quantos);
  let total = 0;
  for (const balde of baldes.values()) {
    const [r2, g2, b2] = balde.soma.map((c) => c / balde.quantos);
    if (Math.abs(r - r2) + Math.abs(g - g2) + Math.abs(b - b2) <= 60) total += balde.quantos;
  }
  return total;
}

/** As duas cores são quase a mesma (aí não vale a pena oferecer a da logo à parte). */
export function coresParecidas(a: string, b: string): boolean {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) < 70;
}

function rgb(cor: string): [number, number, number] {
  const limpo = cor.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(limpo.slice(i, i + 2), 16)) as [number, number, number];
}

function hex(cor: [number, number, number]): string {
  return '#' + cor.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');
}

function carregar(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolver) => {
    const imagem = new Image();
    imagem.onload = () => resolver(imagem);
    imagem.onerror = () => resolver(null);
    imagem.src = src;
  });
}
