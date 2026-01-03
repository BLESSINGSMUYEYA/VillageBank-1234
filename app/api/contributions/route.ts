import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PenaltyService } from '@/lib/penalty-service'
import { z } from 'zod'

const createContributionSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['AIRTEL_MONEY', 'MPAMBA', 'BANK_CARD', 'CASH', 'OTHER']),
  transactionRef: z.string().optional(),
  receiptUrl: z.string().optional(),
  paymentDate: z.string().datetime().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const userId = session?.userId

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
        userId: userId as string,
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
        userId: userId as string,
        month: currentMonth,
        year: currentYear,
        status: { in: ['COMPLETED', 'PENDING'] }
      }
    })

    const isLate = !existingContributionMonth && currentDay > groupMember.group.contributionDueDay
    const penaltyApplied = isLate ? groupMember.group.penaltyAmount : 0

    // Create contribution record
    const contribution = await prisma.contribution.create({
      data: {
        groupId: validatedData.groupId,
        userId: userId as string,
        amount: validatedData.amount,
        month: currentMonth,
        year: currentYear,
        paymentDate: validatedData.paymentDate ? new Date(validatedData.paymentDate) : now,
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
        userId: userId as string,
        groupId: validatedData.groupId,
        actionType: 'CONTRIBUTION_SUBMITTED',
        description: `Submitted contribution of MWK ${validatedData.amount.toLocaleString()} for review.`,
        metadata: {
          contributionId: contribution.id,
          amount: validatedData.amount,
          isLate,
        },
      },
    })

    return NextResponse.json({
      message: 'Contribution submitted for review successfully',
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
    const session = await getSession()
    const userId = session?.userId

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters for filtering and pagination
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const groupId = searchParams.get('groupId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause for filtering
    const whereClause: any = {
      userId: userId as string,
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    if (groupId && groupId !== 'all') {
      whereClause.groupId = groupId
    }

    if (month && year) {
      whereClause.month = parseInt(month)
      whereClause.year = parseInt(year)
    }

    // If search term provided, we'll need to handle it differently with Prisma or filter after
    // For now, let's stick to base filters for pagination efficiency

    // Get user's contributions with filters and pagination
    const [contributions, totalCount] = await Promise.all([
      prisma.contribution.findMany({
        where: whereClause,
        include: {
          group: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.contribution.count({
        where: whereClause,
      })
    ])

    // If search term provided, filter by group name (Note: This is less efficient but keeps logic simple for now)
    let filteredContributions = contributions
    let finalTotalCount = totalCount

    if (search) {
      const searchTerm = search.toLowerCase()
      filteredContributions = contributions.filter(contribution =>
        contribution.group.name.toLowerCase().includes(searchTerm) ||
        contribution.group.region.toLowerCase().includes(searchTerm)
      )
      // Note: totalCount for search would ideally be handled by Prisma where clause if possible
      finalTotalCount = filteredContributions.length
    }

    return NextResponse.json({
      contributions: filteredContributions,
      pagination: {
        total: finalTotalCount,
        page,
        limit,
        totalPages: Math.ceil(finalTotalCount / limit)
      }
    })

  } catch (error) {
    console.error('Get contributions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
