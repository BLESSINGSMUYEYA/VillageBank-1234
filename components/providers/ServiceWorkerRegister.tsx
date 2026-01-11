'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            // Only register SW in production to avoid hydration mismatch and stale cache in dev
            if (process.env.NODE_ENV === 'production') {
                navigator.serviceWorker
                    .register('/sw.js')
                    .then((registration) => {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope)
                    })
                    .catch((err) => {
                        console.error('ServiceWorker registration failed: ', err)
                    })
            } else {
                // Aggressively unregister in dev to clean up any stale workers
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                    for (const registration of registrations) {
                        registration.unregister()
                        console.log('ServiceWorker unregistered (Dev/Localhost)')
                    }
                })
            }
        }
    }, [])

    return null
}
