import { MotivoEspera } from '../models/conversa.model';

export interface ApresentacaoMotivo {
  rotulo: string;
  /** Modificador CSS do selo: destaque | alerta | erro */
  tom: 'destaque' | 'alerta' | 'erro';
}

export const MOTIVOS_ESPERA: Record<MotivoEspera, ApresentacaoMotivo> = {
  PRONTO_PARA_FECHAR: { rotulo: 'Pronto para fechar', tom: 'destaque' },
  PEDIU_HUMANO: { rotulo: 'Pediu para falar com você', tom: 'alerta' },
  IA_SEM_RESPOSTA: { rotulo: 'Assistente não soube responder', tom: 'erro' },
};
