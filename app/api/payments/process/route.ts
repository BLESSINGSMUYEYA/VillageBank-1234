import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { processPayment, validatePhoneNumber, PaymentRequest } from '@/lib/payments'
import { z } from 'zod'

const processPaymentSchema = z.object({
  contributionId: z.string().uuid('Invalid contribution ID'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  paymentMethod: z.enum(['AIRTEL_MONEY', 'MPAMBA', 'BANK_CARD']),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const userId = session?.userId as string

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { contributionId, phoneNumber, paymentMethod } = processPaymentSchema.parse(body)

    // Validate phone number for selected payment method
    if (!validatePhoneNumber(phoneNumber, paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid phone number for selected payment method' },
        { status: 400 }
      )
    }

    // Get contribution details
    const contribution = await prisma.contribution.findUnique({
      where: { id: contributionId },
      include: {
        group: true,
        user: true,
      },
    })

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404 }
      )
    }

    // Verify user owns the contribution or is admin/treasurer
    if (contribution.userId !== userId) {
      const membership = await prisma.groupMember.findFirst({
        where: {
          groupId: contribution.groupId,
          userId: userId,
          role: { in: ['ADMIN', 'TREASURER'] },
          status: 'ACTIVE',
        },
      })

      if (!membership) {
        return NextResponse.json(
          { error: 'You can only process your own contributions or need admin/treasurer role' },
          { status: 403 }
        )
      }
    }

    // Check if contribution is already processed
    if (contribution.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Contribution has already been processed' },
        { status: 400 }
      )
    }

    // Process payment
    const paymentRequest: PaymentRequest = {
      amount: contribution.amount,
      phoneNumber,
      paymentMethod,
      reference: `CONTRIB_${contribution.id}`,
      description: `Monthly contribution for ${contribution.group.name}`,
    }

    const paymentResult = await processPayment(paymentRequest)

    // Update contribution status based on payment result
    const updatedContribution = await prisma.contribution.update({
      where: { id: contributionId },
      data: {
        status: paymentResult.status,
        paymentMethod,
        transactionRef: paymentResult.transactionId,
      },
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: userId,
        groupId: contribution.groupId,
        actionType: paymentResult.success ? 'CONTRIBUTION_PAID' : 'CONTRIBUTION_FAILED',
        description: paymentResult.success
          ? `Payment processed for contribution of MWK ${contribution.amount.toLocaleString()}`
          : `Payment failed for contribution of MWK ${contribution.amount.toLocaleString()}`,
        metadata: {
          contributionId: contribution.id,
          amount: contribution.amount,
          paymentMethod,
          transactionId: paymentResult.transactionId,
          error: paymentResult.error,
        },
      },
    })

    return NextResponse.json({
      message: paymentResult.message,
      success: paymentResult.success,
      contribution: updatedContribution,
      transactionId: paymentResult.transactionId,
      error: paymentResult.error,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Process payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
