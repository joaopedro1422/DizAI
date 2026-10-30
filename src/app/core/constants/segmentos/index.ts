import type { RamoNegocio } from '../../models/perfil.model';
import { SEGMENTOS_DOCES_SALGADOS } from './doces-salgados';
import { SEGMENTOS_OUTRO } from './outro';
import { SEGMENTOS_PRODUTOS_GERAIS } from './produtos-gerais';
import { SEGMENTOS_PRODUTOS_PERSONALIZADOS } from './produtos-personalizados';
import { SEGMENTOS_SERVICOS_PERSONALIZADOS } from './servicos-personalizados';
import { SEGMENTOS_SERVICOS_PRESENCIAIS } from './servicos-presenciais';
import type { DadosSegmento, ExemplosNegocio, ExemplosProdutos, ExemplosServicos, SegmentoNegocio } from './tipos-segmento';

export * from './tipos-segmento';

/** Todos os segmentos, na ordem em que aparecem na escolha (4 por ramo). */
export const SEGMENTOS: DadosSegmento[] = [
  ...SEGMENTOS_SERVICOS_PRESENCIAIS,
  ...SEGMENTOS_SERVICOS_PERSONALIZADOS,
  ...SEGMENTOS_DOCES_SALGADOS,
  ...SEGMENTOS_PRODUTOS_PERSONALIZADOS,
  ...SEGMENTOS_PRODUTOS_GERAIS,
  ...SEGMENTOS_OUTRO,
];

/**
 * Sem segmento escolhido, os tutoriais usam os exemplos de um segmento típico do ramo (os textos do painel continuam
 * os gerais do ramo, em CONTEUDO_POR_RAMO).
 */
const SEGMENTO_PADRAO: Record<RamoNegocio, SegmentoNegocio> = {
  SERVICOS_PRESENCIAIS: 'MANICURE',
  SERVICOS_PERSONALIZADOS: 'REFORMAS_REPAROS',
  DOCES_SALGADOS: 'BOLOS_TORTAS',
  PRODUTOS_PERSONALIZADOS: 'CESTAS_PRESENTES',
  PRODUTOS_GERAIS: 'ROUPAS_ACESSORIOS',
  OUTRO: 'SAUDE_BEM_ESTAR',
};

export function segmentosDoRamo(ramo: RamoNegocio): DadosSegmento[] {
  return SEGMENTOS.filter((segmento) => segmento.ramo === ramo);
}

/** O segmento só vale com o ramo dele (o lojista pode ter trocado o ramo em Dados da loja). */
export function segmentoDoPerfil(ramo: RamoNegocio, segmento: SegmentoNegocio | null | undefined): DadosSegmento | null {
  return SEGMENTOS.find((item) => item.valor === segmento && item.ramo === ramo) ?? null;
}

/** O segmento escolhido ou, sem escolha, o típico do ramo (para os exemplos dos tutoriais). */
export function segmentoOuPadrao(ramo: RamoNegocio, segmento: SegmentoNegocio | null | undefined): DadosSegmento {
  return (
    segmentoDoPerfil(ramo, segmento) ??
    SEGMENTOS.find((item) => item.valor === SEGMENTO_PADRAO[ramo]) ??
    SEGMENTOS[0]
  );
}

/** Os exemplos de produtos do segmento (um segmento de serviços cai nos de uma loja de bolos, que nunca deve aparecer). */
export function exemplosDeProdutos(exemplos: ExemplosNegocio): ExemplosProdutos {
  return exemplos.produtos ?? (SEGMENTOS.find((item) => item.valor === 'BOLOS_TORTAS')?.exemplos.produtos as ExemplosProdutos);
}

/** Os exemplos de serviços do segmento (sem eles, os de uma manicure). */
export function exemplosDeServicos(exemplos: ExemplosNegocio): ExemplosServicos {
  return exemplos.servicos ?? (SEGMENTOS.find((item) => item.valor === 'MANICURE')?.exemplos.servicos as ExemplosServicos);
}

/** A agenda dos exemplos (só serviços com agenda; sem ela, a de uma manicure). */
export function exemplosDaAgenda(exemplos: ExemplosNegocio): NonNullable<ExemplosServicos['agenda']> {
  return (
    exemplos.servicos?.agenda ??
    (SEGMENTOS.find((item) => item.valor === 'MANICURE')?.exemplos.servicos?.agenda as NonNullable<ExemplosServicos['agenda']>)
  );
}

/** ["Coxinha", "Kibe", "Risole"] -> "coxinha, kibe e risole" (para as falas dos exemplos). */
export function listaEmTexto(valores: string[]): string {
  const minusculos = valores.map((valor) => valor.charAt(0).toLowerCase() + valor.slice(1));
  return minusculos.length > 1 ? `${minusculos.slice(0, -1).join(', ')} e ${minusculos[minusculos.length - 1]}` : minusculos.join('');
}
