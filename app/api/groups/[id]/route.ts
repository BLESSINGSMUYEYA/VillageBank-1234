import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateGroupSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  region: z.enum(['NORTHERN', 'SOUTHERN', 'CENTRAL']).optional(),
  monthlyContribution: z.number().positive().optional(),
  maxLoanMultiplier: z.number().min(1).max(10).optional(),
  interestRate: z.number().min(0).max(100).optional(),
  penaltyAmount: z.number().min(0).optional(),
  contributionDueDay: z.number().min(1).max(31).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const userId = session?.userId as string

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: groupId } = await params

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
      penaltyAmount: Number(group.penaltyAmount),
      contributionDueDay: group.contributionDueDay,
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
        penaltyApplied: Number(contribution.penaltyApplied),
        isLate: contribution.isLate,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const userId = session?.userId as string

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: groupId } = await params
    const body = await request.json()
    const validatedData = updateGroupSchema.parse(body)

    // Check if user is admin of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: groupId,
        userId: userId,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Only group admins can update group settings' },
        { status: 403 }
      )
    }

    // Update group
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: validatedData,
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

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: userId,
        groupId: groupId,
        actionType: 'GROUP_UPDATED',
        description: `Updated group settings`,
        metadata: validatedData,
      },
    })

    // Serialize same way as GET handler
    const serializedGroup = {
      ...updatedGroup,
      createdAt: updatedGroup.createdAt.toISOString(),
      penaltyAmount: Number(updatedGroup.penaltyAmount),
      contributionDueDay: updatedGroup.contributionDueDay,
      members: updatedGroup.members.map(member => ({
        ...member,
        joinedAt: member.joinedAt.toISOString(),
        user: {
          ...member.user,
        }
      })),
      contributions: updatedGroup.contributions.map(contribution => ({
        ...contribution,
        createdAt: contribution.createdAt.toISOString(),
        penaltyApplied: Number(contribution.penaltyApplied),
        isLate: contribution.isLate,
      })),
      loans: updatedGroup.loans.map(loan => ({
        ...loan,
        createdAt: loan.createdAt.toISOString(),
        approvedAt: loan.approvedAt ? loan.approvedAt.toISOString() : null,
      })),
    }

    return NextResponse.json(serializedGroup)

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues)
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Update group error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const userId = session?.userId as string

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: groupId } = await params

    // Check if user is admin of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: groupId,
        userId: userId,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Only group admins can delete groups' },
        { status: 403 }
      )
    }

    // Soft delete by setting isActive to false
    await prisma.group.update({
      where: { id: groupId },
      data: { isActive: false },
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: userId,
        groupId: groupId,
        actionType: 'GROUP_DELETED',
        description: `Deleted group`,
      },
    })

    return NextResponse.json({
      message: 'Group deleted successfully',
    })

  } catch (error) {
    console.error('Delete group error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
