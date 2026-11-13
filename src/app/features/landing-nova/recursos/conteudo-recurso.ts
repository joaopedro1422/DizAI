import type { TipoLanding } from '../../landing/conteudo-landing';

/** Uma cena do mock do topo: o que o celular mostra (cada página desenha as suas) e a legenda por cima dele. */
export interface CenaRecurso {
  cena: string;
  legenda: string;
  /** Quanto tempo a cena fica (padrão 7 s; as animações de cada uma terminam antes dos 6 s). */
  ms?: number;
}

/**
 * Os textos de uma página de recurso (vitrine, posts, campanhas), por público. A estrutura é a mesma nas três
 * (PaginaRecursoComponent): topo com a dor e o mock passando sozinho, o "por que", o que tem, perguntas e a chamada.
 */
export interface ConteudoRecurso {
  tipo: TipoLanding;
  /** A landing de onde veio ("/vendas"), para o voltar do topo e o "Conhecer o DizAI completo". */
  landing: { rota: string; rotulo: string };
  /** O título da aba do navegador. */
  tituloPagina: string;
  rotulo: string;
  hero: { titulo: string; grifo: string; apoio: string; botao: string };
  fatos: string[];
  cenas: CenaRecurso[];
  motivos: { rotulo: string; titulo: [string, string]; apoio: string; itens: [string, string][] };
  recursos: { rotulo: string; titulo: [string, string]; itens: { icone: string; titulo: string; texto: string }[] };
  perguntas: { titulo: string; apoio: string; itens: [string, string][] };
  final: { titulo: string; texto: string; botao: string };
}
