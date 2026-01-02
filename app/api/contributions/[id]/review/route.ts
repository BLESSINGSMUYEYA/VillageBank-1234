import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PaymentStatus } from '@prisma/client'
import { z } from 'zod'

const reviewSchema = z.object({
    status: z.enum(['COMPLETED', 'REJECTED']),
    rejectionReason: z.string().optional(),
})

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        const userId = session?.userId as string
        const { id } = await params

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { status, rejectionReason } = reviewSchema.parse(body)

        // Check if the user is a treasurer or admin of the group this contribution belongs to
        const contribution = await prisma.contribution.findUnique({
            where: { id },
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
                }
            }
        })

        if (!contribution || contribution.group.members.length === 0) {
            return NextResponse.json(
                { error: 'You do not have permission to review this contribution' },
                { status: 403 }
            )
        }

        if (contribution.status !== 'PENDING') {
            return NextResponse.json(
                { error: 'This contribution has already been reviewed' },
                { status: 400 }
            )
        }

        const result = await prisma.$transaction(async (tx) => {
            // Update the contribution status
            const updatedContribution = await tx.contribution.update({
                where: { id },
                data: {
                    status: status as PaymentStatus,
                    rejectionReason: status === 'REJECTED' ? rejectionReason : null,
                    reviewedById: userId,
                    reviewDate: new Date(),
                },
            })

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

                if (!member) throw new Error('Member not found')

                // Check if the monthly fee has already been applied for this month/year
                // It's applied if there's a COMPLETED contribution or a FAILED one (applied by PenaltyService)
                const feeAlreadyApplied = await tx.contribution.findFirst({
                    where: {
                        groupId: contribution.groupId,
                        userId: contribution.userId,
                        month: contribution.month,
                        year: contribution.year,
                        status: { in: ['COMPLETED', 'FAILED'] },
                        id: { not: id }
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
                        id: { not: id }
                    }
                })

                let balanceAdjustment = 0
                if (!feeAlreadyApplied) {
                    balanceAdjustment -= member.group.monthlyContribution
                }

                // Initial pool of penalties to pay off
                let totalUnpaidPenalties = member.unpaidPenalties

                // If this is a late contribution and penalty hasn't been applied yet, add it
                if (contribution.penaltyApplied > 0 && !penaltyAlreadyApplied) {
                    totalUnpaidPenalties += contribution.penaltyApplied
                }

                let remainingAmount = contribution.amount
                let penaltyPaid = 0

                // 1. Pay off unpaid penalties first
                if (totalUnpaidPenalties > 0) {
                    penaltyPaid = Math.min(remainingAmount, totalUnpaidPenalties)
                    remainingAmount -= penaltyPaid
                }

                // 2. Increment balance with remaining amount (minus initial debt adjustment)
                await tx.groupMember.update({
                    where: { id: member.id },
                    data: {
                        unpaidPenalties: totalUnpaidPenalties - penaltyPaid,
                        balance: { increment: balanceAdjustment + remainingAmount }
                    }
                })

                return { updatedContribution, penaltyPaid, balanceIncrement: remainingAmount }
            }

            return { updatedContribution, penaltyPaid: 0, balanceIncrement: 0 }
        })

        const { updatedContribution, penaltyPaid, balanceIncrement } = result

        // Create activity log
        await prisma.activity.create({
            data: {
                userId: userId,
                groupId: contribution.groupId,
                actionType: `CONTRIBUTION_${status}`,
                description: `${status === 'COMPLETED' ? 'Approved' : 'Rejected'} contribution of MWK ${contribution.amount.toLocaleString()} from userId ${contribution.userId}`,
                metadata: {
                    contributionId: id,
                    status,
                    rejectionReason
                },
            },
        })

        // Create notification for the user
        await prisma.notification.create({
            data: {
                userId: contribution.userId,
                title: `Contribution ${status === 'COMPLETED' ? 'Approved' : 'Rejected'}`,
                message: status === 'COMPLETED'
                    ? `Your contribution of MWK ${contribution.amount.toLocaleString()} has been approved.`
                    : `Your contribution of MWK ${contribution.amount.toLocaleString()} was rejected: ${rejectionReason}`,
                type: status === 'COMPLETED' ? 'SUCCESS' : 'ERROR',
            }
        })

        return NextResponse.json({
            message: `Contribution ${status.toLowerCase()} successfully`,
            contribution: updatedContribution,
        })

    } catch (error) {
        console.error('Review contribution error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
