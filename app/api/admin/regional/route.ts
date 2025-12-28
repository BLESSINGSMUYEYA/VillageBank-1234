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
      select: { role: true, region: true }
    })

    if (!user || (user.role !== 'REGIONAL_ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)

    // Strict Region Enforcement
    let region: string | undefined | null

    if (user.role === 'REGIONAL_ADMIN') {
      // Enforce their assigned region, ignoring any request params
      region = user.region
    } else if (user.role === 'SUPER_ADMIN') {
      // Allow selection, default to 'CENTRAL' if none provided
      region = searchParams.get('region')?.toUpperCase() || 'CENTRAL'
    }

    if (!region) {
      return NextResponse.json({ error: 'Region not specified or assigned' }, { status: 400 })
    }

    // Get regional data
    const regionalData = await prisma.group.findMany({
      where: { region: region as any },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true
              }
            }
          }
        },
        contributions: {
          where: { status: 'COMPLETED' },
          select: { amount: true }
        },
        loans: {
          select: {
            status: true,
            amountApproved: true,
            amountRequested: true
          }
        },
        _count: {
          select: {
            members: true,
            contributions: true,
            loans: true
          }
        }
      }
    })

    // Calculate regional metrics
    const totalUsers = new Set(
      regionalData.flatMap(g => g.members.map(m => m.userId))
    ).size

    const totalGroups = regionalData.length
    const activeGroups = regionalData.filter(g => g.isActive).length

    const totalContributions = regionalData.reduce(
      (sum, group) => sum + group.contributions.reduce((s, c) => s + c.amount, 0),
      0
    )

    const activeLoans = regionalData.reduce(
      (sum, group) => sum + group.loans.filter(l => l.status === 'ACTIVE').length,
      0
    )

    const pendingApprovals = regionalData.reduce(
      (sum, group) => sum + group.loans.filter(l => l.status === 'PENDING').length,
      0
    )

    // Get regional admin
    const regionalAdmin = await prisma.user.findFirst({
      where: {
        role: 'REGIONAL_ADMIN',
        region: region as any
      },
      select: {
        firstName: true,
        lastName: true,
        email: true
      }
    })

    // Fetch users in the region
    const usersInRegion = await prisma.user.findMany({
      where: { region: region as any },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        phoneNumber: true,
        createdAt: true,
        // Calculate status based on active loans or group membership if needed
        // For now, simpler user details
      }
    })

    const responseData = {
      users: totalUsers, // Keep the calculated one for now, or replace with usersInRegion.length
      groups: totalGroups,
      activeGroups,
      totalContributions,
      activeLoans,
      pendingApprovals,
      region,
      admin: regionalAdmin ? `${regionalAdmin.firstName} ${regionalAdmin.lastName}` : 'Not assigned',
      groupsData: regionalData.map(group => ({
        id: group.id,
        name: group.name,
        members: group._count.members,
        activeMembers: group.members.filter(m => m.status === 'ACTIVE').length,
        monthlyContribution: group.monthlyContribution,
        totalContributions: group.contributions.reduce((sum, c) => sum + c.amount, 0),
        status: group.isActive ? 'ACTIVE' : 'SUSPENDED',
        createdAt: group.createdAt,
        interestRate: group.interestRate,
        maxLoanMultiplier: group.maxLoanMultiplier
      })),
      usersData: usersInRegion.map(u => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: u.role,
        phoneNumber: u.phoneNumber,
        joinedAt: u.createdAt,
        status: 'ACTIVE' // Placeholder
      }))
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Regional admin data fetch error:', error)
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

    if (!user || (user.role !== 'REGIONAL_ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { groupId, userId: targetUserId, action } = body

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 })
    }

    if (action.includes('group') && !groupId) {
      return NextResponse.json({ error: 'Missing group ID' }, { status: 400 })
    }

    if (action.includes('user') && !targetUserId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    let updateData: any = {}

    switch (action) {
      case 'activate_group':
        updateData = { isActive: true }
        await prisma.group.update({
          where: { id: groupId },
          data: updateData
        })
        break
      case 'suspend_group':
        updateData = { isActive: false }
        await prisma.group.update({
          where: { id: groupId },
          data: updateData
        })
        break
      case 'suspend_user':
        // Placeholder for suspend logic
        break
      case 'activate_user':
        // Placeholder for activate logic
        break
      case 'change_role':
        const { newRole } = body
        if (!newRole || !['MEMBER', 'REGIONAL_ADMIN'].includes(newRole)) {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
        }

        // Prevent Regional Admin from creating Super Admins
        if (newRole === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
          return NextResponse.json({ error: 'Insufficient permissions to assign Super Admin role' }, { status: 403 })
        }

        // Update the user
        updateData = { role: newRole }
        await prisma.user.update({
          where: { id: targetUserId },
          data: updateData
        })
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: updateData })
  } catch (error) {
    console.error('Group management error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
