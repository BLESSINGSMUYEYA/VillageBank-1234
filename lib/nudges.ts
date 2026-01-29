import { prisma } from '@/lib/prisma'
import { VerificationStatus } from '@prisma/client'

export type NudgeType = 'VERIFY_IDENTITY' | 'ENABLE_NOTIFICATIONS' | null

export async function getUsersForNudge() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { lastOnboardingNudgeSentAt: null },
                    { lastOnboardingNudgeSentAt: { lt: twentyFourHoursAgo } }
                ]
            },
            include: {
                identityVerification: true,
                pushSubscriptions: true
            }
        })
        return users
    } catch (error) {
        console.error('Error fetching users for nudge:', error)
        return []
    }
}

export function determineNudgeType(user: any): NudgeType {
    // Priority 1: Identity Verification
    if (!user.identityVerification || user.identityVerification.status !== VerificationStatus.VERIFIED) {
        // If they already submitted and are pending, maybe don't nudge them? 
        // Or nudge them if rejected?
        // Let's nudge if they haven't submitted OR if they are rejected.
        // If PENDING, we probably shouldn't bug them.

        if (!user.identityVerification) return 'VERIFY_IDENTITY'
        if (user.identityVerification.status === VerificationStatus.REJECTED) return 'VERIFY_IDENTITY'

        // If PENDING, skip nudge for now
        if (user.identityVerification.status === VerificationStatus.PENDING) return null
    }

    // Priority 2: Push Notifications
    if (user.pushSubscriptions.length === 0) {
        return 'ENABLE_NOTIFICATIONS'
    }

    return null
}

export async function updateNudgeTimestamp(userId: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { lastOnboardingNudgeSentAt: new Date() }
        })
    } catch (error) {
        console.error('Error updating nudge timestamp:', error)
    }
}
