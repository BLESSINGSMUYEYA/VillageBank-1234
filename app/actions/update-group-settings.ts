'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { InterestType } from '@prisma/client'

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
    if (!session || !session.userId) {
        return { error: 'Unauthorized: No active session found. Please log in again.' }
    }

    const groupId = formData.get('groupId') as string

    const userId = session.userId as string

    // Validate user is admin of the group
    const membership = await prisma.groupMember.findUnique({
        where: {
            groupId_userId: {
                groupId: groupId,
                userId: userId
            }
        }
    })

    console.log('[DEBUG] UpdateGroupSettings - User:', userId, 'Group:', groupId, 'Membership:', membership);

    if (!membership) {
        return { error: `Unauthorized: You are not a member of this group. (User: ${userId}, Group: ${groupId})` }
    }

    if (membership.role !== 'ADMIN') {
        return { error: `Unauthorized: You are a ${membership.role}, but ADMIN access is required.` }
    }

    try {
        const parseNumber = (value: FormDataEntryValue | null, isFloat: boolean = true) => {
            if (!value) return 0
            const num = isFloat ? parseFloat(value as string) : parseInt(value as string)
            return isNaN(num) ? 0 : num
        }

        const monthlyContribution = parseNumber(formData.get('monthlyContribution'))
        const interestRate = parseNumber(formData.get('interestRate'))
        const lateMeetingFine = parseNumber(formData.get('lateMeetingFine'))
        const lateContributionFee = parseNumber(formData.get('lateContributionFee'))
        const missedMeetingFine = parseNumber(formData.get('missedMeetingFine'))
        const socialFundAmount = parseNumber(formData.get('socialFundAmount'))
        const maxLoanMultiplier = parseNumber(formData.get('maxLoanMultiplier'), false)
        const penaltyAmount = parseNumber(formData.get('penaltyAmount'))

        const contributionDueDay = parseNumber(formData.get('contributionDueDay'), false)
        const minContributionMonths = parseNumber(formData.get('minContributionMonths'), false)
        const loanGracePeriodDays = parseNumber(formData.get('loanGracePeriodDays'), false)
        const loanInterestType = (formData.get('loanInterestType') as InterestType) || 'FLAT_RATE'

        const cycleEndDateRaw = formData.get('cycleEndDate') as string
        const cycleEndDate = cycleEndDateRaw ? new Date(cycleEndDateRaw) : null

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
                contributionDueDay,
                minContributionMonths,
                loanGracePeriodDays,
                loanInterestType,
                cycleEndDate,
            }
        })

        revalidatePath(`/groups/${groupId}`)
        revalidatePath(`/groups/${groupId}/settings`)

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
