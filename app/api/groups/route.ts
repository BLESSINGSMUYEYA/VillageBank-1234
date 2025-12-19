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

    // Create group and add creator as admin in a single transaction
    const group = await prisma.$transaction(async (tx) => {
      // Ensure user exists in this transaction
      const existingUser = await tx.user.findUnique({
        where: { id: userId }
      })

      if (!existingUser) {
        // Get user details from Clerk (we already have them from earlier)
        const primaryEmail = user.emailAddresses?.[0]?.emailAddress || ''
        const primaryPhone = user.phoneNumbers?.[0]?.phoneNumber || ''
        
        await tx.user.create({
          data: {
            id: userId,
            email: primaryEmail,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phoneNumber: primaryPhone,
            role: (user.publicMetadata?.role as 'MEMBER' | 'REGIONAL_ADMIN' | 'SUPER_ADMIN') || 'MEMBER',
            region: (user.publicMetadata?.region as string) || 'CENTRAL',
          },
        })
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
        { error: `Validation error: ${error.issues[0].message}` },
        { status: 400 }
      )
    }

    console.error('Create group error:', error)
    
    // Provide more specific error messages based on common issues
    if (error instanceof Error) {
      if (error.message.includes('User') && error.message.includes('does not exist')) {
        return NextResponse.json(
          { error: 'User account issue. Please try signing out and back in.' },
          { status: 400 }
        )
      }
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'A group with this name already exists. Please choose a different name.' },
          { status: 409 }
        )
      }
      if (error.message.includes('permission') || error.message.includes('unauthorized')) {
        return NextResponse.json(
          { error: 'You do not have permission to create groups.' },
          { status: 403 }
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
