import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import webpush from 'web-push'

// Initialize web-push
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    )
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session?.userId || session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { title, message, url } = await request.json()

        if (!title || !message) {
            return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
        }

        // 1. Get all subscriptions
        const subscriptions = await prisma.pushSubscription.findMany()

        // 2. Send notifications in parallel
        const results = await Promise.allSettled(subscriptions.map(async (sub) => {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth
                        }
                    },
                    JSON.stringify({
                        title,
                        message,
                        url: url || '/dashboard'
                    })
                )
                return { status: 'fulfilled', id: sub.id }
            } catch (error: any) {
                // If 410, removing subscription
                if (error.statusCode === 410) {
                    await prisma.pushSubscription.delete({ where: { id: sub.id } })
                }
                throw error
            }
        }))

        const successCount = results.filter(r => r.status === 'fulfilled').length

        // 3. Log to persistent notifications for all users (optional, but good for history)
        // This can be heavy if many users, for now let's just create an announcement record of type BROADCAST_ONLY
        await prisma.announcement.create({
            data: {
                title,
                message,
                link: url,
                type: 'BROADCAST_ONLY',
                createdById: session.userId,
                isActive: false // purely for history
            }
        })

        return NextResponse.json({
            success: true,
            sent: successCount,
            total: subscriptions.length
        })

    } catch (error) {
        console.error('Broadcast error:', error)
        return NextResponse.json({ error: 'Broadcast failed' }, { status: 500 })
    }
}
