import { NextRequest, NextResponse } from 'next/server'
import { clerkClient, getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const groupId = params.id

    // Get group details with user membership verification
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        members: {
          some: {
            userId: userId,
            status: 'ACTIVE',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
        contributions: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        loans: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            members: true,
            contributions: true,
            loans: true,
          },
        },
      },
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found or access denied' },
        { status: 404 }
      )
    }

    // Convert dates to strings for JSON serialization
    const serializedGroup = {
      ...group,
      createdAt: group.createdAt.toISOString(),
      members: group.members.map(member => ({
        ...member,
        joinedAt: member.joinedAt.toISOString(),
        user: {
          ...member.user,
        }
      })),
      contributions: group.contributions.map(contribution => ({
        ...contribution,
        createdAt: contribution.createdAt.toISOString(),
      })),
      loans: group.loans.map(loan => ({
        ...loan,
        createdAt: loan.createdAt.toISOString(),
        approvedAt: loan.approvedAt ? loan.approvedAt.toISOString() : null,
      })),
    }

    return NextResponse.json(serializedGroup)

  } catch (error) {
    console.error('Get group error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
