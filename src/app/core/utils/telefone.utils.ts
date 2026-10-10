import { formatarTelefone, somenteDigitos } from './texto.utils';

/**
 * Converte qualquer formato de número brasileiro para "(DD) 9XXXX-XXXX".
 * Aceita "+55 83 99999-0000", "5583999990000", "083 99999 0000"...
 * Devolve `null` quando não sobra um número com DDD (10 ou 11 dígitos).
 */
export function normalizarTelefoneBrasil(texto: string): string | null {
  let digitos = somenteDigitos(texto);
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith('55')) {
    digitos = digitos.slice(2);
  }
  if (digitos.length === 11 && digitos.startsWith('0')) {
    digitos = digitos.slice(1);
  }
  if (digitos.length === 12 && digitos.startsWith('0')) {
    digitos = digitos.slice(1);
  }
  return digitos.length === 10 || digitos.length === 11 ? formatarTelefone(digitos) : null;
}

/** Chave para comparar números escritos de jeitos diferentes. */
export function chaveTelefone(texto: string): string {
  return somenteDigitos(normalizarTelefoneBrasil(texto) ?? texto);
}
