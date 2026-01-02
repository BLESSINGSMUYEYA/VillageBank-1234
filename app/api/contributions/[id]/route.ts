import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateContributionSchema = z.object({
  status: z.enum(['COMPLETED', 'FAILED']),
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

    const { id: contributionId } = await params

    // Get contribution details with user access verification
    const contribution = await prisma.contribution.findFirst({
      where: {
        id: contributionId,
        OR: [
          { userId: userId }, // Contribution owner
          {
            group: {
              members: {
                some: {
                  userId: userId,
                  role: { in: ['ADMIN', 'TREASURER'] },
                  status: 'ACTIVE'
                }
              }
            }
          } // Group admin/treasurer
        ]
      },
      include: {
        group: true,
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
    })

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contribution not found or access denied' },
        { status: 404 }
      )
    }

    // Convert dates to strings for JSON serialization
    const serializedContribution = {
      ...contribution,
      createdAt: contribution.createdAt.toISOString(),
    }

    return NextResponse.json(serializedContribution)

  } catch (error) {
    console.error('Get contribution error:', error)
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

    const { id: contributionId } = await params
    const body = await request.json()
    const validatedData = updateContributionSchema.parse(body)

    // Check if user is admin or treasurer of the group
    const contribution = await prisma.contribution.findUnique({
      where: { id: contributionId },
      include: { group: true },
    })

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404 }
      )
    }

    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: contribution.groupId,
        userId: userId,
        role: { in: ['ADMIN', 'TREASURER'] },
        status: 'ACTIVE',
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Only group admins or treasurers can update contributions' },
        { status: 403 }
      )
    }

    // Update contribution
    const updatedContribution = await prisma.contribution.update({
      where: { id: contributionId },
      data: validatedData,
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: userId,
        groupId: contribution.groupId,
        actionType: 'CONTRIBUTION_UPDATED',
        description: `Updated contribution status to ${validatedData.status}`,
        metadata: {
          contributionId: contributionId,
          status: validatedData.status,
        },
      },
    })

    return NextResponse.json({
      message: 'Contribution updated successfully',
      contribution: updatedContribution,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Update contribution error:', error)
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

    const { id: contributionId } = await params

    // Check if user owns the contribution or is admin
    const contribution = await prisma.contribution.findUnique({
      where: { id: contributionId },
    })

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404 }
      )
    }

    if (contribution.userId !== userId) {
      // Check if user is admin of the group
      const membership = await prisma.groupMember.findFirst({
        where: {
          groupId: contribution.groupId,
          userId: userId,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      })

      if (!membership) {
        return NextResponse.json(
          { error: 'Only contribution owners or group admins can delete contributions' },
          { status: 403 }
        )
      }
    }

    // Only allow deletion of pending contributions
    if (contribution.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending contributions can be deleted' },
        { status: 400 }
      )
    }

    // Delete contribution
    await prisma.contribution.delete({
      where: { id: contributionId },
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: userId,
        groupId: contribution.groupId,
        actionType: 'CONTRIBUTION_DELETED',
        description: `Deleted contribution`,
        metadata: {
          contributionId: contributionId,
          amount: contribution.amount,
        },
      },
    })

    return NextResponse.json({
      message: 'Contribution deleted successfully',
    })

  } catch (error) {
    console.error('Delete contribution error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
