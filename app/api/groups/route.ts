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

async function ensureUserExists(userId: string, clerkUser: any) {
  console.log(`Checking if user ${userId} exists in database...`)
  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!existingUser) {
    console.log(`User ${userId} not found, creating...`)
    const primaryEmail = clerkUser.email_addresses?.[0]?.email_address || ''
    const primaryPhone = clerkUser.phone_numbers?.[0]?.phone_number || ''
    
    console.log(`Creating user with email: ${primaryEmail}, phone: ${primaryPhone}`)
    
    await prisma.user.create({
      data: {
        id: userId,
        email: primaryEmail,
        firstName: clerkUser.first_name || '',
        lastName: clerkUser.last_name || '',
        phoneNumber: primaryPhone,
        role: clerkUser.public_metadata?.role || 'MEMBER',
        region: clerkUser.public_metadata?.region || 'CENTRAL',
        isActive: true,
      },
    })
    console.log(`Successfully created user ${userId} in database`)
  } else {
    console.log(`User ${userId} already exists in database`)
  }
}

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

    // Ensure user exists in database (outside of group transaction)
    await ensureUserExists(userId, user)

    const body = await request.json()
    const validatedData = createGroupSchema.parse(body)

    // Create group and add creator as admin in a separate transaction
    const group = await prisma.$transaction(async (tx) => {
      // Verify user exists again in this transaction
      const userExists = await tx.user.findUnique({
        where: { id: userId }
      })

      if (!userExists) {
        throw new Error(`User ${userId} does not exist in database`)
      }

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
