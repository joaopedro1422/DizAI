/** Ajudantes das animações da marca nova (landing de vendas e hub). */

/** Quem pediu menos movimento no sistema vê tudo parado, já no estado final. */
export function semMovimento(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function esperar(ms: number): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

/** Chama `aoAparecer` uma vez, quando o elemento entra na tela (sem IntersectionObserver, na hora). */
export function quandoAparecer(elemento: Element, aoAparecer: () => void, limite = 0.3): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    aoAparecer();
    return () => undefined;
  }
  const observador = new IntersectionObserver(
    ([entrada]) => {
      if (entrada.isIntersecting) {
        observador.disconnect();
        aoAparecer();
      }
    },
    { threshold: limite },
  );
  observador.observe(elemento);
  return () => observador.disconnect();
}
