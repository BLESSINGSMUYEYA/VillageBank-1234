import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { checkPermission } from '@/lib/permissions'
import { z } from 'zod'

const approveLoanSchema = z.object({
  approved: z.boolean(),
  amountApproved: z.number().positive().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: loanId } = await params
    const body = await request.json()
    const { approved, amountApproved } = approveLoanSchema.parse(body)

    // Get loan details
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        group: {
          include: {
            members: true
          }
        }
      }
    })

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      )
    }

    // Check if user is treasurer of the group
    const isTreasurer = await checkPermission(
      userId,
      loan.groupId,
      'TREASURER'
    )

    if (!isTreasurer) {
      return NextResponse.json(
        { error: 'Only treasurers can approve loans' },
        { status: 403 }
      )
    }

    // Update loan status
    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: approved ? 'APPROVED' : 'REJECTED',
        amountApproved: approved ? (amountApproved || loan.amountRequested) : null,
        approvedById: userId,
        approvedAt: approved ? new Date() : null,
      },
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: userId,
        groupId: loan.groupId,
        actionType: approved ? 'LOAN_APPROVED' : 'LOAN_REJECTED',
        description: approved
          ? `Approved loan of MWK ${(amountApproved || loan.amountRequested).toLocaleString()}`
          : `Rejected loan of MWK ${loan.amountRequested.toLocaleString()}`,
        metadata: {
          loanId: loan.id,
          userId: loan.userId,
          amount: amountApproved || loan.amountRequested,
        },
      },
    })

    // Create notification for the user
    await prisma.notification.create({
      data: {
        userId: loan.userId,
        type: approved ? 'SUCCESS' : 'WARNING',
        title: approved ? 'Loan Approved' : 'Loan Rejected',
        message: approved
          ? `Your loan request for MWK ${(amountApproved || loan.amountRequested).toLocaleString()} has been approved.`
          : `Your loan request for MWK ${loan.amountRequested.toLocaleString()} was rejected.`,
        actionUrl: `/loans`,
        actionText: 'View Loans',
      },
    })

    return NextResponse.json({
      message: `Loan ${approved ? 'approved' : 'rejected'} successfully`,
      loan: updatedLoan,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Loan approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
