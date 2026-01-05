import webpush from 'web-push'

if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn('VAPID keys are missing. Web Push Notifications will not work.')
} else {
    webpush.setVapidDetails(
        'mailto:mwenitete@example.com', // Replace with your actual contact email
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    )
}

export const sendNotification = async (subscription: webpush.PushSubscription, payload: string) => {
    try {
        const result = await webpush.sendNotification(subscription, payload)
        return { success: true, result }
    } catch (error) {
        console.error('Error sending push notification:', error)
        return { success: false, error }
    }
}

export default webpush
