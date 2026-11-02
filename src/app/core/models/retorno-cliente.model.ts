/**
 * Agenda → Retornos (`/api/perfis/{id}/agenda/retornos`): o dia em que o cliente deve voltar (manutenção do gel,
 * retoque da tatuagem) e para quê. O lembrete para agendar sai no dia anterior, a partir das 10:00.
 */
export interface RetornoCliente {
  id: string;
  nome: string | null;
  /** Só dígitos, com DDI. */
  numero: string;
  /** "(83) 99999-0000". */
  whatsapp: string;
  /** "AAAA-MM-DD". */
  data: string;
  descricao: string;
  /** null enquanto o lembrete não saiu. */
  lembreteEnviadoEm: string | null;
}

export interface NovoRetorno {
  numero: string;
  nome: string;
  data: string;
  descricao: string;
}

/** A mesma mensagem que o `RetornoClienteService` monta (a saudação muda com a hora; aqui, a das 10:00). */
export function mensagemDoRetorno(nome: string | null, descricao: string): string {
  const primeiro = nome?.trim().split(/\s+/)[0];
  const saudacao = primeiro ? `Bom dia, ${primeiro}!` : 'Bom dia!';
  const para = descricao.trim() || '…';
  return `${saudacao} Passando para lembrar do seu retorno para ${para}. Quando quiser agendar, é só me avisar por aqui.`;
}
