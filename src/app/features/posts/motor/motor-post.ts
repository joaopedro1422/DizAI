import { DefinicaoLayout, LAYOUTS, layoutsPara } from './layouts-post';
import {
  BotaoPost,
  CartaoPost,
  DecorPost,
  EstiloPost,
  FiltroFoto,
  FonteApoio,
  FundoPost,
  LayoutPost,
  OrigemCor,
  PaletaPost,
  RaioPost,
  SeloPost,
  TipoPost,
} from './tipos-post';

/**
 * O "diretor de arte" do gerador: sorteia as combinações (layout, paleta, enfeite, fundo, cartão, botão, selo,
 * fontes, cantos, filtro da foto e a origem da cor) das opções de um post. Para duas lojas nunca receberem as mesmas artes, cada loja tem um DNA visual tirado do id
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
const DECORS: DecorPost[] = ['linhas', 'pontos', 'organico', 'brilhos', 'geometrico', 'faixas', 'ondas', 'arcos', 'confete'];
const FUNDOS: FundoPost[] = ['degrade', 'luz', 'malha', 'grao', 'listras', 'grade', 'papel', 'meio'];
const CARTOES: CartaoPost[] = ['padrao', 'sombra-dura', 'fosco', 'flutuante', 'recorte'];
const BOTOES: BotaoPost[] = ['pilula', 'quadrado', 'contorno', 'sublinhado'];
const SELOS_ESTILO: SeloPost[] = ['pilula', 'texto', 'tarja', 'contorno'];

/** A foto cobre a arte inteira: o acabamento do fundo não aparece. */
const FOTO_CHEIA: LayoutPost[] = ['moldura', 'janela', 'diagonal'];
/** Layouts que desenham o próprio selo ou o próprio botão (traços do cardápio, faixa da diagonal...). */
const SELO_PROPRIO: LayoutPost[] = ['minimal', 'cardapio', 'lateral', 'diagonal', 'etiqueta', 'editorial'];
const BOTAO_PROPRIO: LayoutPost[] = ['minimal', 'etiqueta'];
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
  fundosPreferidos: FundoPost[];
  cartao: CartaoPost;
  botao: BotaoPost;
  selo: SeloPost;
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
    fundosPreferidos: embaralhar(FUNDOS, sorte).slice(0, 3),
    cartao: CARTOES[Math.floor(sorte() * CARTOES.length)],
    botao: BOTOES[Math.floor(sorte() * BOTOES.length)],
    selo: SELOS_ESTILO[Math.floor(sorte() * SELOS_ESTILO.length)],
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
  /** As cores que entram no sorteio (as duas = metade das artes na cor da vitrine, metade na da logo). */
  origens: OrigemCor[];
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
      fundo: escolherFundo(layout.id, paleta, pedido.dna, sorte),
      cartao: sorte() < 0.6 ? pedido.dna.cartao : CARTOES[Math.floor(sorte() * CARTOES.length)],
      botao: BOTAO_PROPRIO.includes(layout.id) ? 'pilula'
        : sorte() < 0.65 ? pedido.dna.botao : BOTOES[Math.floor(sorte() * BOTOES.length)],
      selo: SELO_PROPRIO.includes(layout.id) ? 'pilula'
        : sorte() < 0.65 ? pedido.dna.selo : SELOS_ESTILO[Math.floor(sorte() * SELOS_ESTILO.length)],
      origemCor: pedido.origens[i % Math.max(1, pedido.origens.length)] ?? 'vitrine',
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

/** Foto cobrindo tudo ou fundo liso de propósito: sem acabamento; nos outros, o que a loja prefere (às vezes liso). */
function escolherFundo(layout: LayoutPost, paleta: PaletaPost, dna: DnaVisual, sorte: () => number): FundoPost {
  if (paleta === 'foto' || FOTO_CHEIA.includes(layout) || layout === 'liso' || layout === 'liso-cartao') return 'liso';
  const r = sorte();
  if (r < 0.22) return 'liso';
  if (r < 0.82) return dna.fundosPreferidos[Math.floor(sorte() * dna.fundosPreferidos.length)];
  return FUNDOS[Math.floor(sorte() * FUNDOS.length)];
}

function escolherFiltro(dna: DnaVisual, sorte: () => number): FiltroFoto {
  const r = sorte();
  if (r < 0.58) return 'natural';
  if (r < 0.86) return dna.filtro;
  return FILTROS[Math.floor(sorte() * FILTROS.length)];
}
