import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PaymentStatus, NotificationType } from '@prisma/client'
import { z } from 'zod'

const bulkReviewSchema = z.object({
  contributionIds: z.array(z.string()).min(1, 'At least one contribution ID is required'),
  status: z.enum(['COMPLETED', 'REJECTED']),
  rejectionReason: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const userId = session?.userId as string

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contributionIds, status, rejectionReason } = bulkReviewSchema.parse(body)

    // Verify user has treasurer/admin permissions for all contributions
    const contributions = await prisma.contribution.findMany({
      where: {
        id: { in: contributionIds },
        status: 'PENDING', // Only allow reviewing pending contributions
      },
      include: {
        group: {
          include: {
            members: {
              where: {
                userId: userId,
                role: { in: ['ADMIN', 'TREASURER'] },
                status: 'ACTIVE'
              }
            }
          }
        },
        user: true
      }
    })

    // Check if user has permission for all requested contributions
    const unauthorizedContributions = contributions.filter(c => c.group.members.length === 0)
    if (unauthorizedContributions.length > 0) {
      return NextResponse.json(
        { error: 'You do not have permission to review some of these contributions' },
        { status: 403 }
      )
    }

    const reviewResults = await prisma.$transaction(async (tx) => {
      const results = []

      for (const contribution of contributions) {
        // Update contribution status
        const updatedContribution = await tx.contribution.update({
          where: { id: contribution.id },
          data: {
            status: status as PaymentStatus,
            rejectionReason: status === 'REJECTED' ? rejectionReason : null,
            reviewedById: userId,
            reviewDate: new Date(),
          }
        })

        let penaltyPaid = 0
        let balanceIncrement = 0

        if (status === 'COMPLETED') {
          // Get the member record
          const member = await tx.groupMember.findUnique({
            where: {
              groupId_userId: {
                groupId: contribution.groupId,
                userId: contribution.userId
              }
            },
            include: { group: true }
          })

          if (!member) throw new Error(`Member not found for contribution ${contribution.id}`)

          // Check if the monthly fee has already been applied for this month/year
          const feeAlreadyApplied = await tx.contribution.findFirst({
            where: {
              groupId: contribution.groupId,
              userId: contribution.userId,
              month: contribution.month,
              year: contribution.year,
              status: { in: ['COMPLETED', 'FAILED'] },
              id: { not: contribution.id }
            }
          })

          // Also check if a penalty for this month was already applied
          const penaltyAlreadyApplied = await tx.contribution.findFirst({
            where: {
              groupId: contribution.groupId,
              userId: contribution.userId,
              month: contribution.month,
              year: contribution.year,
              isLate: true,
              penaltyApplied: { gt: 0 },
              status: { in: ['COMPLETED', 'FAILED'] },
              id: { not: contribution.id }
            }
          })

          let balanceAdjustment = 0
          if (!feeAlreadyApplied) {
            balanceAdjustment -= member.group.monthlyContribution
          }

          let totalUnpaidPenalties = member.unpaidPenalties
          if (contribution.penaltyApplied > 0 && !penaltyAlreadyApplied) {
            totalUnpaidPenalties += contribution.penaltyApplied
          }

          let remainingAmount = contribution.amount

          // 1. Pay off unpaid penalties first
          if (totalUnpaidPenalties > 0) {
            penaltyPaid = Math.min(remainingAmount, totalUnpaidPenalties)
            remainingAmount -= penaltyPaid
          }

          balanceIncrement = balanceAdjustment + remainingAmount

          // 2. Update GroupMember balance and penalties
          await tx.groupMember.update({
            where: { id: member.id },
            data: {
              unpaidPenalties: totalUnpaidPenalties - penaltyPaid,
              balance: { increment: balanceIncrement }
            }
          })
        }

        results.push({
          contribution,
          penaltyPaid,
          balanceIncrement,
          status
        })
      }

      return results
    })

    // Create activity logs and notifications for each contribution
    const activityData = reviewResults.map(({ contribution, penaltyPaid, balanceIncrement }) => ({
      userId: userId,
      groupId: contribution.groupId,
      actionType: `CONTRIBUTION_${status}`,
      description: status === 'COMPLETED'
        ? `Approved contribution of MWK ${contribution.amount.toLocaleString()} from ${contribution.user.firstName} ${contribution.user.lastName}. Applied: MWK ${penaltyPaid.toLocaleString()} to penalties, MWK ${balanceIncrement.toLocaleString()} to balance.`
        : `Rejected contribution of MWK ${contribution.amount.toLocaleString()} from ${contribution.user.firstName} ${contribution.user.lastName}`,
      metadata: {
        contributionId: contribution.id,
        status,
        rejectionReason,
        bulkOperation: true,
        penaltyPaid,
        balanceIncrement
      },
    }))

    const notificationData = contributions.map(contribution => ({
      userId: contribution.userId,
      title: `Contribution ${status === 'COMPLETED' ? 'Approved' : 'Rejected'}`,
      message: status === 'COMPLETED'
        ? `Your contribution of MWK ${contribution.amount.toLocaleString()} has been approved.`
        : `Your contribution of MWK ${contribution.amount.toLocaleString()} was rejected: ${rejectionReason || 'No reason provided'}`,
      type: status === 'COMPLETED' ? NotificationType.SUCCESS : NotificationType.ERROR,
    }))

    // Create activity logs
    await prisma.activity.createMany({
      data: activityData
    })

    // Create notifications
    await prisma.notification.createMany({
      data: notificationData
    })

    return NextResponse.json({
      message: `Successfully ${status.toLowerCase()} ${reviewResults.length} contributions`,
      updatedCount: reviewResults.length,
      contributions: contributions.map(c => ({
        id: c.id,
        amount: c.amount,
        userName: `${c.user.firstName} ${c.user.lastName}`,
        groupName: c.group.name
      }))
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

    console.error('Bulk review contribution error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
