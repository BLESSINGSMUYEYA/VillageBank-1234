import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const userId = session?.userId as string

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'user' | 'group' | 'all'
    const groupId = searchParams.get('groupId')
    const dateRange = searchParams.get('dateRange') || 'month'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Calculate date filter
    const now = new Date()
    let dateFilter = new Date()
    switch (dateRange) {
      case 'week':
        dateFilter.setDate(now.getDate() - 7)
        break
      case 'month':
        dateFilter.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        dateFilter.setMonth(now.getMonth() - 3)
        break
      case 'year':
        dateFilter.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
        dateFilter = new Date(0) // Beginning of time
        break
    }

    // Build where clause
    const where: any = {
      createdAt: { gte: dateFilter }
    }

    if (type === 'user') {
      where.userId = userId
    } else if (type === 'group' && groupId) {
      where.groupId = groupId
      // Only show activities for groups the user is a member of
      const member = await prisma.groupMember.findFirst({
        where: {
          groupId,
          userId,
          status: 'ACTIVE'
        }
      })
      if (!member) {
        return NextResponse.json(
          { error: 'Access denied to this group' },
          { status: 403 }
        )
      }
    } else {
      // Default to user's activities
      where.userId = userId
    }

    // Get activities with pagination
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          group: {
            select: {
              id: true,
              name: true,
              region: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.activity.count({ where })
    ])

    // Format activities
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      actionType: activity.actionType,
      description: activity.description,
      metadata: activity.metadata,
      createdAt: activity.createdAt.toISOString(),
      user: activity.user,
      group: activity.group,
      // Add formatted fields for easier consumption
      type: activity.actionType.includes('CONTRIBUTION') ? 'contribution' :
        activity.actionType.includes('LOAN') ? 'loan' :
          activity.actionType.includes('GROUP') ? 'group' : 'system',
      severity: activity.actionType.includes('DELETE') || activity.actionType.includes('REJECT') ? 'high' :
        activity.actionType.includes('CREATE') || activity.actionType.includes('APPROVE') ? 'medium' : 'low'
    }))

    return NextResponse.json({
      activities: formattedActivities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        total,
        dateRange,
        type
      }
    })

  } catch (error) {
    console.error('Audit trail fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const userId = session?.userId as string

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { actionType, description, groupId, metadata } = body

    if (!actionType || !description) {
      return NextResponse.json(
        { error: 'actionType and description are required' },
        { status: 400 }
      )
    }

    // Create audit log entry
    const activity = await prisma.activity.create({
      data: {
        userId,
        actionType,
        description,
        groupId: groupId || null,
        metadata: metadata || {}
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        group: groupId ? {
          select: {
            id: true,
            name: true,
            region: true
          }
        } : false
      }
    })

    return NextResponse.json({
      activity: {
        id: activity.id,
        actionType: activity.actionType,
        description: activity.description,
        metadata: activity.metadata,
        createdAt: activity.createdAt.toISOString(),
        user: activity.user,
        group: activity.group
      }
    })

  } catch (error) {
    console.error('Audit log creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
