import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { FormaPagamento, FormaRecebimento, PrazoMinimo, RamoNegocio } from '../../core/models/perfil.model';
import { listaNaoVazia, telefoneValido } from '../../core/utils/validadores';

export const TAMANHO_MINIMO_SENHA = 8;

/** A confirmação precisa ser igual à senha. */
const senhasIguais: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const senha = grupo.get('senha')?.value;
  const confirmacao = grupo.get('confirmacaoSenha')?.value;
  return confirmacao && senha !== confirmacao ? { senhasDiferentes: true } : null;
};

/** Nome, nome do negócio e descrição. Usado no cadastro e no modal "Dados da loja". */
export function criarGrupoDadosNegocio(fb: FormBuilder) {
  return fb.nonNullable.group({
    nomeResponsavel: ['', [Validators.required, Validators.maxLength(80)]],
    nomeLoja: ['', [Validators.required, Validators.maxLength(80)]],
    descricao: ['', [Validators.required, Validators.maxLength(300)]],
  });
}

/** Formas de pagamento, como o cliente recebe e antecedência. Configurado no painel. */
export function criarGrupoPagamentoEntrega(fb: FormBuilder) {
  return fb.nonNullable.group({
    formasPagamento: fb.nonNullable.control<FormaPagamento[]>([], listaNaoVazia),
    formasRecebimento: fb.nonNullable.control<FormaRecebimento[]>([], listaNaoVazia),
    distanciaMaximaKm: [''],
    taxaEntrega: [''],
    prazoMinimo: fb.nonNullable.control<PrazoMinimo>('SEM_ANTECEDENCIA'),
  });
}

/** Formulário completo do cadastro, com um grupo por passo. */
export function criarFormularioCadastro(fb: FormBuilder) {
  return fb.nonNullable.group({
    dadosNegocio: criarGrupoDadosNegocio(fb),
    acesso: fb.nonNullable.group(
      {
        whatsapp: ['', [Validators.required, telefoneValido]],
        senha: ['', [Validators.required, Validators.minLength(TAMANHO_MINIMO_SENHA), Validators.maxLength(72)]],
        confirmacaoSenha: ['', Validators.required],
      },
      { validators: senhasIguais },
    ),
    ramo: fb.nonNullable.control<RamoNegocio>('SERVICOS_PRESENCIAIS'),
  });
}

export type FormularioCadastro = ReturnType<typeof criarFormularioCadastro>;
export type GrupoDadosNegocio = ReturnType<typeof criarGrupoDadosNegocio>;
export type GrupoAcesso = FormularioCadastro['controls']['acesso'];
export type ControleRamo = FormularioCadastro['controls']['ramo'];
export type GrupoPagamentoEntrega = ReturnType<typeof criarGrupoPagamentoEntrega>;
