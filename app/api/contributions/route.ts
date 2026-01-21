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
  penaltyPaid: z.number().min(0).optional(),
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

    // 1. Calculate Deductions
    const penaltyPaid = validatedData.penaltyPaid || 0

    // Only apply NEW penalty if this specific contribution is late and no other paid contribution exists for this month
    // Note: If user is paying off OLD penalties (penaltyPaid > 0), they might still be late for THIS month's fee.
    // Ideally, we separate "Loan Repayment" / "Fine Payment" / "Contribution", but here it's mixed.
    // Legacy Logic: Check if Late
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
    // If user is late, we record that a penalty WAS applied (charged) to this contribution. 
    // But wait, "penaltyApplied" usually means "Paid Off". 
    // Let's assume penaltyApplied in DB means "Amount of this contribution directed to penalties".
    // So if isLate -> we effectively "charge" them by directing some of their money to the fine? 
    // No, standard practice is: Late -> Add to Debt. Payment -> Reduce Debt.
    // The previous code had: `const penaltyApplied = isLate ? groupMember.group.penaltyAmount : 0`.
    // This implies it was "Charging". This is confusing naming in the implementation I inherited.
    // Correct Logic for "One-Click Fines" System:
    // 1. Fines are charged via "Apply Fine" (adds to unpaidPenalties).
    // 2. Fines are paid via Contribution (deducts from unpaidPenalties).
    // 3. Late Fees for contributions should ALSO add to unpaidPenalties.

    let finalPenaltyApplied = penaltyPaid;

    // Execute in Transaction
    const contribution = await prisma.$transaction(async (tx) => {
      // If Late, auto-charge the late fee to the member's debt profile
      if (isLate) {
        const lateFee = groupMember.group.lateContributionFee // Use specific fee
        if (lateFee > 0) {
          await tx.groupMember.update({
            where: { id: groupMember.id },
            data: { unpaidPenalties: { increment: lateFee } }
          })
          // We create a separate activity for the "Charge"
          await tx.activity.create({
            data: {
              userId: userId as string,
              groupId: validatedData.groupId,
              actionType: 'PENALTY_APPLIED',
              description: `System applied Late Contribution Fee of ${lateFee.toLocaleString()}`,
            }
          })
        }
      }

      // If Playing Off Penalties, decrement debt
      if (penaltyPaid > 0) {
        await tx.groupMember.update({
          where: { id: groupMember.id },
          data: { unpaidPenalties: { decrement: penaltyPaid } }
        })
      }

      // Create contribution record
      return await tx.contribution.create({
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
          penaltyApplied: finalPenaltyApplied, // How much of THIS money went to penalties
        },
      })
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: userId as string,
        groupId: validatedData.groupId,
        actionType: 'CONTRIBUTION_SUBMITTED',
        description: `Submitted contribution of MWK ${validatedData.amount.toLocaleString()} for review.${penaltyPaid > 0 ? ` (Paid off MWK ${penaltyPaid} in fines)` : ''}`,
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

    // If search term provided, add to where clause
    if (search) {
      whereClause.group = {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      }
    }

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

    return NextResponse.json({
      contributions,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
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
