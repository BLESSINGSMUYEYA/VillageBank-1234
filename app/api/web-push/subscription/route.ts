
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        // Get session
        const session = await getSessionFromRequest(request)

        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { userId } = session
        const subscription = await request.json()

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
        }

        // Save subscription
        await prisma.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint }, // Ensure unique endpoints
            update: {
                userId,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
            create: {
                userId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            }
        })

        return NextResponse.json({ success: true, message: 'Subscription saved' })

    } catch (error) {
        console.error('Error saving subscription:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request)

        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { userId } = session
        const { endpoint } = await request.json()

        if (!endpoint) {
            return NextResponse.json({ error: 'Endpoint required' }, { status: 400 })
        }

        await prisma.pushSubscription.deleteMany({
            where: {
                endpoint: endpoint,
                userId
            }
        })

        return NextResponse.json({ success: true, message: 'Subscription removed' })
    } catch (error) {
        console.error('Error deleting subscription:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
