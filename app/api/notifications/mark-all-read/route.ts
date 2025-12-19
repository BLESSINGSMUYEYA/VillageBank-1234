import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Mark all notifications as read for the user
    await prisma.notification.updateMany({
      where: {
        userId: userId,
        read: false
      },
      data: {
        read: true
      }
    })

    return NextResponse.json({
      message: 'All notifications marked as read'
    })

  } catch (error) {
    console.error('Mark all notifications read error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
