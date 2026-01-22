'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, BellOff } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState(false)
    const [subscription, setSubscription] = useState<PushSubscription | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true)
            registerServiceWorker()
        } else {
            setLoading(false)
        }
    }, [])

    async function registerServiceWorker() {
        try {
            // Check if we are in dev mode and SW is not registered
            if (process.env.NODE_ENV === 'development') {
                // In dev, sometimes we need to register manually if next-pwa is disabled
                await navigator.serviceWorker.register('/sw.js')
            }

            const registration = await navigator.serviceWorker.ready
            const sub = await registration.pushManager.getSubscription()
            setSubscription(sub)
        } catch (error) {
            console.error('Error getting subscription', error)
        } finally {
            setLoading(false)
        }
    }

    async function subscribeToPush() {
        setLoading(true)
        try {
            if (!('serviceWorker' in navigator)) {
                throw new Error('Service Worker not supported');
            }

            if (!('PushManager' in window)) {
                throw new Error('Push Manager not supported');
            }

            const registration = await navigator.serviceWorker.ready

            if (!registration) {
                throw new Error('Service Worker not ready');
            }

            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            if (!vapidPublicKey) {
                throw new Error("VAPID Public Key not found in environment variables")
            }

            // console.log('Using VAPID Key:', vapidPublicKey.substring(0, 10) + '...');

            // Request permission specifically if not granted
            if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    throw new Error('Notification permission denied');
                }
            } else if (Notification.permission === 'denied') {
                throw new Error('Notification permission was previously denied. Please enable it in browser settings.');
            }

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey.trim())
            })

            setSubscription(sub)

            // Send to backend
            const response = await fetch('/api/web-push/subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sub)
            })

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save subscription on server');
            }

            toast.success('Notifications enabled!')
        } catch (error: any) {
            console.error('Failed to subscribe:', error)
            toast.error(error.message || 'Failed to enable notifications')
        } finally {
            setLoading(false)
        }
    }

    async function unsubscribeFromPush() {
        setLoading(true)
        try {
            if (subscription) {
                await subscription.unsubscribe()

                // Remove from backend
                await fetch('/api/web-push/subscription', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ endpoint: subscription.endpoint })
                })

                setSubscription(null)
                toast.success('Notifications disabled')
            }
        } catch (error) {
            console.error('Failed to unsubscribe', error)
            toast.error('Failed to disable notifications')
        } finally {
            setLoading(false)
        }
    }

    if (!isSupported) return null

    if (loading) {
        return (
            <Button variant="ghost" size="sm" disabled>
                Loading...
            </Button>
        )
    }

    if (subscription) {
        return (
            <Button
                variant="ghost"
                size="sm"
                onClick={unsubscribeFromPush}
                className="text-xs font-bold text-muted-foreground hover:text-red-500"
                title="Disable Notifications"
            >
                <BellOff className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Disable Notifications</span>
            </Button>
        )
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={subscribeToPush}
            className="text-xs font-bold border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300"
            title="Enable Notifications"
        >
            <Bell className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Enable Notifications</span>
        </Button>
    )
}
