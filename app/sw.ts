
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "@serwist/precaching";
import { installSerwist } from "@serwist/sw";
import { getPendingContributions, deleteContribution, saveSharedFile } from "../lib/idb";
import { uploadReceipt } from "../lib/upload";

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

self.addEventListener('push', (event: any) => {
    const data = event.data?.json() ?? { title: 'Village Banking', message: 'New notification' }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.message,
            icon: '/android-chrome-192x192.png',
            badge: '/favicon-32x32.png',
            image: data.image,
            data: { url: data.url || '/' },
            actions: data.actions
        })
    )
})

self.addEventListener('notificationclick', (event: any) => {
    event.notification.close()

    // Handle action buttons
    if (event.action === 'open_url') {
        event.waitUntil(
            self.clients.openWindow(event.notification.data.url)
        )
        return
    }

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList: any) => {
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

self.addEventListener('sync', (event: any) => {
    if (event.tag === 'sync-contributions') {
        event.waitUntil(syncContributions());
    }
});

async function syncContributions() {
    try {
        const pending = await getPendingContributions();
        // console.log(`Found ${pending.length} pending contributions to sync.`);

        for (const contribution of pending) {
            try {
                let receiptUrl = '';
                if (contribution.file) {
                    receiptUrl = await uploadReceipt(contribution.file);
                }

                const payload = {
                    ...contribution.payload,
                    receiptUrl: receiptUrl || contribution.payload.receiptUrl,
                };

                const res = await fetch('/api/contributions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    await deleteContribution(contribution.id!);

                    // Notify user is tricky if we don't have window access, but showNotification works in SW
                    self.registration.showNotification('Contribution Synced', {
                        body: `Your payment of MWK ${payload.amount} has been submitted successfully.`,
                        icon: '/android-chrome-192x192.png'
                    });
                }
            } catch (err) {
                console.error('Error processing contribution', err);
            }
        }
    } catch (err) {
        console.error('Sync failed', err);
    }
}


