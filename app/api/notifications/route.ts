import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.userId

    // Get notifications for the user
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to 50 most recent notifications
    })

    return NextResponse.json({
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
        actionUrl: n.actionUrl,
        actionText: n.actionText
      }))
    })

  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.userId

    const body = await request.json()
    const { type, title, message, actionUrl, actionText } = body

    // Create a new notification (for system notifications or admin use)
    const notification = await prisma.notification.create({
      data: {
        userId: userId,
        type: type || 'INFO',
        title,
        message,
        actionUrl,
        actionText,
        read: false
      }
    })

    return NextResponse.json({
      notification: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
        actionUrl: notification.actionUrl,
        actionText: notification.actionText
      }
    })

  } catch (error) {
    console.error('Notification creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
