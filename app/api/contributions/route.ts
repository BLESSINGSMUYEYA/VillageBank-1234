import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createContributionSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['AIRTEL_MONEY', 'MPAMBA', 'BANK_CARD', 'CASH', 'OTHER']),
  transactionRef: z.string().optional(),
  receiptUrl: z.string().optional(),
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

    const body = await request.json()
    console.log('Received contribution request:', body)
    console.log('UserId:', userId)

    const validatedData = createContributionSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Check if user is an active member of the group
    const groupMember = await prisma.groupMember.findFirst({
      where: {
        groupId: validatedData.groupId,
        userId: userId,
        status: 'ACTIVE',
      },
      include: {
        group: true,
      },
    })

    if (!groupMember) {
      return NextResponse.json(
        { error: 'You are not an active member of this group' },
        { status: 403 }
      )
    }

    // Check if contribution for this month already exists
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    const existingContribution = await prisma.contribution.findUnique({
      where: {
        groupId_userId_month_year: {
          groupId: validatedData.groupId,
          userId: userId,
          month: currentMonth,
          year: currentYear,
        },
      },
    })

    if (existingContribution) {
      return NextResponse.json(
        { error: 'You have already made a contribution for this month' },
        { status: 400 }
      )
    }

    // Create contribution
    const contribution = await prisma.contribution.create({
      data: {
        groupId: validatedData.groupId,
        userId: userId,
        amount: validatedData.amount,
        month: currentMonth,
        year: currentYear,
        paymentMethod: validatedData.paymentMethod,
        transactionRef: validatedData.transactionRef,
        receiptUrl: validatedData.receiptUrl,
        status: 'PENDING', // All contributions go to PENDING for treasurer approval
      },
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: userId,
        groupId: validatedData.groupId,
        actionType: 'CONTRIBUTION_MADE',
        description: `Made contribution of MWK ${validatedData.amount.toLocaleString()}`,
        metadata: {
          contributionId: contribution.id,
          amount: validatedData.amount,
          paymentMethod: validatedData.paymentMethod,
        },
      },
    })

    return NextResponse.json({
      message: 'Contribution created successfully',
      contribution,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues)
      return NextResponse.json(
        {
          error: 'Validation failed: ' + error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
        },
        { status: 400 }
      )
    }

    console.error('Create contribution error:', error)
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

    // Get user's contributions
    const contributions = await prisma.contribution.findMany({
      where: {
        userId: userId,
      },
      include: {
        group: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ contributions })

  } catch (error) {
    console.error('Get contributions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
