import { MarcaPost, PaletaPost } from './tipos-post';

/**
 * As cores da arte, tiradas da cor de destaque da loja. Cada paleta vira variáveis CSS (--p-*) que todos os
 * layouts usam: fundo, texto, destaque (botões, selos) e o tom dos enfeites. O contraste é garantido aqui: cor muito
 * escura sobre fundo escuro (preto, grafite) ou muito clara sobre fundo claro troca por um tom que se lê.
 */

type Rgb = [number, number, number];

function paraRgb(hex: string): Rgb {
  const limpo = hex.replace('#', '').slice(0, 6);
  return [0, 2, 4].map((i) => parseInt(limpo.slice(i, i + 2), 16)) as Rgb;
}

function paraHex([r, g, b]: Rgb): string {
  return '#' + [r, g, b].map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0')).join('');
}

/** Mistura duas cores: peso 0 = a primeira, 1 = a segunda. */
export function misturar(a: string, b: string, peso: number): string {
  const [r1, g1, b1] = paraRgb(a);
  const [r2, g2, b2] = paraRgb(b);
  return paraHex([r1 + (r2 - r1) * peso, g1 + (g2 - g1) * peso, b1 + (b2 - b1) * peso]);
}

/** Luminância relativa (0 = preto, 1 = branco), a mesma conta do contraste da WCAG. */
export function luminancia(hex: string): number {
  const [r, g, b] = paraRgb(hex).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function rgba(hex: string, alfa: number): string {
  const [r, g, b] = paraRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alfa})`;
}

const TINTA_ESCURA = '#17130f';
const PAPEL = '#fffdfb';
const CREME = '#f4ede3';

/** As variáveis CSS da paleta para a cor da loja (`--p-fundo`, `--p-texto`, `--p-destaque`...). */
export function variaveisDaPaleta(paleta: PaletaPost, marca: MarcaPost): Record<string, string> {
  const cor = marca.cor;
  const clara = luminancia(cor) > 0.42;   // laranja, verde-limão: texto escuro em cima
  const escura = luminancia(cor) < 0.035; // preto, grafite: não aparece em fundo escuro
  const sobreCor = clara ? TINTA_ESCURA : '#ffffff';

  switch (paleta) {
    case 'cor':
      return {
        '--p-fundo': marca.preenchimento,
        '--p-fundo-solido': cor,
        '--p-fundo2': misturar(cor, clara ? '#ffffff' : '#000000', 0.18),
        '--p-texto': sobreCor,
        '--p-suave': clara ? rgba(TINTA_ESCURA, 0.72) : 'rgba(255, 255, 255, 0.8)',
        '--p-destaque': clara ? TINTA_ESCURA : '#ffffff',
        '--p-destaque-texto': clara ? '#ffffff' : (escura ? TINTA_ESCURA : cor),
        '--p-linha': clara ? rgba(TINTA_ESCURA, 0.28) : 'rgba(255, 255, 255, 0.4)',
        '--p-decor': clara ? rgba(TINTA_ESCURA, 0.12) : 'rgba(255, 255, 255, 0.14)',
        '--p-cartao': PAPEL,
        '--p-cartao-texto': TINTA_ESCURA,
        '--p-titulo': sobreCor,
      };
    case 'escura':
    case 'foto': {
      const fundo = misturar(cor, '#0c0b0a', escura ? 0.4 : 0.86);
      const destaque = escura ? '#ece4da' : misturar(cor, '#ffffff', luminancia(cor) < 0.08 ? 0.28 : 0.08);
      return {
        '--p-fundo': fundo,
        '--p-fundo-solido': fundo,
        '--p-fundo2': misturar(fundo, '#ffffff', 0.07),
        '--p-texto': '#f7f2ec',
        '--p-suave': 'rgba(247, 242, 236, 0.74)',
        '--p-destaque': escura ? destaque : marca.preenchimento,
        '--p-destaque-texto': escura || luminancia(destaque) > 0.42 ? TINTA_ESCURA : '#ffffff',
        '--p-linha': 'rgba(247, 242, 236, 0.28)',
        '--p-decor': escura ? 'rgba(236, 228, 218, 0.1)' : rgba(misturar(cor, '#ffffff', 0.35), 0.22),
        '--p-cartao': misturar(fundo, '#ffffff', 0.1),
        '--p-cartao-texto': '#f7f2ec',
        '--p-titulo': escura ? '#f7f2ec' : misturar(cor, '#ffffff', 0.72),
      };
    }
    case 'creme': {
      const fundo = misturar(CREME, cor, 0.035);
      return {
        '--p-fundo': fundo,
        '--p-fundo-solido': fundo,
        '--p-fundo2': misturar(fundo, cor, 0.1),
        '--p-texto': misturar(TINTA_ESCURA, cor, 0.12),
        '--p-suave': rgba(misturar(TINTA_ESCURA, cor, 0.12), 0.7),
        '--p-destaque': clara ? misturar(cor, '#000000', 0.25) : marca.preenchimento,
        '--p-destaque-texto': '#ffffff',
        '--p-linha': rgba(misturar(cor, TINTA_ESCURA, 0.3), 0.35),
        '--p-decor': rgba(cor, 0.14),
        '--p-cartao': PAPEL,
        '--p-cartao-texto': TINTA_ESCURA,
        '--p-titulo': clara ? misturar(cor, '#000000', 0.45) : misturar(cor, TINTA_ESCURA, 0.25),
      };
    }
    default: {
      // clara: o fundo é a cor da loja bem clarinha
      const fundo = misturar(cor, '#ffffff', 0.92);
      return {
        '--p-fundo': fundo,
        '--p-fundo-solido': fundo,
        '--p-fundo2': misturar(cor, '#ffffff', 0.8),
        '--p-texto': misturar(TINTA_ESCURA, cor, 0.18),
        '--p-suave': rgba(misturar(TINTA_ESCURA, cor, 0.18), 0.68),
        '--p-destaque': clara ? misturar(cor, '#000000', 0.25) : marca.preenchimento,
        '--p-destaque-texto': '#ffffff',
        '--p-linha': rgba(cor, 0.35),
        '--p-decor': rgba(cor, 0.16),
        '--p-cartao': PAPEL,
        '--p-cartao-texto': TINTA_ESCURA,
        '--p-titulo': clara ? misturar(cor, '#000000', 0.5) : misturar(cor, TINTA_ESCURA, 0.15),
      };
    }
  }
}
