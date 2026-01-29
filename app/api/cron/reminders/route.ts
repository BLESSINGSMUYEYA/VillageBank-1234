
import { getDueReminders, markReminderAsNotified } from '@/lib/reminders'
import { sendNotification } from '@/lib/web-push'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow running without auth in development for testing
        if (process.env.NODE_ENV !== 'development') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    // Reset dismissed recurring reminders from previous days
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    await prisma.reminder.updateMany({
        where: {
            isDismissed: true,
            isRecurring: true,
            lastDismissedAt: {
                lt: startOfToday
            }
        },
        data: {
            isDismissed: false
        }
    })

    const { success, data: reminders, error } = await getDueReminders()

    if (!success || !reminders) {
        return NextResponse.json({ error }, { status: 500 })
    }

    const results = []

    for (const reminder of reminders) {
        if (reminder.user.pushSubscriptions.length > 0) {
            for (const sub of reminder.user.pushSubscriptions) {
                const payload = JSON.stringify({
                    title: `Reminder: ${reminder.title}`,
                    body: reminder.description || `You have a reminder for ${new Date(reminder.datetime).toLocaleTimeString()}`,
                    icon: '/icon-192x192.png',
                    data: {
                        url: reminder.link || '/dashboard'
                    }
                })

                // Construct PushSubscription object from DB data
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                }

                const result = await sendNotification(pushSubscription, payload)
                if ((result as any).error?.statusCode === 410) {
                    console.log(`Deleting expired subscription: ${sub.endpoint}`)
                    await prisma.pushSubscription.delete({
                        where: { endpoint: sub.endpoint }
                    }).catch(err => console.error('Failed to delete subscription', err))
                }
            }
        }

        await markReminderAsNotified(reminder.id)
        results.push({ id: reminder.id, title: reminder.title, status: 'sent' })
    }

    return NextResponse.json({ success: true, processed: results.length, results })
}
