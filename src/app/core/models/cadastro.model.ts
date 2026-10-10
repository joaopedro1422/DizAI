import { RamoNegocio } from './perfil.model';

/** Dados coletados nos três passos do cadastro. Pagamento e entrega são configurados depois, no painel. */
export interface DadosCadastroLoja {
  dadosNegocio: {
    nomeResponsavel: string;
    nomeLoja: string;
    descricao: string;
  };
  acesso: {
    whatsapp: string;
    senha: string;
  };
  ramo: RamoNegocio;
}
