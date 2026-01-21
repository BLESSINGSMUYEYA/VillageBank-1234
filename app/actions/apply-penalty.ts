'use server'

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type PenaltyType = 'LATE_MEETING' | 'MISSED_MEETING' | 'LATE_CONTRIBUTION'

export async function applyPenalty(groupId: string, memberId: string, penaltyType: PenaltyType) {
    try {
        const session = await getSession()
        if (!session?.userId) {
            return { error: 'Unauthorized' }
        }
        const userId = session.userId as string

        // 1. Check Permissions (Must be ADMIN or TREASURER)
        const currentMember = await prisma.groupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId,
                    userId: userId
                }
            }
        })

        if (!currentMember || !['ADMIN', 'TREASURER'].includes(currentMember.role)) {
            return { error: 'Insufficient permissions' }
        }

        // 2. Get Rules & Amounts
        const group = await prisma.group.findUnique({
            where: { id: groupId }
        })

        if (!group) return { error: 'Group not found' }

        let amount = 0
        let description = ''

        switch (penaltyType) {
            case 'LATE_MEETING':
                amount = group.lateMeetingFine
                description = 'Late Meeting Fine'
                break
            case 'MISSED_MEETING':
                amount = group.missedMeetingFine
                description = 'Missed Meeting Fine'
                break
            case 'LATE_CONTRIBUTION':
                amount = group.lateContributionFee
                description = 'Late Contribution Fee'
                break
        }

        if (amount <= 0) {
            return { error: `This penalty is not configured (Amount is 0.00). Go to Settings to configure it.` }
        }

        // 3. Apply Penalty
        // Update the member's unpaid penalties
        const updatedMember = await prisma.groupMember.update({
            where: { id: memberId },
            data: {
                unpaidPenalties: { increment: amount }
            },
            include: { user: true }
        })

        // 4. Log Activity
        // We log that the Current User (Admin) performed this action
        await prisma.activity.create({
            data: {
                groupId,
                userId: userId,
                actionType: 'PENALTY_APPLIED',
                description: `Applied ${description} (${amount.toLocaleString()}) to ${updatedMember.user.firstName} ${updatedMember.user.lastName}`,
                metadata: {
                    targetUserId: memberId,
                    penaltyType,
                    amount
                }
            }
        })

        revalidatePath(`/groups/${groupId}`)
        revalidatePath(`/groups`)

        return { success: true, amount, message: `Applied ${description} of ${amount.toLocaleString()}` }
    } catch (error) {
        console.error('Error applying penalty:', error)
        return { error: 'Failed to apply penalty' }
    }
}
