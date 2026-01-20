'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export type UpdateGroupSettingsState = {
    success?: boolean
    error?: string
    message?: string
}

export async function updateGroupSettings(
    prevState: UpdateGroupSettingsState | null,
    formData: FormData
): Promise<UpdateGroupSettingsState> {
    const session = await getSession()
    if (!session?.user) {
        return { error: 'Unauthorized' }
    }

    const groupId = formData.get('groupId') as string

    const userId = (session.user as any).id

    // Validate user is admin of the group
    const membership = await prisma.groupMember.findUnique({
        where: {
            groupId_userId: {
                groupId: groupId,
                userId: userId
            }
        }
    })

    if (!membership || membership.role !== 'ADMIN') {
        return { error: 'Unauthorized: Only admins can update settings' }
    }

    try {
        const monthlyContribution = parseFloat(formData.get('monthlyContribution') as string)
        const interestRate = parseFloat(formData.get('interestRate') as string)
        const lateMeetingFine = parseFloat(formData.get('lateMeetingFine') as string)
        const lateContributionFee = parseFloat(formData.get('lateContributionFee') as string)
        const missedMeetingFine = parseFloat(formData.get('missedMeetingFine') as string)
        const socialFundAmount = parseFloat(formData.get('socialFundAmount') as string)
        const maxLoanMultiplier = parseFloat(formData.get('maxLoanMultiplier') as string)
        const penaltyAmount = parseFloat(formData.get('penaltyAmount') as string)

        await prisma.group.update({
            where: { id: groupId },
            data: {
                monthlyContribution,
                interestRate,
                lateMeetingFine,
                lateContributionFee,
                missedMeetingFine,
                socialFundAmount,
                maxLoanMultiplier,
                penaltyAmount,
            }
        })

        revalidatePath(`/groups/${groupId}`)
        revalidatePath(`/groups/${groupId}`)

        return {
            success: true,
            message: 'Settings updated successfully'
        }
    } catch (error) {
        console.error('Failed to update settings:', error)
        return {
            success: false,
            error: 'Failed to update settings'
        }
    }
}
