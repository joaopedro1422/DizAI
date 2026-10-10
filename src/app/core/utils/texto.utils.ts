/** Remove acentos e deixa em minúsculas. */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** "Unhas em Gel!" → "unhas-em-gel" */
export function gerarSlug(texto: string): string {
  const slug = normalizarTexto(texto)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'item';
}

/** "Ana Clara Souza" → "AC" */
export function obterIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) {
    return '?';
  }
  const primeira = partes[0][0];
  const segunda = partes.length > 1 ? partes[1][0] : '';
  return (primeira + segunda).toUpperCase();
}

export function somenteDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}

/** Formata enquanto o usuário digita: "83999990000" → "(83) 99999-0000". */
export function formatarTelefone(texto: string): string {
  const digitos = somenteDigitos(texto).slice(0, 11);
  if (digitos.length <= 2) {
    return digitos.length ? `(${digitos}` : '';
  }
  const ddd = digitos.slice(0, 2);
  const numero = digitos.slice(2);
  if (numero.length <= 4) {
    return `(${ddd}) ${numero}`;
  }
  const corte = numero.length === 9 ? 5 : 4;
  return `(${ddd}) ${numero.slice(0, corte)}-${numero.slice(corte)}`;
}

/**
 * Link do WhatsApp para um número brasileiro.
 * Aceita "(83) 99999-0000" (sem DDI) ou "5583999990000" (com DDI, como o backend guarda).
 * Decide pelo tamanho, não pelo "55" do começo: DDD 55 (RS) também começa assim.
 */
export function gerarLinkWhatsapp(telefone: string): string {
  const digitos = somenteDigitos(telefone);
  const comPais = digitos.length <= 11 ? `55${digitos}` : digitos;
  return `https://wa.me/${comPais}`;
}

/** "Unhas, gel , ,nail art" → ["Unhas", "gel", "nail art"] */
export function separarPorVirgula(texto: string): string[] {
  return texto
    .split(',')
    .map((parte) => parte.trim())
    .filter(Boolean);
}
