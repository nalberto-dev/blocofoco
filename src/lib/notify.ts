export const notifSupported = () => 'Notification' in window

export async function ensureNotifPermission() {
  if (!notifSupported()) return 'unsupported'
  if (Notification.permission === 'default') return Notification.requestPermission()
  return Notification.permission
}

export async function notify(title: string, body: string) {
  if (!notifSupported() || Notification.permission !== 'granted') return
  const options = { body, icon: '/pwa-192x192.png', badge: '/pwa-192x192.png', tag: 'blocofoco' }
  try {
    // No Android, só showNotification via Service Worker funciona
    if ('serviceWorker' in navigator) {
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<undefined>((r) => setTimeout(() => r(undefined), 1500)),
      ])
      if (reg) return void (await reg.showNotification(title, options))
    }
    new Notification(title, options)
  } catch {
    /* sem notificação: o som e a vibração continuam */
  }
}