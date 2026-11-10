/**
 * Capa pronta da vitrine: um degradê liso na diagonal, da cor de destaque da loja para um tom mais claro dela.
 * Sai do tamanho do cartão de compartilhamento (1200×630), então serve também para a prévia do link.
 * É desenhada no navegador e sobe como uma capa comum (uma imagem de verdade no armazenamento).
 */
const LARGURA = 1200;
const ALTURA = 630;

/** Imagem da capa como data URL (JPEG), para a prévia na tela. */
export function desenharCapaDegrade(hex: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = LARGURA;
  canvas.height = ALTURA;
  const contexto = canvas.getContext('2d');
  if (!contexto) {
    return '';
  }
  const cor = paraRgb(hex);

  // degradê liso na diagonal: a cor da loja no canto de cima e um tom mais claro dela embaixo
  const degrade = contexto.createLinearGradient(0, 0, LARGURA, ALTURA);
  degrade.addColorStop(0, css(cor));
  degrade.addColorStop(1, css(misturar(cor, BRANCO, 0.45)));
  contexto.fillStyle = degrade;
  contexto.fillRect(0, 0, LARGURA, ALTURA);

  return canvas.toDataURL('image/jpeg', 0.92);
}

/** A capa desenhada como arquivo, para subir no armazenamento como qualquer capa. */
export async function arquivoDaCapa(dataUrl: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], 'capa-degrade.jpg', { type: 'image/jpeg' });
}

type Rgb = [number, number, number];
const BRANCO: Rgb = [255, 255, 255];

function paraRgb(hex: string): Rgb {
  const limpo = hex.replace('#', '');
  const cheio = limpo.length === 3 ? limpo.split('').map((c) => c + c).join('') : limpo.slice(0, 6);
  return [0, 2, 4].map((i) => parseInt(cheio.slice(i, i + 2), 16)) as Rgb;
}

/** quanto: 0 = a cor original, 1 = o alvo. */
function misturar(cor: Rgb, alvo: Rgb, quanto: number): Rgb {
  return cor.map((canal, i) => Math.round(canal + (alvo[i] - canal) * quanto)) as Rgb;
}

function css([r, g, b]: Rgb): string {
  return `rgb(${r}, ${g}, ${b})`;
}
