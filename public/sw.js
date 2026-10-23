/*
 * Service worker do DizAI. Faz só duas coisas: mostrar as notificações push e abrir o painel no toque.
 * Não guarda páginas em cache de propósito: o app sempre carrega a versão mais nova do servidor.
 */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (evento) => evento.waitUntil(self.clients.claim()));

/**
 * Bolinha no ícone do app (Badging API): o número de avisos com `marca` (agendamento novo ou pedido para fechar)
 * ainda na bandeja. Some quando o lojista abre a tela (core/utils/marca-icone.ts) ou descarta os avisos.
 * Onde o navegador não tem a API (ex.: Android), o próprio sistema mostra o ponto enquanto há notificação.
 */
async function atualizarMarca() {
  if (!('setAppBadge' in self.navigator)) return;
  const avisos = await self.registration.getNotifications();
  const total = avisos.filter((aviso) => aviso.data && aviso.data.marca).length;
  try {
    await (total > 0 ? self.navigator.setAppBadge(total) : self.navigator.clearAppBadge());
  } catch {
    // sem permissão ou não instalado: fica sem a bolinha
  }
}

/** Corpo enviado pelo backend (NotificacaoPushService): { titulo, corpo, url, tag, marca? }. */
self.addEventListener('push', (evento) => {
  let dados = {};
  try {
    dados = evento.data ? evento.data.json() : {};
  } catch {
    dados = { corpo: evento.data ? evento.data.text() : '' };
  }
  const titulo = dados.titulo || 'DizAI';
  evento.waitUntil(
    self.registration
      .showNotification(titulo, {
        body: dados.corpo || '',
        icon: '/icones/icone-192.png',
        badge: '/icones/badge-96.png',
        tag: dados.tag || undefined,
        renotify: Boolean(dados.tag),
        // Android vibra junto com o som do sistema (o iPhone ignora)
        vibrate: [200, 100, 200],
        data: { url: dados.url || '/painel', marca: dados.marca || null },
      })
      .then(atualizarMarca),
  );
});

self.addEventListener('notificationclose', (evento) => evento.waitUntil(atualizarMarca()));

/** Toque na notificação: reaproveita uma janela aberta do DizAI ou abre uma nova no endereço indicado. */
self.addEventListener('notificationclick', (evento) => {
  evento.notification.close();
  void atualizarMarca();
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
