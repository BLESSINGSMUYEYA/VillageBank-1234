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

    // Check if contribution for this month already exists
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const currentDay = new Date().getDate()

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

    // Check if contribution is late and calculate penalty
    const isLate = currentDay > groupMember.group.contributionDueDay
    const penaltyApplied = isLate ? groupMember.group.penaltyAmount : 0

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
        description: `Made contribution of MWK ${validatedData.amount.toLocaleString()}${isLate ? ` (late - penalty MWK ${penaltyApplied.toLocaleString()})` : ''}`,
        metadata: {
          contributionId: contribution.id,
          amount: validatedData.amount,
          paymentMethod: validatedData.paymentMethod,
          isLate: isLate,
          penaltyApplied: penaltyApplied,
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

    // Get user's contributions with filters
    const contributions = await prisma.contribution.findMany({
      where: whereClause,
      include: {
        group: search ? true : undefined, // Only include group if searching
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

    // If no group include was needed, remove it from results
    if (!search) {
      filteredContributions = await prisma.contribution.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
      })
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
