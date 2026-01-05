'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, BellOff } from 'lucide-react'
import { toast } from 'sonner'

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

export function PushManager() {
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
            const registration = await navigator.serviceWorker.ready
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

            if (!vapidPublicKey) {
                throw new Error("VAPID Public Key not found")
            }

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
            })

            setSubscription(sub)

            // Send to backend
            await fetch('/api/web-push/subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sub)
            })

            toast.success('Notifications enabled!')
        } catch (error) {
            console.error('Failed to subscribe', error)
            toast.error('Failed to enable notifications')
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
            >
                <BellOff className="w-4 h-4 mr-2" />
                Disable Notifications
            </Button>
        )
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={subscribeToPush}
            className="text-xs font-bold border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300"
        >
            <Bell className="w-4 h-4 mr-2" />
            Enable Notifications
        </Button>
    )
}
