import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkLoanEligibility } from '@/lib/permissions'
import { z } from 'zod'

const createLoanSchema = z.object({
  groupId: z.string().uuid('Invalid group ID'),
  amountRequested: z.number().positive('Amount must be positive'),
  repaymentPeriodMonths: z.number().min(1).max(24),
  purpose: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createLoanSchema.parse(body)

    // Check if user is an active member of the group
    const groupMember = await prisma.groupMember.findFirst({
      where: {
        groupId: validatedData.groupId,
        userId: session.user.id,
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
    const eligibility = await checkLoanEligibility(session.user.id, validatedData.groupId)
    
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

    // Create loan
    const loan = await prisma.loan.create({
      data: {
        groupId: validatedData.groupId,
        userId: session.user.id,
        amountRequested: validatedData.amountRequested,
        repaymentPeriodMonths: validatedData.repaymentPeriodMonths,
        interestRate: groupMember.group.interestRate,
        status: 'PENDING', // Requires treasurer approval
      },
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: session.user.id,
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's loans
    const loans = await prisma.loan.findMany({
      where: {
        userId: session.user.id,
      },
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
    })

    return NextResponse.json({ loans })

  } catch (error) {
    console.error('Get loans error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
