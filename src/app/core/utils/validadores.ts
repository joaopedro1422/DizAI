import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { somenteDigitos } from './texto.utils';

/** Exige ao menos um item selecionado em um controle de lista. */
export const listaNaoVazia: ValidatorFn = (controle: AbstractControl): ValidationErrors | null => {
  const valor = controle.value as unknown[] | null;
  return valor && valor.length > 0 ? null : { listaVazia: true };
};

/** Telefone brasileiro com DDD: 10 ou 11 dígitos. */
export const telefoneValido: ValidatorFn = (controle: AbstractControl): ValidationErrors | null => {
  const digitos = somenteDigitos(String(controle.value ?? ''));
  if (!digitos) {
    return null; // o "required" cuida do campo vazio
  }
  return digitos.length === 10 || digitos.length === 11 ? null : { telefoneInvalido: true };
};

/** Aceita apenas URLs http/https bem formadas. */
export function ehUrlValida(valor: string): boolean {
  try {
    const url = new URL(valor.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export const urlValida: ValidatorFn = (controle: AbstractControl): ValidationErrors | null => {
  const valor = String(controle.value ?? '').trim();
  if (!valor) {
    return null;
  }
  return ehUrlValida(valor) ? null : { urlInvalida: true };
};

/** Mostra o erro só depois que o usuário tocou no campo. */
export function campoComErro(controle: AbstractControl | null): boolean {
  return !!controle && controle.invalid && (controle.touched || controle.dirty);
}
