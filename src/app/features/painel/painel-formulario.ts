import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { ConfiguracoesAtendimento, ModoFotos, ModoPedido } from '../../core/models/perfil.model';
import { urlValida } from '../../core/utils/validadores';

/** No modo "link externo", o link do portfólio passa a ser obrigatório. */
const linkObrigatorioNoModoExterno: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const modoFotos = grupo.get('modoFotos')?.value as ModoFotos;
  const link = String(grupo.get('linkPortfolioExterno')?.value ?? '').trim();
  return modoFotos === 'LINK_EXTERNO' && !link ? { linkPortfolioObrigatorio: true } : null;
};

/** Formulário das configurações de atendimento editadas na tela inicial do painel. */
export function criarFormularioConfiguracoes(fb: FormBuilder, valores: ConfiguracoesAtendimento) {
  return fb.nonNullable.group(
    {
      modoPedido: fb.nonNullable.control<ModoPedido>(valores.modoPedido),
      camposPedido: [valores.camposPedido, Validators.maxLength(500)],
      modoFotos: fb.nonNullable.control<ModoFotos>(valores.modoFotos),
      linkPortfolioExterno: [valores.linkPortfolioExterno, [urlValida, Validators.maxLength(500)]],
      saudacaoPersonalizada: [valores.saudacaoPersonalizada, Validators.maxLength(1000)],
      instrucoesObrigatorias: [valores.instrucoesObrigatorias, Validators.maxLength(1500)],
    },
    { validators: linkObrigatorioNoModoExterno },
  );
}

export type FormularioConfiguracoes = ReturnType<typeof criarFormularioConfiguracoes>;
