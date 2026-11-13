import type { PeriodoAtendimento } from '../../../core/models/agenda.model';
import type { AtributoProduto, Produto } from '../../../core/models/produto.model';
import { DIAS_SEMANA } from '../../../core/utils/datas-agenda';

/**
 * Primeiro teste do onboarding: o "cliente" que conversa sozinho com o assistente até o fim (o horário marcado nos
 * serviços, o pedido passado ao dono nos produtos), para o lojista ver o atendimento completo sem digitar nada.
 *
 * Não é um roteiro fixo: a cada resposta ele lê o que o assistente perguntou (o nome de uma opção do produto, o nome,
 * a data, a entrega...) e responde com dados que existem no cadastro, então funciona com qualquer produto ou serviço.
 */

/** Quantas mensagens o cliente manda no máximo: passou disso, a conversa fica com o lojista. */
const LIMITE_DE_MENSAGENS = 12;

export interface DadosClienteAutomatico {
  servico: boolean;
  /** O nome do lojista (o cliente do teste se apresenta com ele). */
  nome: string;
  /** Produtos: o item do teste (o primeiro cadastrado). */
  produto?: Produto | null;
  /** Produtos: horário e antecedência da loja, para pedir num dia que dá tempo. */
  horarios?: PeriodoAtendimento[];
  horarioLivre?: boolean;
  antecedenciaLojaMinutos?: number;
  /** Serviços: o serviço do teste e o primeiro horário livre de verdade (da agenda online). */
  nomeServico?: string | null;
  primeiroHorario?: { data: string; hora: string } | null;
  agora?: Date;
  /** Roteiro fixo do segmento: as mensagens em ordem, uma depois de cada resposta do assistente. */
  roteiro?: string[];
}

/** Salgados: a conversa típica, do preço do cento à retirada, no próximo dia em que a loja pode atender. */
export function roteiroDoSegmento(segmento: string | null | undefined, dados: DadosClienteAutomatico): string[] | undefined {
  if (segmento === 'SALGADOS') {
    return [
      'Olá! Quanto custa o cento de salgados?',
      `Pode ser para ${proximoDiaDaLoja(dados)}?`,
      'OK, vou querer 50 coxinhas e 50 pastéis de frango',
      'Está sim',
      `Vou retirar aí mesmo, me chamo ${dados.nome}`,
    ];
  }
  return undefined;
}

export class ClienteAutomatico {
  private enviadas = 0;
  private readonly respondidas = new Set<string>();
  /** Opções do produto que o cliente já escolheu (pelo nome). */
  private readonly escolhidas = new Set<string>();
  private readonly dataDoPedido: string;

  constructor(private readonly dados: DadosClienteAutomatico) {
    this.dataDoPedido = dados.servico ? '' : quandoPedir(dados);
  }

  primeira(): string {
    this.enviadas++;
    if (this.dados.roteiro?.length) {
      return this.dados.roteiro[0];
    }
    if (this.dados.servico) {
      const servico = minusculaNoInicio(this.dados.nomeServico);
      const pedido = servico ? `Oi, gostaria de agendar ${servico}` : 'Oi, gostaria de agendar um horário';
      const livre = this.dados.primeiroHorario;
      if (!livre) {
        return pedido;
      }
      // o dia e o horário já vão na primeira mensagem: depois é só o nome
      this.respondidas.add('horario');
      return `${pedido} para ${diaFalado(livre.data, this.dados.agora)} às ${livre.hora}`;
    }
    const nome = this.dados.produto?.nome ?? '';
    const pessoas = /(\d+)\s*-\s*(\d+)\s*pessoas/i.exec(nome);
    if (pessoas) {
      // "Bolo festivo | 10-15 pessoas": pergunta pelo número de pessoas, como o cliente de verdade faz
      return `Oi! Quanto custa um ${primeiraPalavra(nome)} para ${pessoas[2]} pessoas?`;
    }
    if (!nome) {
      return 'Oi! Quais produtos vocês têm?';
    }
    const item = minusculaNoInicio(nomeSemDetalhe(nome));
    // "Salgados de festa", "Docinhos de festa": plural pede "custam os"
    return /^\S+s\b/.test(item) ? `Oi! Quanto custam os ${item}?` : `Oi! Quanto custa ${item}?`;
  }

  /** A próxima mensagem depois da resposta do assistente; null = a conversa terminou (ou não há o que responder). */
  proxima(resposta: string, acao: string | null | undefined): string | null {
    if (this.enviadas >= LIMITE_DE_MENSAGENS || terminou(this.dados.servico, acao)) {
      return null;
    }
    if (this.dados.roteiro?.length) {
      return this.dados.roteiro[this.enviadas++] ?? null;
    }
    const mensagem = this.dados.servico ? this.paraServico(normalizar(resposta), resposta) : this.paraProduto(normalizar(resposta));
    if (mensagem) {
      this.enviadas++;
    }
    return mensagem;
  }

  private paraServico(texto: string, original: string): string | null {
    if (this.pediu(texto, 'nome', /\bnome\b/)) {
      return this.dados.nome;
    }
    if (!this.respondidas.has('profissional') && /\bcom quem\b|profissional|prefere ser atendid/.test(texto)) {
      this.respondidas.add('profissional');
      return 'Pode ser com qualquer um';
    }
    if (!this.respondidas.has('horario')) {
      this.respondidas.add('horario');
      const livre = this.dados.primeiroHorario;
      if (livre) {
        return `Pode ser ${diaFalado(livre.data, this.dados.agora)} às ${livre.hora}?`;
      }
    }
    // o horário pedido não serviu: escolhe o primeiro que o assistente mostrou
    const horarioMostrado = /\b(\d{1,2}:\d{2})\b/.exec(original);
    if (horarioMostrado && !this.respondidas.has('horario-mostrado')) {
      this.respondidas.add('horario-mostrado');
      return `Pode ser às ${horarioMostrado[1]}`;
    }
    if (/\?\s*$/.test(texto) && !this.respondidas.has('sim')) {
      this.respondidas.add('sim');
      return 'Sim, pode marcar';
    }
    return null;
  }

  private paraProduto(texto: string): string | null {
    if (!this.respondidas.has('intencao')) {
      // primeira resposta (o preço): mostra a intenção de comprar, num dia que cabe na antecedência
      this.respondidas.add('intencao');
      return `${this.porUnidade() ? 'Quero 100 unidades' : 'Quero encomendar'} para ${this.dataDoPedido}`;
    }
    const partes: string[] = [];
    // as opções do produto que o assistente citou (pelo nome da opção ou por 2 dos valores)
    for (const atributo of this.dados.produto?.atributos ?? []) {
      if (!this.escolhidas.has(atributo.nome) && citou(texto, atributo)) {
        this.escolhidas.add(atributo.nome);
        partes.push(escolher(atributo));
      }
    }
    if (partes.length) {
      return partes.join('\n');
    }
    // o resumo repete data, entrega e nome como rótulos: a confirmação vem antes de tudo
    if (this.pediu(texto, 'confirmar', /confirm|esta correto|esta certo|tudo certo|certinho|posso anotar|resumo/)) {
      return 'Isso, pode confirmar!';
    }
    // dados do fechamento: tudo o que o assistente pediu nesta mensagem vai junto ("nome e entrega ou retirada")
    const dados: string[] = [];
    if (this.pediu(texto, 'quantidade', /quantas unidades|quantidade|quantos (?:voce|vai|deseja|gostaria)/)) {
      dados.push('100 unidades');
    }
    if (this.pediu(texto, 'data', /qual (?:a )?data|para (?:qual|que) (?:data|dia)|para quando|que dia|qual dia/)) {
      dados.push(`Para ${this.dataDoPedido}`);
    }
    if (this.pediu(texto, 'hora', /que horas|qual (?:o )?horario|que horario/)) {
      dados.push('Às 15h');
    }
    if (this.pediu(texto, 'entrega', /retirada|retirar|entrega|buscar/)) {
      dados.push('Vou retirar');
    }
    if (this.pediu(texto, 'pagamento', /pagamento|pagar|\bpix\b|cartao/)) {
      dados.push('Pix');
    }
    if (this.pediu(texto, 'nome', /\bnome\b/)) {
      dados.push(dados.length ? `Meu nome é ${this.dados.nome}` : this.dados.nome);
    }
    if (dados.length) {
      return dados.join('. ');
    }
    if (this.pediu(texto, 'adicional', /adiciona|acrescentar|mais alguma/)) {
      return 'Não, só isso';
    }
    if (/\?\s*$/.test(texto) && !this.respondidas.has('sim')) {
      this.respondidas.add('sim');
      return 'Sim';
    }
    return null;
  }

  /** O assistente perguntou isso agora e o cliente ainda não respondeu. */
  private pediu(texto: string, chave: string, padrao: RegExp): boolean {
    if (this.respondidas.has(chave) || !padrao.test(texto)) {
      return false;
    }
    this.respondidas.add(chave);
    return true;
  }

  /** Produto vendido por unidade (salgados): o cliente já diz a quantidade. */
  private porUnidade(): boolean {
    const produto = this.dados.produto;
    return !!produto && /unidade/i.test(`${produto.nome} ${produto.descricao ?? ''}`);
  }
}

function terminou(servico: boolean, acao: string | null | undefined): boolean {
  return servico ? acao === 'AGENDAR' : acao === 'TRANSFERIR_HUMANO' || acao === 'SEM_INFORMACAO';
}

/** O assistente falou desta opção: pelo nome ("recheio", "massa") ou listando 2 dos valores. */
function citou(texto: string, atributo: AtributoProduto): boolean {
  const nome = normalizar(atributo.nome).replace(/s$/, '');
  if (nome.length >= 3 && texto.includes(nome)) {
    return true;
  }
  if (atributo.modoEscolha === 'ADICIONAL' && /adiciona/.test(texto)) {
    return true;
  }
  return atributo.opcoes.filter((opcao) => texto.includes(normalizar(semPreco(opcao)))).length >= 2;
}

/** A resposta do cliente para a opção: valores que existem no cadastro, no jeito de falar de um cliente. */
function escolher(atributo: AtributoProduto): string {
  const opcoes = atributo.opcoes.map((opcao) => minusculaNoInicio(semPreco(opcao)));
  const quantidade = Math.max(1, atributo.quantidadeEscolha ?? 1);
  switch (atributo.modoEscolha) {
    case 'ADICIONAL':
      return `Quero com ${opcoes[0]}`;
    case 'QUANTAS_QUISER':
    case 'MINIMO':
      return `Pode ser ${emFrase(opcoes.slice(0, Math.min(3, opcoes.length)))}, a mesma quantidade de cada`;
    case 'ATE':
      if (quantidade >= 2 && opcoes.length >= 4) {
        // pula os primeiros (os mais óbvios) para a escolha parecer de cliente
        return `Quero de ${emFrase(opcoes.slice(2, 4))}`;
      }
      return `Quero de ${opcoes[0]}`;
    default:
      return quantidade > 1 ? `Quero ${emFrase(opcoes.slice(0, quantidade))}` : `${maiusculaNoInicio(opcoes[0])}, por favor`;
  }
}

/**
 * Produtos: o dia do pedido. A antecedência do produto (ou a da loja), com folga, contando dentro do horário de
 * funcionamento; prefere as 15h de um dia aberto. Ex.: "sábado (08/11) às 15h".
 */
export function quandoPedir(dados: DadosClienteAutomatico): string {
  const agora = dados.agora ?? new Date();
  const antecedencia = dados.produto?.antecedenciaMinutos ?? dados.antecedenciaLojaMinutos ?? 0;
  // folga para o pedido nunca cair no limite (a conta do backend arredonda e começa na abertura da loja)
  const minimo = new Date(agora.getTime() + (antecedencia + 3 * 60) * 60_000);
  const horarios = dados.horarioLivre ? [] : dados.horarios ?? [];
  for (let dias = 0; dias < 21; dias++) {
    const dia = new Date(minimo.getFullYear(), minimo.getMonth(), minimo.getDate() + dias);
    const hora = horaNoDia(dia, minimo, horarios);
    if (hora !== null) {
      return `${diaFalado(dia, agora)} às ${hora}h`;
    }
  }
  return 'a próxima semana';
}

/**
 * "amanhã de manhã", "sábado de manhã", "segunda à tarde": a partir de amanhã, o primeiro dia aberto em que o pedido
 * cabe na antecedência (a maior entre a do produto e a da loja, contada a partir da abertura, como no backend).
 */
export function proximoDiaDaLoja(dados: DadosClienteAutomatico): string {
  const agora = dados.agora ?? new Date();
  const antecedencia = Math.max(dados.produto?.antecedenciaMinutos ?? 0, dados.antecedenciaLojaMinutos ?? 0);
  const horarios = dados.horarioLivre ? [] : dados.horarios ?? [];
  // os trechos abertos dos próximos dias (hoje incluído), em ordem; sem horário fixo, das 9h às 18h todo dia
  const trechos = Array.from({ length: 22 }, (_, dias) => {
    const dia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + dias);
    const semana = DIAS_SEMANA[(dia.getDay() + 6) % 7].valor;
    const periodos = horarios.length ? horarios.filter((periodo) => periodo.diaSemana === semana) : [{ inicio: '09:00', fim: '18:00' }];
    return periodos
      .map((periodo) => ({
        dias,
        nome: DIAS_SEMANA[(dia.getDay() + 6) % 7].nome,
        inicio: dia.getTime() + minutosDe(periodo.inicio) * 60_000,
        fim: dia.getTime() + minutosDe(periodo.fim) * 60_000,
      }))
      .sort((a, b) => a.inicio - b.inicio);
  }).flat();
  // a antecedência conta de agora, se a loja está aberta, ou da próxima abertura (JanelaPedido.inicioDaContagem)
  const contagem = horarios.length
    ? trechos.find((trecho) => trecho.fim > agora.getTime())?.inicio ?? agora.getTime()
    : agora.getTime();
  const minimo = Math.max(contagem, agora.getTime()) + antecedencia * 60_000;
  for (const trecho of trechos) {
    const pronto = Math.max(trecho.inicio, minimo);
    if (trecho.dias >= 1 && pronto < trecho.fim) {
      const hora = new Date(pronto).getHours();
      const parte = hora < 12 ? 'de manhã' : hora < 18 ? 'à tarde' : 'à noite';
      return `${trecho.dias === 1 ? 'amanhã' : trecho.nome} ${parte}`;
    }
  }
  return 'a próxima semana';
}

/** Uma hora cheia aberta neste dia e depois do mínimo; as 15h quando dá. */
function horaNoDia(dia: Date, minimo: Date, horarios: PeriodoAtendimento[]): number | null {
  const valida = (hora: number) => new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), hora) >= minimo;
  if (!horarios.length) {
    return [15, 16, 17, 18, 19].find(valida) ?? null;
  }
  const semana = DIAS_SEMANA[(dia.getDay() + 6) % 7].valor;
  const horas = horarios
    .filter((periodo) => periodo.diaSemana === semana)
    .flatMap((periodo) => {
      const inicio = Math.ceil(minutosDe(periodo.inicio) / 60);
      const fim = Math.floor((minutosDe(periodo.fim) - 30) / 60);
      return Array.from({ length: Math.max(0, fim - inicio + 1) }, (_, i) => inicio + i);
    })
    .filter(valida);
  return horas.includes(15) ? 15 : horas[0] ?? null;
}

/** "hoje", "amanhã" ou "sábado (08/11)". */
function diaFalado(dia: Date | string, agora = new Date()): string {
  const data = typeof dia === 'string' ? new Date(`${dia}T12:00:00`) : dia;
  const diferenca = Math.round(
    (new Date(data.getFullYear(), data.getMonth(), data.getDate()).getTime() -
      new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime()) / 86_400_000,
  );
  const dd = `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}`;
  if (diferenca === 0) return `hoje (${dd})`;
  if (diferenca === 1) return `amanhã (${dd})`;
  return `${DIAS_SEMANA[(data.getDay() + 6) % 7].nome} (${dd})`;
}

function minutosDe(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + (m || 0);
}

/** "Crocante (+R$ 10,00)" -> "Crocante". */
function semPreco(opcao: string): string {
  return opcao.replace(/\s*\(?\+?\s*R\$\s*[\d.,]+\)?/gi, '').trim();
}

/** "Bolo festivo | 10-15 pessoas" -> "Bolo festivo"; "Salgados de festa (unidade)" -> "Salgados de festa". */
function nomeSemDetalhe(nome: string): string {
  return nome.split('|')[0].replace(/\(.*?\)/g, '').trim();
}

function primeiraPalavra(nome: string): string {
  return minusculaNoInicio(nome.trim().split(/\s+/)[0]);
}

function emFrase(itens: string[]): string {
  return itens.length <= 1 ? itens.join('') : `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`;
}

function minusculaNoInicio(texto: string | null | undefined): string {
  const t = texto?.trim() ?? '';
  // siglas (P, GG) ficam como estão
  return t.length > 2 && t[1] !== t[1].toUpperCase() ? t.charAt(0).toLowerCase() + t.slice(1) : t;
}

function maiusculaNoInicio(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
