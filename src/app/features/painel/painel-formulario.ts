import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import {
  CatalogoConversa,
  ConfiguracoesAtendimento,
  ModoCatalogo,
  ModoFotos,
  ModoPedido,
} from '../../core/models/perfil.model';
import { urlValida } from '../../core/utils/validadores';

/** No modo "link externo", o link do portfólio passa a ser obrigatório. */
const linkObrigatorioNoModoExterno: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const modoFotos = grupo.get('modoFotos')?.value as ModoFotos;
  const link = String(grupo.get('linkPortfolioExterno')?.value ?? '').trim();
  return modoFotos === 'LINK_EXTERNO' && !link ? { linkPortfolioObrigatorio: true } : null;
};

/** No modo "Agendo por outro app", o link de agendamento de lá passa a ser obrigatório. */
const linkAgendamentoNoModoExterno: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const modo = grupo.get('modoPedido')?.value as ModoPedido;
  const link = String(grupo.get('linkAgendamentoExterno')?.value ?? '').trim();
  return modo === 'LINK_EXTERNO' && !link ? { linkAgendamentoObrigatorio: true } : null;
};

/** Formulário das configurações de atendimento editadas na tela "Como o assistente atende". */
export function criarFormularioConfiguracoes(fb: FormBuilder, valores: ConfiguracoesAtendimento) {
  return fb.nonNullable.group(
    {
      modoPedido: fb.nonNullable.control<ModoPedido>(valores.modoPedido),
      camposPedido: [valores.camposPedido, Validators.maxLength(500)],
      modoFotos: fb.nonNullable.control<ModoFotos>(valores.modoFotos),
      linkPortfolioExterno: [valores.linkPortfolioExterno, [urlValida, Validators.maxLength(500)]],
      saudacaoPersonalizada: [valores.saudacaoPersonalizada, Validators.maxLength(1000)],
      instrucoesObrigatorias: [valores.instrucoesObrigatorias, Validators.maxLength(1500)],
      modoCatalogo: fb.nonNullable.control<ModoCatalogo>(valores.modoCatalogo ?? 'NAO'),
      /** Arquivos já salvos; os escolhidos agora ficam no painel e sobem ao salvar. */
      catalogoArquivos: fb.nonNullable.control<string[]>(valores.catalogoArquivos ?? []),
      /** Os catálogos (o 1º é o de catalogoArquivos); com 2 ou 3, cada um com assunto e contexto. */
      catalogos: fb.nonNullable.control<CatalogoConversa[]>(catalogosIniciais(valores)),
      /** false = só no horário de funcionamento cadastrado em Dados da loja. */
      confirmaQualquerHora: fb.nonNullable.control<boolean>(valores.confirmaQualquerHora ?? true),
      linkAgendamentoExterno: [valores.linkAgendamentoExterno ?? '', [urlValida, Validators.maxLength(500)]],
    },
    { validators: [linkObrigatorioNoModoExterno, linkAgendamentoNoModoExterno] },
  );
}

export type FormularioConfiguracoes = ReturnType<typeof criarFormularioConfiguracoes>;

/** Sempre pelo menos um catálogo (o de catalogoArquivos), com assunto e contexto em texto (vazio = sem). */
export function catalogosIniciais(valores: Partial<ConfiguracoesAtendimento>): CatalogoConversa[] {
  const lista = valores.catalogos?.length
    ? valores.catalogos
    : [{ assunto: '', contexto: '', arquivos: valores.catalogoArquivos ?? [] }];
  return lista.map((c) => ({ assunto: c.assunto ?? '', contexto: c.contexto ?? '', arquivos: [...c.arquivos] }));
}
