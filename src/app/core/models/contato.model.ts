/** De onde veio o contato que o assistente deve ignorar. */
export type OrigemContatoIgnorado = 'MANUAL' | 'WHATSAPP' | 'AGENDA_CELULAR';

/** Número que o assistente nunca responde (família, amigos, quem não é cliente). */
export interface ContatoIgnorado {
  id: number;
  /** Opcional: só para o lojista reconhecer na lista. */
  nome: string;
  /** Sempre formatado: "(83) 99999-0000". */
  whatsapp: string;
  origem: OrigemContatoIgnorado;
  adicionadoEm: Date;
}

export type NovoContatoIgnorado = Omit<ContatoIgnorado, 'id' | 'adicionadoEm'>;

/**
 * Contato da agenda do app WhatsApp Business do lojista.
 * O backend recebe e mantém essa lista pelo webhook `smb_app_state_sync` da conexão pelo app (coexistência).
 */
export interface ContatoWhatsapp {
  nome: string;
  whatsapp: string;
}
