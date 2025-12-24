import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { PenaltyService } from '@/lib/penalty-service'
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

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const currentDay = now.getDate()

    // We allow multiple contributions per month now, so we remove the check for existingContribution

    // Check if contribution is late and calculate penalty ONLY if no contribution exists for this month yet
    const existingContributionMonth = await prisma.contribution.findFirst({
      where: {
        groupId: validatedData.groupId,
        userId: userId,
        month: currentMonth,
        year: currentYear,
        status: { in: ['COMPLETED', 'PENDING'] }
      }
    })

    const isLate = !existingContributionMonth && currentDay > groupMember.group.contributionDueDay
    const penaltyApplied = isLate ? groupMember.group.penaltyAmount : 0

    // Apply Monthly Debt: If no contribution record exists for this month, subtract the monthlyContribution
    let balanceAdjustment = 0
    if (!existingContributionMonth) {
      balanceAdjustment -= groupMember.group.monthlyContribution
    }

    let remainingAmount = validatedData.amount
    let penaltyPaid = 0
    let contributionApplied = 0

    // 1. Pay off unpaid penalties first
    if (groupMember.unpaidPenalties > 0) {
      penaltyPaid = Math.min(remainingAmount, groupMember.unpaidPenalties)
      remainingAmount -= penaltyPaid
    }

    // 2. Increment balance with the remaining amount (minus any initial debt adjustment)
    // Update GroupMember balance and penalties
    const updatedMember = await prisma.groupMember.update({
      where: { id: groupMember.id },
      data: {
        unpaidPenalties: { decrement: penaltyPaid },
        balance: { increment: balanceAdjustment + remainingAmount }
      }
    })

    // Create contribution record
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
        status: 'PENDING',
        isLate: isLate,
        penaltyApplied: penaltyApplied,
      },
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: userId,
        groupId: validatedData.groupId,
        actionType: isLate ? 'CONTRIBUTION_MADE_LATE' : 'CONTRIBUTION_MADE',
        description: `Made payment of MWK ${validatedData.amount.toLocaleString()}. Applied: MWK ${penaltyPaid.toLocaleString()} to penalties, MWK ${remainingAmount.toLocaleString()} to balance.`,
        metadata: {
          contributionId: contribution.id,
          amount: validatedData.amount,
          penaltyPaid,
          balanceIncrement: remainingAmount,
          isLate,
        },
      },
    })

    return NextResponse.json({
      message: 'Contribution recorded successfully',
      contribution,
      summary: {
        penaltyPaid,
        balanceIncrement: remainingAmount,
        newBalance: updatedMember.balance,
        remainingPenalties: updatedMember.unpaidPenalties
      }
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

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const groupId = searchParams.get('groupId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const search = searchParams.get('search')

    // Build where clause for filtering
    const whereClause: any = {
      userId: userId,
    }

    if (status) {
      whereClause.status = status
    }

    if (groupId) {
      whereClause.groupId = groupId
    }

    if (month && year) {
      whereClause.month = parseInt(month)
      whereClause.year = parseInt(year)
    }

    // Get user's contributions with filters - always include group for consistency
    const contributions = await prisma.contribution.findMany({
      where: whereClause,
      include: {
        group: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // If search term provided, filter by group name
    let filteredContributions = contributions
    if (search) {
      const searchTerm = search.toLowerCase()
      filteredContributions = contributions.filter(contribution =>
        contribution.group.name.toLowerCase().includes(searchTerm) ||
        contribution.group.region.toLowerCase().includes(searchTerm)
      )
    }

    return NextResponse.json({ contributions: filteredContributions })

  } catch (error) {
    console.error('Get contributions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
