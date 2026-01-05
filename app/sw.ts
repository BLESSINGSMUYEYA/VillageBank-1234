
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "@serwist/precaching";
import { installSerwist } from "@serwist/sw";

declare global {
    interface WorkerGlobalScope {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: any;

installSerwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: defaultCache,
});

self.addEventListener('push', (event) => {
    const data = event.data?.json() ?? { title: 'Village Banking', message: 'New notification' }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.message,
            icon: '/android-chrome-192x192.png',
            badge: '/favicon-32x32.png', // Add a suitable badge image
            data: { url: data.url || '/' }
        })
    )
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                let client = clientList[0]
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i]
                    }
                }
                return client.focus()
            }
            return self.clients.openWindow(event.notification.data.url)
        })
    )
})
