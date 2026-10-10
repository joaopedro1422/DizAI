export interface PerguntaFrequente {
  id: number;
  pergunta: string;
  resposta: string;
}

export type NovaPerguntaFrequente = Omit<PerguntaFrequente, 'id'>;
