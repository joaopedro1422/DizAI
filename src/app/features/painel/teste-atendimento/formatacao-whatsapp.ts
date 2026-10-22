/**
 * A formatação que o WhatsApp aplica no texto, para a conversa de teste ficar igual ao celular:
 * linhas com "- " ou "* " viram lista com marcador, "1. " vira lista numerada, e *negrito*, _itálico_ e ~riscado~.
 * Monta pedaços de texto (nada de HTML), então o que o cliente ou a IA escreveu nunca vira código na tela.
 */
export interface TrechoFormatado {
  texto: string;
  negrito: boolean;
  italico: boolean;
  riscado: boolean;
}

export interface LinhaFormatada {
  /** "•" na lista com marcador, "1." na numerada; null em linha comum. */
  marcador: string | null;
  trechos: TrechoFormatado[];
}

const LISTA = /^\s*[-*]\s+(.*)$/;
const NUMERADA = /^\s*(\d{1,3})\.\s+(.*)$/;
/** *negrito*, _itálico_ e ~riscado~: o símbolo encosta no texto e não atravessa a linha. */
const ESTILO = /([*_~])(?=\S)([^*_~\n]*?\S)\1/g;

export function formatarWhatsapp(texto: string): LinhaFormatada[] {
  return texto.split('\n').map((linha) => {
    const lista = LISTA.exec(linha);
    if (lista) {
      return { marcador: '•', trechos: estilizar(lista[1]) };
    }
    const numerada = NUMERADA.exec(linha);
    if (numerada) {
      return { marcador: `${numerada[1]}.`, trechos: estilizar(numerada[2]) };
    }
    return { marcador: null, trechos: estilizar(linha) };
  });
}

function estilizar(linha: string): TrechoFormatado[] {
  const trechos: TrechoFormatado[] = [];
  let posicao = 0;
  for (const achado of linha.matchAll(ESTILO)) {
    const inicio = achado.index ?? 0;
    if (inicio > posicao) {
      trechos.push(simples(linha.slice(posicao, inicio)));
    }
    const simbolo = achado[1];
    trechos.push({ texto: achado[2], negrito: simbolo === '*', italico: simbolo === '_', riscado: simbolo === '~' });
    posicao = inicio + achado[0].length;
  }
  if (posicao < linha.length || trechos.length === 0) {
    trechos.push(simples(linha.slice(posicao)));
  }
  return trechos;
}

function simples(texto: string): TrechoFormatado {
  return { texto, negrito: false, italico: false, riscado: false };
}
