import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const userId = session?.userId

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId as string },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get system-wide metrics
    const [totalUsers, totalGroups, totalContributions, activeLoans, pendingApprovals] = await Promise.all([
      prisma.user.count(),
      prisma.group.count({ where: { isActive: true } }),
      prisma.contribution.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.loan.count({ where: { status: 'ACTIVE' } }),
      prisma.loan.count({ where: { status: 'PENDING' } })
    ])

    // Get regional summaries
    const regions = ['NORTHERN', 'CENTRAL', 'SOUTHERN'] as const
    const regionalSummaries = await Promise.all(
      regions.map(async (region) => {
        const data = await prisma.group.findMany({
          where: { region },
          include: {
            members: { select: { userId: true } },
            contributions: {
              where: { status: 'COMPLETED' },
              select: { amount: true }
            },
            loans: { select: { status: true } }
          }
        })

        const uniqueUsers = new Set(data.flatMap(g => g.members.map(m => m.userId))).size
        const contributions = data.reduce((sum, g) =>
          sum + g.contributions.reduce((s, c) => s + c.amount, 0), 0)
        const loans = data.reduce((sum, g) =>
          sum + g.loans.filter(l => l.status === 'ACTIVE').length, 0)

        const regionalAdmin = await prisma.user.findFirst({
          where: { role: 'REGIONAL_ADMIN', region },
          select: { firstName: true, lastName: true }
        })

        return {
          region: region.charAt(0) + region.slice(1).toLowerCase(),
          users: uniqueUsers,
          groups: data.length,
          contributions,
          loans,
          admin: regionalAdmin ? `${regionalAdmin.firstName} ${regionalAdmin.lastName}` : 'Not assigned'
        }
      })
    )

    // Get recent system activities
    const recentActivities = await prisma.activity.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        group: { select: { name: true } }
      }
    })

    // Get users for management
    const users = await prisma.user.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        region: true,
        phoneNumber: true,
        createdAt: true
      }
    })

    // Get growth history (last 6 months)
    const growthHistory = await Promise.all(
      Array.from({ length: 6 }).map(async (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - (5 - i)) // Going back 5 months to current

        const year = date.getFullYear()
        const month = date.getMonth()

        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)

        const monthName = date.toLocaleString('default', { month: 'short' })

        const [usersCount, contributionsSum] = await Promise.all([
          prisma.user.count({
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          }),
          prisma.contribution.aggregate({
            where: {
              status: 'COMPLETED',
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            },
            _sum: { amount: true }
          })
        ])

        return {
          name: monthName,
          users: usersCount,
          volume: contributionsSum._sum.amount || 0
        }
      })
    )

    // --- ADVANCED GROWTH METRICS ---

    // 1. Viral Funnel (Views vs Conversions)
    // We use QrAnalytics for views and Activity logs for join requests
    const [totalViews, totalJoinRequests] = await Promise.all([
      (prisma as any).qrAnalytics.count(), // Cast to any because QrAnalytics might be new to client type
      prisma.activity.count({
        where: { actionType: 'JOIN_REQUESTED' }
      })
    ])

    // 2. Retention Pulse (Active User Rate - 7 Days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Count unique users who have an activity log in the last 7 days
    const activeUsersCount = await prisma.activity.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: sevenDaysAgo }
      }
    }).then(groups => groups.length)

    const activeUserRate = totalUsers > 0 ? (activeUsersCount / totalUsers) * 100 : 0

    // 3. Growth Leaderboard (Top 5 Groups by New Members in 30 Days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const topGrowingGroupsRaw = await prisma.groupMember.groupBy({
      by: ['groupId'],
      where: {
        joinedAt: { gte: thirtyDaysAgo }
      },
      _count: {
        _all: true
      },
      orderBy: {
        _count: {
          joinedAt: 'desc' // This might need to be _all or specific field depending on prisma version, usually _count._all works for ordering in aggregations but explicit is safer
        }
      },
      take: 5
    })

    // Fetch names for these groups
    const topGrowingGroups = await Promise.all(
      topGrowingGroupsRaw.map(async (item) => {
        const group = await prisma.group.findUnique({
          where: { id: item.groupId },
          select: { name: true, region: true }
        })
        return {
          name: group?.name || 'Unknown Group',
          region: group?.region || 'Global',
          newMembers: item._count._all
        }
      })
    )

    const systemData = {
      totalUsers,
      totalGroups,
      totalContributions: totalContributions._sum.amount || 0,
      activeLoans,
      pendingApprovals,
      systemHealth: 'HEALTHY' as const,
      databaseStatus: 'ONLINE' as const,
      regionalSummaries,
      growthHistory,
      growthEngine: {
        funnel: {
          views: totalViews,
          conversions: totalJoinRequests,
          rate: totalViews > 0 ? ((totalJoinRequests / totalViews) * 100).toFixed(1) : '0.0'
        },
        retention: {
          activeUsers: activeUsersCount,
          rate: activeUserRate.toFixed(1)
        },
        leaderboard: topGrowingGroups
      },
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        user: `${activity.user.firstName} ${activity.user.lastName}`,
        action: activity.actionType,
        description: activity.description,
        timestamp: activity.createdAt,
        group: activity.group?.name
      })),
      users: users.map(u => ({
        id: u.id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'No Name',
        email: u.email,
        role: u.role,
        region: u.region,
        phoneNumber: u.phoneNumber,
        joinedAt: u.createdAt,
        status: 'ACTIVE'
      })),
      configurationHealth: {
        cloudinary: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        gemini: !!process.env.GEMINI_API_KEY,
        database: !!process.env.DATABASE_URL
      }
    }

    return NextResponse.json(systemData)
  } catch (error) {
    console.error('System admin data fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const userId = session?.userId

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId as string },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { action, target, data } = body

    switch (action) {
      case 'backup_database':
        // TODO: Implement database backup logic
        return NextResponse.json({
          message: 'Database backup initiated',
          backupId: `backup_${Date.now()}`
        })

      case 'system_maintenance':
        // TODO: Implement system maintenance logic
        return NextResponse.json({
          message: 'System maintenance mode activated',
          maintenanceId: `maintenance_${Date.now()}`
        })

      case 'assign_regional_admin':
        if (!target?.region || !data?.userId) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        await prisma.user.update({
          where: { id: data.userId },
          data: {
            role: 'REGIONAL_ADMIN',
            region: target.region as any
          }
        })

        return NextResponse.json({ message: 'Regional admin assigned successfully' })

      case 'manage_user':
        if (!target?.userId || !data?.action) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        let updateData: any = {}
        switch (data.action) {
          case 'activate':
            updateData = { isActive: true }
            break
          case 'deactivate':
            updateData = { isActive: false }
            break
          case 'make_admin':
            updateData = { role: 'REGIONAL_ADMIN' }
            break
          case 'remove_admin':
            updateData = { role: 'MEMBER' }
            break
          default:
            return NextResponse.json({ error: 'Invalid user action' }, { status: 400 })
        }

        await prisma.user.update({
          where: { id: target.userId },
          data: updateData
        })

        return NextResponse.json({ message: 'User updated successfully' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('System management error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
