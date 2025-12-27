import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createGroupSchema = z.object({
  name: z.string().min(3, 'Group name must be at least 3 characters'),
  description: z.string().optional(),
  region: z.enum(['NORTHERN', 'SOUTHERN', 'CENTRAL']),
  monthlyContribution: z.number().positive('Monthly contribution must be positive'),
  maxLoanMultiplier: z.number().min(1).max(10),
  interestRate: z.number().min(0).max(100),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.userId as string;

    const body = await request.json()
    const validatedData = createGroupSchema.parse(body)

    // Ensure user exists (should exist if logged in)
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create group and add creator as admin in a single transaction
    const group = await prisma.$transaction(async (tx) => {

      const newGroup = await tx.group.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          region: validatedData.region,
          monthlyContribution: validatedData.monthlyContribution,
          maxLoanMultiplier: validatedData.maxLoanMultiplier,
          interestRate: validatedData.interestRate,
          createdById: userId,
        },
      })

      // Add creator as admin member
      await tx.groupMember.create({
        data: {
          groupId: newGroup.id,
          userId: userId,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      })

      return newGroup
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: userId,
        groupId: group.id || '', // defensive
        actionType: 'GROUP_CREATED',
        description: `Created group "${(group as any).name}"`,
      },
    })

    return NextResponse.json({
      message: 'Group created successfully',
      groupId: (group as any).id,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: `Validation error: ${error.issues[0].message}` },
        { status: 400 }
      )
    }

    console.error('Create group error:', error)

    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'A group with this name already exists. Please choose a different name.' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create group. Please check your connection and try again.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.userId as string;

    // Get user's groups
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: userId,
            status: 'ACTIVE',
          },
        },
      },
      include: {
        _count: {
          select: {
            members: true,
            contributions: true,
            loans: true
          }
        },
        members: {
          where: {
            userId: userId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ groups })

  } catch (error) {
    console.error('Get groups error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
