/**
 * Bolinha no ícone do app instalado (Badging API), acesa pelo service worker (public/sw.js) quando chega um
 * agendamento novo ou um pedido para fechar. Ao abrir a tela correspondente, os avisos desse tipo saem da bandeja
 * e a bolinha passa a contar só os que sobraram (zero = some).
 */
export type MarcaIcone = 'agenda' | 'pedido';

export async function limparMarcaIcone(tipo: MarcaIcone): Promise<void> {
  try {
    const registro = await navigator.serviceWorker?.getRegistration();
    const avisos = registro ? await registro.getNotifications() : [];
    avisos.filter((aviso) => aviso.data?.marca === tipo).forEach((aviso) => aviso.close());
    const restantes = avisos.filter((aviso) => aviso.data?.marca && aviso.data.marca !== tipo).length;
    const nav = navigator as Navigator & {
      setAppBadge?: (total?: number) => Promise<void>;
      clearAppBadge?: () => Promise<void>;
    };
    await (restantes > 0 ? nav.setAppBadge?.(restantes) : nav.clearAppBadge?.());
  } catch {
    // navegador sem a API ou sem service worker: nada a limpar
  }
}
