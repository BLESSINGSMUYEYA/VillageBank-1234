'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            // Register SW in both production and development for PWA/Push testing
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope)
                })
                .catch((err) => {
                    console.error('ServiceWorker registration failed: ', err)
                })
        }
    }, [])

    return null
}
