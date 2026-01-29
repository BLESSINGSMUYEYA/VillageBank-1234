
import { getUsersForNudge, determineNudgeType, updateNudgeTimestamp } from '@/lib/nudges'
import { sendNudgeEmail } from '@/lib/mail'
import { sendNotification } from '@/lib/web-push'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow running without auth in development for testing
        if (process.env.NODE_ENV !== 'development') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    const users = await getUsersForNudge()
    const results = []

    for (const user of users) {
        const nudgeType = determineNudgeType(user)

        if (!nudgeType) continue

        let sent = false

        // Try Push Notification first
        if (user.pushSubscriptions.length > 0) {
            for (const sub of user.pushSubscriptions) {
                const payload = JSON.stringify({
                    title: nudgeType === 'VERIFY_IDENTITY' ? 'Complete your Profile' : 'Stay Connected',
                    body: nudgeType === 'VERIFY_IDENTITY'
                        ? 'Please verify your identity to access all features.'
                        : 'Turn on notifications to get important updates.',
                    icon: '/icon-192x192.png',
                    data: {
                        url: nudgeType === 'VERIFY_IDENTITY' ? '/profile' : '/dashboard'
                    }
                })

                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                }

                const result = await sendNotification(pushSubscription, payload)
                if (result.success) sent = true
            }
        }

        // Fallback to Email if no Push or Push failed (or maybe just send email anyway for importance?)
        // Let's send Email if no push subscriptions.
        if (user.pushSubscriptions.length === 0) {
            const emailResult = await sendNudgeEmail(user.email, nudgeType)
            if (emailResult.success) sent = true
        }

        if (sent) {
            await updateNudgeTimestamp(user.id)
            results.push({ userId: user.id, email: user.email, type: nudgeType, status: 'sent' })
        }
    }

    return NextResponse.json({ success: true, processed: results.length, results })
}
