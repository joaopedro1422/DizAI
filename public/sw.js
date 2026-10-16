/*
 * Service worker do DizAI. Faz só duas coisas: mostrar as notificações push e abrir o painel no toque.
 * Não guarda páginas em cache de propósito: o app sempre carrega a versão mais nova do servidor.
 */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (evento) => evento.waitUntil(self.clients.claim()));

/** Corpo enviado pelo backend (NotificacaoPushService): { titulo, corpo, url, tag }. */
self.addEventListener('push', (evento) => {
  let dados = {};
  try {
    dados = evento.data ? evento.data.json() : {};
  } catch {
    dados = { corpo: evento.data ? evento.data.text() : '' };
  }
  const titulo = dados.titulo || 'DizAI';
  evento.waitUntil(
    self.registration.showNotification(titulo, {
      body: dados.corpo || '',
      icon: '/icones/icone-192.png',
      badge: '/icones/badge-96.png',
      tag: dados.tag || undefined,
      renotify: Boolean(dados.tag),
      data: { url: dados.url || '/painel' },
    }),
  );
});

/** Toque na notificação: reaproveita uma janela aberta do DizAI ou abre uma nova no endereço indicado. */
self.addEventListener('notificationclick', (evento) => {
  evento.notification.close();
  const destino = new URL(evento.notification.data?.url || '/painel', self.location.origin).href;
  evento.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((janelas) => {
      const aberta = janelas.find((janela) => janela.url.startsWith(self.location.origin));
      if (aberta) {
        return aberta.focus().then((janela) => (janela && 'navigate' in janela ? janela.navigate(destino) : undefined));
      }
      return self.clients.openWindow(destino);
    }),
  );
});
