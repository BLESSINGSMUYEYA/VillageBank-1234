import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's recent activities
    const activities = await prisma.activity.findMany({
      where: {
        userId: userId,
      },
      include: {
        group: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    })

    // Format activities for dashboard
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.actionType,
      description: activity.description,
      amount: activity.metadata?.amount as number | undefined,
      createdAt: activity.createdAt.toISOString(),
      groupName: activity.group?.name || 'Unknown Group',
    }))

    return NextResponse.json({ activities: formattedActivities })

  } catch (error) {
    console.error('Dashboard activity error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
