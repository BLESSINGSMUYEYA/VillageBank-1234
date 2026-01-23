import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkLoanEligibility } from '@/lib/permissions'
import { z } from 'zod'

const createLoanSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  amountRequested: z.number().positive('Amount must be positive'),
  repaymentPeriodMonths: z.number().min(1).max(24),
  purpose: z.string().optional(),
  // Disbursement account details - where to send loan funds
  disbursementMethod: z.enum(['AIRTEL_MONEY', 'MPAMBA', 'BANK_CARD']),
  disbursementAccountName: z.string().min(2, 'Account name must be at least 2 characters'),
  disbursementAccountNumber: z.string().min(8, 'Account number must be at least 8 characters'),
  disbursementBankName: z.string().optional(), // Required for BANK_CARD
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
    const validatedData = createLoanSchema.parse(body)

    // Require bank name for bank card type
    if (validatedData.disbursementMethod === 'BANK_CARD' && !validatedData.disbursementBankName) {
      return NextResponse.json(
        { error: 'Bank name is required for bank account disbursement' },
        { status: 400 }
      )
    }

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

    // Check loan eligibility
    const eligibility = await checkLoanEligibility(userId as string, validatedData.groupId)

    if (!eligibility.eligible) {
      return NextResponse.json(
        { error: eligibility.reason || 'Not eligible for loan' },
        { status: 400 }
      )
    }

    if (eligibility.maxAmount && validatedData.amountRequested > eligibility.maxAmount) {
      return NextResponse.json(
        { error: `Maximum loan amount is MWK ${eligibility.maxAmount.toLocaleString()}` },
        { status: 400 }
      )
    }

    // Create loan with disbursement details
    const loan = await prisma.loan.create({
      data: {
        groupId: validatedData.groupId,
        userId: userId as string,
        amountRequested: validatedData.amountRequested,
        repaymentPeriodMonths: validatedData.repaymentPeriodMonths,

        interestRate: groupMember.group.interestRate,
        interestType: groupMember.group.loanInterestType,
        status: 'PENDING', // Requires treasurer approval
        // Disbursement details
        disbursementMethod: validatedData.disbursementMethod,
        disbursementAccountName: validatedData.disbursementAccountName,
        disbursementAccountNumber: validatedData.disbursementAccountNumber,
        disbursementBankName: validatedData.disbursementBankName,
      },
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: userId as string,
        groupId: validatedData.groupId,
        actionType: 'LOAN_REQUESTED',
        description: `Requested loan of MWK ${validatedData.amountRequested.toLocaleString()}`,
        metadata: {
          loanId: loan.id,
          amount: validatedData.amountRequested,
          repaymentPeriod: validatedData.repaymentPeriodMonths,
        },
      },
    })

    return NextResponse.json({
      message: 'Loan application submitted successfully',
      loan,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Create loan error:', error)
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

    // Parse query parameters for pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const whereClause = {
      userId: userId as string,
    }

    // Get user's loans with pagination
    const [loans, totalCount] = await Promise.all([
      prisma.loan.findMany({
        where: whereClause,
        include: {
          group: true,
          repayments: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.loan.count({
        where: whereClause,
      })
    ])

    return NextResponse.json({
      loans,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Get loans error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
