/** Adiciona ou remove um valor de uma lista, devolvendo uma nova lista. */
export function alternarItem<T>(lista: T[], item: T): T[] {
  return lista.includes(item) ? lista.filter((atual) => atual !== item) : [...lista, item];
}

/** "1 foto" / "12 fotos" */
export function pluralizar(quantidade: number, singular: string, plural: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}
