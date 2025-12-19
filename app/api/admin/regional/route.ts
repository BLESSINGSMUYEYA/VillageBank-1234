import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, region: true }
    })

    if (!user || (user.role !== 'REGIONAL_ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region')?.toUpperCase() || user.region

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

    const responseData = {
      users: totalUsers,
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
        status: group.isActive ? 'ACTIVE' : 'INACTIVE',
        createdAt: group.createdAt,
        interestRate: group.interestRate,
        maxLoanMultiplier: group.maxLoanMultiplier
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
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { groupId, action } = body

    if (!groupId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let updateData: any = {}

    switch (action) {
      case 'activate':
        updateData = { isActive: true }
        break
      case 'suspend':
        updateData = { isActive: false }
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: updateData
    })

    return NextResponse.json({
      id: updatedGroup.id,
      name: updatedGroup.name,
      isActive: updatedGroup.isActive
    })
  } catch (error) {
    console.error('Group management error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
