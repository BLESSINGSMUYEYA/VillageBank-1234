import { NextRequest, NextResponse } from 'next/server'
import { clerkClient, getAuth } from '@clerk/nextjs/server'
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
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user details from Clerk
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const userRole = user.publicMetadata?.role as string

    const body = await request.json()
    const validatedData = createGroupSchema.parse(body)

    // Create group and add creator as admin
    const group = await prisma.group.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        region: validatedData.region,
        monthlyContribution: validatedData.monthlyContribution,
        maxLoanMultiplier: validatedData.maxLoanMultiplier,
        interestRate: validatedData.interestRate,
        createdById: userId,
        members: {
          create: {
            userId: userId,
            role: 'ADMIN',
            status: 'ACTIVE',
          },
        },
      },
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: userId,
        groupId: group.id,
        actionType: 'GROUP_CREATED',
        description: `Created group "${group.name}"`,
      },
    })

    return NextResponse.json({
      message: 'Group created successfully',
      groupId: group.id,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Create group error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
