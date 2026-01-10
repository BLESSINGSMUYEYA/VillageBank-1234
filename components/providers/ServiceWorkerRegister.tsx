'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            const isProduction = process.env.NODE_ENV === 'production'

            if (isProduction || isLocal) {
                // Register SW in production
                navigator.serviceWorker
                    .register('/sw.js')
                    .then((registration) => {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope)
                    })
                    .catch((err) => {
                        console.error('ServiceWorker registration failed: ', err)
                    })
            } else {
                // Unregister in dev/local
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
