'use server'

import { auth } from '@clerk/nextjs/server'
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
    const { userId: currentUserId } = await auth()

    if (!currentUserId) {
        throw new Error('Unauthorized')
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
        throw new Error('Only admins or treasurers can record cash transactions')
    }

    try {
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

            if (!member) throw new Error('Target member not found in this group')

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
            // Logic: Is it late now?
            const now = new Date()
            const isLate = now.getDate() > member.group.contributionDueDay
            // If paying for a past month, it's definitely late unless we add complex month logic. 
            // For simplicity, we use the current date vs due day if matching current month, 
            // or if month < currentMonth (assuming same year) it's late. 
            // But usually treasurers record "now". Let's stick to simple "isLate" based on day if current month.
            // Actually, let's trust the Treasurer's intent - usually cash is "on time" if they are recording it, 
            // or "late" if they say so. But system rule:
            // If strictly enforcing rules:
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
            // The standard logic seems to be: Balance = Balance + Contribution - Obligations
            // If obligation (Fee) exists and wasn't met, we deduct it.
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

        // Log activity outside transaction (or inside, doesn't matter much, but keeping it consistent)
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
    } catch (error) {
        console.error('Failed to record cash transaction:', error)
        throw new Error('Failed to record cash transaction')
    }
}
