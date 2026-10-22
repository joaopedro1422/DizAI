import { NovaMensagemPronta } from '../../core/models/agenda.model';
import { primeiroNome } from '../../core/models/pedido.model';

const REAL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatarReal(valor: number): string {
  return REAL.format(valor);
}

/** Pedaços que o lojista pode usar nos avisos; viram os dados do pedido na hora de enviar. */
export const VARIAVEIS_PEDIDO = [
  { chave: '{nome}', rotulo: 'Nome', exemplo: 'João' },
  { chave: '{valor}', rotulo: 'Valor', exemplo: 'R$ 127,50' },
];

/** O que já vem escrito quando o lojista avisa que está pronto (ele pode trocar ou escolher uma mensagem pronta). */
export const AVISO_PRONTO_PADRAO = 'Oi, {nome}! Seu pedido está pronto ✅';

/** O que já vem escrito no "Entregue". */
export const AGRADECIMENTO_PADRAO =
  'Obrigado pela preferência, {nome}! Esperamos que goste 💛 Qualquer coisa, é só chamar por aqui.';

/** Modelos oferecidos com um toque quando a loja ainda não tem nenhuma mensagem pronta de pedido. */
export const SUGESTOES_PEDIDO: NovaMensagemPronta[] = [
  { titulo: 'Pronto para retirar', texto: 'Oi, {nome}! Seu pedido está pronto e já pode ser retirado 😊' },
  { titulo: 'Saiu para entrega', texto: 'Oi, {nome}! Seu pedido saiu para entrega e já já chega aí 🛵' },
  { titulo: 'Obrigado', texto: 'Obrigado pela preferência, {nome}! Volte sempre 💛' },
];

/** Troca {nome} (só o primeiro) e {valor} pelos dados do pedido. */
export function preencherAviso(texto: string, nome: string, valor: number | null): string {
  const valores: Record<string, string> = {
    '{nome}': primeiroNome(nome),
    '{valor}': valor === null ? '' : formatarReal(valor),
  };
  return texto
    .replace(/\{(nome|valor)\}/g, (chave) => valores[chave] ?? chave)
    .replace(/,\s*!/g, '!')   // "Oi, !" quando não há nome
    .trim();
}
