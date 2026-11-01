import { DefinicaoLayout, LAYOUTS, layoutsPara } from './layouts-post';
import {
  DecorPost,
  EstiloPost,
  FiltroFoto,
  FonteApoio,
  LayoutPost,
  PaletaPost,
  RaioPost,
  TipoPost,
} from './tipos-post';

/**
 * O "diretor de arte" do gerador: sorteia as combinações (layout, paleta, enfeite, fontes, cantos, filtro da foto)
 * das opções de um post. Para duas lojas nunca receberem as mesmas artes, cada loja tem um DNA visual tirado do id
 * dela: a ordem preferida dos layouts, as paletas, os enfeites, os cantos e a fonte de apoio que mais combinam com
 * ela. O sorteio parte desse DNA (com uma pitada de acaso) e foge das combinações que a loja já viu.
 */

/** Gerador pseudoaleatório com semente (mulberry32): o mesmo número, a mesma sequência. */
function aleatorio(semente: number): () => number {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash FNV-1a de um texto (o id da loja vira a semente do DNA). */
export function hashTexto(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function embaralhar<T>(lista: readonly T[], sorte: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(sorte() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Sorteia um item com pesos (peso 0 nunca sai). */
function sortearComPeso<T>(itens: readonly T[], peso: (item: T) => number, sorte: () => number): T {
  const pesos = itens.map((item) => Math.max(0, peso(item)));
  const total = pesos.reduce((soma, p) => soma + p, 0);
  if (total <= 0) return itens[Math.floor(sorte() * itens.length)];
  let alvo = sorte() * total;
  for (let i = 0; i < itens.length; i++) {
    alvo -= pesos[i];
    if (alvo <= 0) return itens[i];
  }
  return itens[itens.length - 1];
}

const PALETAS: PaletaPost[] = ['clara', 'cor', 'escura', 'creme', 'foto'];
const DECORS: DecorPost[] = ['linhas', 'pontos', 'organico', 'brilhos', 'geometrico', 'faixas'];
const FILTROS: FiltroFoto[] = ['natural', 'quente', 'pb', 'duotone'];
const RAIOS: RaioPost[] = ['reto', 'suave', 'redondo'];
const FONTES_APOIO: FonteApoio[] = ['Manrope', 'DM Sans', 'Montserrat', 'Poppins'];

/** O DNA visual da loja: as preferências que fazem as artes dela terem um jeito próprio. */
export interface DnaVisual {
  /** Posição de cada layout na preferência da loja (0 = o preferido). */
  ordemLayouts: Map<LayoutPost, number>;
  pesoPaleta: Map<PaletaPost, number>;
  decorsPreferidos: DecorPost[];
  raio: RaioPost;
  fonteApoio: FonteApoio[];
  alinhamento: 'esquerda' | 'centro';
  filtro: FiltroFoto;
  caixaAlta: boolean;
}

export function dnaDaLoja(perfilId: string): DnaVisual {
  const sorte = aleatorio(hashTexto(perfilId));
  const ordem = embaralhar(LAYOUTS.map((layout) => layout.id), sorte);
  const paletas = embaralhar(PALETAS, sorte);
  const pesosPaleta = [5, 3, 2, 1.5, 1];
  return {
    ordemLayouts: new Map(ordem.map((id, posicao) => [id, posicao])),
    pesoPaleta: new Map(paletas.map((paleta, i) => [paleta, pesosPaleta[i]])),
    decorsPreferidos: embaralhar(DECORS, sorte).slice(0, 3),
    raio: RAIOS[Math.floor(sorte() * RAIOS.length)],
    fonteApoio: embaralhar(FONTES_APOIO, sorte).slice(0, 2),
    alinhamento: sorte() < 0.5 ? 'esquerda' : 'centro',
    filtro: embaralhar(FILTROS.filter((f) => f !== 'natural'), sorte)[0],
    caixaAlta: sorte() < 0.55,
  };
}

/** "moldura|cor": o que já saiu para a loja (para não repetir). */
export function chaveDoEstilo(estilo: EstiloPost): string {
  return `${estilo.layout}|${estilo.paleta}`;
}

export interface PedidoEstilos {
  tipo: TipoPost;
  fotosDisponiveis: number;
  temPreco: boolean;
  dna: DnaVisual;
  /** As últimas combinações que a loja viu (chaveDoEstilo), a mais recente primeiro. */
  historico: string[];
  quantidade: number;
  /** Muda a cada "Gerar": a mesma loja e o mesmo post rendem artes novas. */
  semente: number;
}

/**
 * As combinações de uma geração: layouts diferentes entre si (quando há layouts suficientes), paletas variadas e
 * o resto puxado do DNA da loja com uma parte de acaso.
 */
export function gerarEstilos(pedido: PedidoEstilos): EstiloPost[] {
  const sorte = aleatorio(pedido.semente);
  const candidatos = layoutsPara(pedido.tipo, pedido.fotosDisponiveis, pedido.temPreco);
  if (candidatos.length === 0) return [];
  const vistos = new Set(pedido.historico.slice(0, 16).map((chave) => chave.split('|')[0]));

  // ordem: preferência da loja, empurrando para trás o que ela viu há pouco, com um empurrão do acaso
  const ordenados = [...candidatos].sort((a, b) => nota(a) - nota(b));
  function nota(layout: DefinicaoLayout): number {
    return (pedido.dna.ordemLayouts.get(layout.id) ?? 0) + (vistos.has(layout.id) ? 9 : 0) + sorte() * 7;
  }

  const estilos: EstiloPost[] = [];
  const paletasUsadas: PaletaPost[] = [];
  for (let i = 0; i < pedido.quantidade; i++) {
    const layout = ordenados[i % ordenados.length];
    const paleta = sortearComPeso(
      layout.paletas,
      (p) => (pedido.dna.pesoPaleta.get(p) ?? 1) * (paletasUsadas.includes(p) ? 0.25 : 1)
        * (pedido.historico.includes(`${layout.id}|${p}`) ? 0.3 : 1),
      sorte,
    );
    paletasUsadas.push(paleta);
    estilos.push({
      layout: layout.id,
      paleta,
      decor: escolherDecor(layout.id, paleta, pedido.dna, sorte),
      alinhamento: sorte() < 0.68 ? pedido.dna.alinhamento : (pedido.dna.alinhamento === 'centro' ? 'esquerda' : 'centro'),
      filtro: escolherFiltro(pedido.dna, sorte),
      raio: sorte() < 0.7 ? pedido.dna.raio : RAIOS[Math.floor(sorte() * RAIOS.length)],
      fonteApoio: pedido.dna.fonteApoio[sorte() < 0.7 ? 0 : 1],
      caixaAlta: sorte() < 0.75 ? pedido.dna.caixaAlta : !pedido.dna.caixaAlta,
      variante: Math.floor(sorte() * layout.variantes),
    });
  }
  return estilos;
}

/** Foto cheia (moldura, janela...) pede pouco enfeite; os tipográficos pedem enfeite forte. */
function escolherDecor(layout: LayoutPost, paleta: PaletaPost, dna: DnaVisual, sorte: () => number): DecorPost {
  // fundo liso é liso: só a cor, sem enfeite nenhum
  if (layout === 'liso' || layout === 'liso-cartao') return 'nenhum';
  if (paleta === 'foto' || layout === 'moldura' || layout === 'janela' || layout === 'diagonal') {
    return sorte() < 0.6 ? 'nenhum' : 'linhas';
  }
  if (layout === 'minimal') return sorte() < 0.5 ? 'linhas' : 'nenhum';
  if (sorte() < 0.78) return dna.decorsPreferidos[Math.floor(sorte() * dna.decorsPreferidos.length)];
  return DECORS[Math.floor(sorte() * DECORS.length)];
}

function escolherFiltro(dna: DnaVisual, sorte: () => number): FiltroFoto {
  const r = sorte();
  if (r < 0.58) return 'natural';
  if (r < 0.86) return dna.filtro;
  return FILTROS[Math.floor(sorte() * FILTROS.length)];
}
