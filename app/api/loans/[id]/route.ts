import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateLoanSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'ACTIVE']).optional(),
  amountApproved: z.number().positive().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const userId = session?.userId as string

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: loanId } = await params

    // Get loan details with user access verification
    const loan = await prisma.loan.findFirst({
      where: {
        id: loanId,
        OR: [
          { userId: userId }, // Loan owner
          {
            group: {
              members: {
                some: {
                  userId: userId,
                  role: { in: ['ADMIN', 'TREASURER'] },
                  status: 'ACTIVE'
                }
              }
            }
          } // Group admin/treasurer
        ]
      },
      include: {
        group: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        repayments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found or access denied' },
        { status: 404 }
      )
    }

    // Convert dates to strings for JSON serialization
    const serializedLoan = {
      ...loan,
      createdAt: loan.createdAt.toISOString(),
      approvedAt: loan.approvedAt ? loan.approvedAt.toISOString() : null,
      updatedAt: loan.updatedAt.toISOString(),
      repayments: loan.repayments.map(repayment => ({
        ...repayment,
        createdAt: repayment.createdAt.toISOString(),
        paidAt: repayment.paidAt.toISOString(),
      })),
    }

    return NextResponse.json(serializedLoan)

  } catch (error) {
    console.error('Get loan error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const userId = session?.userId as string

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: loanId } = await params
    const body = await request.json()
    const validatedData = updateLoanSchema.parse(body)

    // Check if user is admin or treasurer of the group
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { group: true },
    })

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      )
    }

    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: loan.groupId,
        userId: userId,
        role: { in: ['ADMIN', 'TREASURER'] },
        status: 'ACTIVE',
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Only group admins or treasurers can update loans' },
        { status: 403 }
      )
    }

    // Update loan
    const updateData: any = { ...validatedData }

    if (validatedData.status === 'APPROVED') {
      updateData.approvedById = userId
      updateData.approvedAt = new Date()
      updateData.amountApproved = validatedData.amountApproved || loan.amountRequested
    }

    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: updateData,
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: userId,
        groupId: loan.groupId,
        actionType: 'LOAN_UPDATED',
        description: `Updated loan status to ${validatedData.status}`,
        metadata: {
          loanId: loanId,
          status: validatedData.status,
          amountApproved: updateData.amountApproved,
        },
      },
    })

    return NextResponse.json({
      message: 'Loan updated successfully',
      loan: updatedLoan,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Update loan error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const userId = session?.userId as string

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: loanId } = await params

    // Check if user owns the loan or is admin
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
    })

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      )
    }

    if (loan.userId !== userId) {
      // Check if user is admin of the group
      const membership = await prisma.groupMember.findFirst({
        where: {
          groupId: loan.groupId,
          userId: userId,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      })

      if (!membership) {
        return NextResponse.json(
          { error: 'Only loan owners or group admins can delete loans' },
          { status: 403 }
        )
      }
    }

    // Only allow deletion of pending loans
    if (loan.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending loans can be deleted' },
        { status: 400 }
      )
    }

    // Delete loan
    await prisma.loan.delete({
      where: { id: loanId },
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: userId,
        groupId: loan.groupId,
        actionType: 'LOAN_DELETED',
        description: `Deleted loan application`,
        metadata: {
          loanId: loanId,
          amount: loan.amountRequested,
        },
      },
    })

    return NextResponse.json({
      message: 'Loan deleted successfully',
    })

  } catch (error) {
    console.error('Delete loan error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
