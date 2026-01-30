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

        const { title, message, url, target, region, imageUrl, actionText } = await request.json()

        if (!title || !message) {
            return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
        }

        // Define where clause based on target
        let whereClause: any = {}

        switch (target) {
            case 'REGIONAL_ADMINS':
                whereClause = { role: 'REGIONAL_ADMIN' }
                break
            case 'UNVERIFIED_IDENTITY':
                whereClause = { identityVerification: null }
                break
            case 'REGION':
                if (region) {
                    whereClause = { region: region }
                }
                break
            case 'ALL':
            default:
                whereClause = {}
                break
        }

        // 1. Get all subscriptions for target users
        const subscriptions = await prisma.pushSubscription.findMany({
            where: {
                user: whereClause
            },
            include: {
                user: true
            }
        })

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

        // 3. Log to persistent notifications for target users
        // Create announcement first
        const announcement = await prisma.announcement.create({
            data: {
                title,
                message,
                link: url,
                type: 'BROADCAST_ONLY',
                createdById: session.userId,
                isActive: false // purely for history
            }
        })

        // Fetch user IDs matching the same filter criteria
        const targetUsers = await prisma.user.findMany({
            where: whereClause,
            select: { id: true }
        })

        if (targetUsers.length > 0) {
            await prisma.notification.createMany({
                data: targetUsers.map(u => ({
                    userId: u.id,
                    type: 'INFO',
                    title: title,
                    message: message,
                    actionUrl: url || '/dashboard',
                    actionText: actionText || 'View', // Use custom action text
                    announcementId: announcement.id,
                    read: false
                }))
            })
        }

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
