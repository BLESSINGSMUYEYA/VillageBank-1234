'use server'

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

interface RecordCashTransactionParams {
    groupId: string
    userId: string
    amount: number
    month: number
    year: number
    description?: string
}

export async function recordCashTransaction({
    groupId,
    userId,
    amount,
    month,
    year,
    description
}: RecordCashTransactionParams) {
    try {
        const session = await getSession()
        const currentUserId = session?.userId as string

        if (!currentUserId) {
            return { success: false, error: 'Unauthorized: You must be logged in.' }
        }

        // Verify current user is an admin or treasurer of the group
        const currentUserMember = await prisma.groupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId,
                    userId: currentUserId
                }
            }
        })

        if (!currentUserMember || !['ADMIN', 'TREASURER'].includes(currentUserMember.role)) {
            return { success: false, error: 'Permission Denied: Only admins or treasurers can record cash transactions.' }
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Get the target member to update
            const member = await tx.groupMember.findUnique({
                where: {
                    groupId_userId: {
                        groupId,
                        userId
                    }
                },
                include: { group: true }
            })

            if (!member) return { success: false, error: 'Target member not found in this group.' }

            // 2. Check for existing contributions to determine fees/penalties logic
            // Check if monthly fee is already paid for this month
            const feeAlreadyApplied = await tx.contribution.findFirst({
                where: {
                    groupId,
                    userId,
                    month,
                    year,
                    status: { in: ['COMPLETED', 'FAILED'] }
                }
            })

            // Check if penalty for this month is already applied (if late)
            const now = new Date()
            let isContributionLate = false
            if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
                isContributionLate = true
            } else if (year === now.getFullYear() && month === now.getMonth() + 1 && now.getDate() > member.group.contributionDueDay) {
                isContributionLate = true
            }

            // Check if a penalty was already applied for this slot
            const penaltyAlreadyApplied = await tx.contribution.findFirst({
                where: {
                    groupId,
                    userId,
                    month,
                    year,
                    isLate: true,
                    penaltyApplied: { gt: 0 },
                    status: { in: ['COMPLETED', 'FAILED'] }
                }
            })

            const penaltyAmountToApply = (isContributionLate && !penaltyAlreadyApplied) ? member.group.penaltyAmount : 0

            // 3. Create the Contribution Record
            const contribution = await tx.contribution.create({
                data: {
                    groupId,
                    userId,
                    amount,
                    month,
                    year,
                    paymentMethod: 'CASH',
                    status: 'COMPLETED',
                    transactionRef: `CASH-${Date.now()}`,
                    reviewedById: currentUserId,
                    reviewDate: new Date(),
                    isLate: isContributionLate,
                    penaltyApplied: penaltyAmountToApply,
                }
            })

            // 4. Update Member Balance Logic
            let balanceAdjustment = 0

            // If fee hasn't been paid for this month yet, we "charge" it by decrementing the unexpected balance 
            // (or rather, we consider the contribution as covering it).
            if (!feeAlreadyApplied) {
                balanceAdjustment -= member.group.monthlyContribution
            }

            // Pay off penalties
            let totalUnpaidPenalties = member.unpaidPenalties
            // Add new penalty if applicable
            if (penaltyAmountToApply > 0) {
                totalUnpaidPenalties += penaltyAmountToApply
            }

            let remainingAmount = amount
            let penaltyPaid = 0

            if (totalUnpaidPenalties > 0) {
                penaltyPaid = Math.min(remainingAmount, totalUnpaidPenalties)
                remainingAmount -= penaltyPaid
            }

            // Update user
            await tx.groupMember.update({
                where: { id: member.id },
                data: {
                    unpaidPenalties: totalUnpaidPenalties - penaltyPaid,
                    balance: { increment: balanceAdjustment + remainingAmount }
                }
            })

            // 5. Notify the user
            await tx.notification.create({
                data: {
                    userId,
                    title: 'Cash Contribution Recorded',
                    message: `A cash contribution of MWK ${amount.toLocaleString()} was recorded for you by ${currentUserMember.role === 'ADMIN' ? 'Admin' : 'Treasurer'}.`,
                    type: 'SUCCESS'
                }
            })

            return contribution
        })

        // Check for error returned from transaction (if mapped that way, but here we throw in transaction so catch handles it)
        if ('error' in result) {
            return result
        }

        // Log activity outside transaction
        await prisma.activity.create({
            data: {
                userId: currentUserId,
                groupId,
                actionType: 'RECORD_CASH',
                description: `Recorded cash contribution of ${amount} for user ${userId}`,
                metadata: {
                    contributionId: result.id,
                    amount,
                    targetUserId: userId,
                    notes: description
                }
            }
        })

        revalidatePath(`/groups/${groupId}`)
        revalidatePath('/dashboard')

        return { success: true, data: result }
    } catch (error: any) {
        console.error('Failed to record cash transaction:', error)
        // Return the specific error message if available
        return { success: false, error: error.message || 'Failed to record cash transaction due to an unknown error.' }
    }
}
