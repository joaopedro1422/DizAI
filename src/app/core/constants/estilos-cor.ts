import type { EstiloCor } from '../models/vitrine.model';

/** Os estilos da cor de destaque, na ordem do seletor de "Personalizar vitrine". */
export const ESTILOS_COR: { valor: EstiloCor; nome: string; descricao: string }[] = [
  { valor: 'NORMAL', nome: 'Normal', descricao: 'Cor chapada, como sempre' },
  { valor: 'METALICO', nome: 'Metálico', descricao: 'Brilho de metal polido' },
  { valor: 'DEGRADE', nome: 'Degradê', descricao: 'Passagem suave entre dois tons' },
  { valor: 'VIDRO', nome: 'Vidro', descricao: 'Reflexo de luz no topo' },
];

/**
 * O `background` dos botões e etiquetas da vitrine para a cor de destaque (sempre escura) em cada estilo. Os tons
 * extras saem da própria cor: o texto branco continua legível em todos.
 */
export function fundoDoDestaque(hex: string, estilo: EstiloCor | null | undefined): string {
  switch (estilo) {
    case 'METALICO':
      return `linear-gradient(135deg, ${misturar(hex, '#000000', 0.25)} 0%, ${misturar(hex, '#ffffff', 0.38)} 26%, `
        + `${hex} 48%, ${misturar(hex, '#000000', 0.18)} 72%, ${misturar(hex, '#ffffff', 0.22)} 100%)`;
    case 'DEGRADE':
      return `linear-gradient(135deg, ${hex} 0%, ${girarMatiz(misturar(hex, '#ffffff', 0.12), 24)} 100%)`;
    case 'VIDRO':
      return `linear-gradient(180deg, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0.1) 46%, `
        + `rgba(255, 255, 255, 0) 50%), ${hex}`;
    default:
      return hex;
  }
}

/** Mistura duas cores "#rrggbb": peso 0 = a primeira, 1 = a segunda. */
function misturar(a: string, b: string, peso: number): string {
  const [r1, g1, b1] = paraRgb(a);
  const [r2, g2, b2] = paraRgb(b);
  return paraHex(r1 + (r2 - r1) * peso, g1 + (g2 - g1) * peso, b1 + (b2 - b1) * peso);
}

/** Gira o matiz da cor (em graus), mantendo a saturação e a luminosidade. */
function girarMatiz(hex: string, graus: number): string {
  const [r, g, b] = paraRgb(hex).map((c) => c / 255);
  const maximo = Math.max(r, g, b);
  const minimo = Math.min(r, g, b);
  const l = (maximo + minimo) / 2;
  const d = maximo - minimo;
  if (d === 0) return hex;   // cinza: não tem matiz para girar
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = maximo === r ? ((g - b) / d) % 6 : maximo === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + graus + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [rr, gg, bb] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return paraHex((rr + m) * 255, (gg + m) * 255, (bb + m) * 255);
}

function paraRgb(hex: string): [number, number, number] {
  const limpo = hex.replace('#', '').slice(0, 6);
  return [0, 2, 4].map((i) => parseInt(limpo.slice(i, i + 2), 16)) as [number, number, number];
}

function paraHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0')).join('');
}
