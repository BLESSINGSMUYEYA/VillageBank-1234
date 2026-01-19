import { prisma } from './prisma'
import { NotificationService } from './notification-service'

export interface PenaltyResult {
    groupId: string
    penaltiesApplied: number
    totalAmount: number
    errors: string[]
}

export class PenaltyService {
    /**
     * Checks a specific group for late contributions and applies penalties.
     * Should be called for the current month.
     */
    static async checkGroupPenalties(groupId: string): Promise<PenaltyResult> {
        const result: PenaltyResult = {
            groupId,
            penaltiesApplied: 0,
            totalAmount: 0,
            errors: []
        }

        try {
            const group = await prisma.group.findUnique({
                where: { id: groupId },
                include: {
                    members: {
                        where: { status: 'ACTIVE' }
                    }
                }
            })

            if (!group) throw new Error('Group not found')

            const penaltyToApply = group.lateContributionFee > 0 ? group.lateContributionFee : group.penaltyAmount
            if (penaltyToApply <= 0) return result // No penalty configured

            const now = new Date()
            const currentMonth = now.getMonth() + 1
            const currentYear = now.getFullYear()
            const currentDay = now.getDate()
            const currentDayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, ...

            let isPastDeadline = false
            if (group.contributionDeadlineType === 'WEEKLY') {
                // If weekly, assume contributionDueDay is 1-7 (Mon-Sun)
                // We check if current day of week is past the due day
                // Note: getDay() 0=Sun, so we map 1=Mon, 7=Sun
                const normalizedDueDay = group.contributionDueDay === 7 ? 0 : group.contributionDueDay
                isPastDeadline = currentDayOfWeek > normalizedDueDay
            } else {
                // Monthly
                isPastDeadline = currentDay > group.contributionDueDay
            }

            // Only check if we are past the due day
            if (!isPastDeadline) {
                return result
            }

            for (const member of group.members) {
                // Check if contribution exists for this month
                const existingContribution = await prisma.contribution.findFirst({
                    where: {
                        groupId,
                        userId: member.userId,
                        month: currentMonth,
                        year: currentYear,
                        status: { not: 'FAILED' }
                    }
                })

                if (!existingContribution) {
                    // Update GroupMember to reflect debt and penalty
                    await prisma.groupMember.update({
                        where: { id: member.id },
                        data: {
                            unpaidPenalties: { increment: penaltyToApply },
                            balance: { decrement: group.monthlyContribution }
                        }
                    })

                    // Create a placeholder contribution
                    await prisma.contribution.create({
                        data: {
                            groupId,
                            userId: member.userId,
                            month: currentMonth,
                            year: currentYear,
                            amount: 0,
                            penaltyApplied: penaltyToApply,
                            isLate: true,
                            status: 'FAILED',
                        }
                    })

                    // Create activity log
                    await prisma.activity.create({
                        data: {
                            userId: member.userId,
                            groupId,
                            actionType: 'PENALTY_APPLIED',
                            description: `Late contribution penalty of ${penaltyToApply} applied for ${currentMonth}/${currentYear}`,
                            metadata: {
                                amount: penaltyToApply,
                                month: currentMonth,
                                year: currentYear
                            }
                        }
                    })

                    // Create notification
                    await NotificationService.send({
                        userId: member.userId,
                        title: 'Penalty Applied',
                        message: `A late contribution penalty of MWK ${penaltyToApply.toLocaleString()} has been applied for ${currentMonth}/${currentYear}.`,
                        type: 'WARNING',
                        actionUrl: `/groups/${groupId}`,
                        actionText: 'Pay Now'
                    })

                    result.penaltiesApplied++
                    result.totalAmount += penaltyToApply
                } else if (!existingContribution.isLate &&
                    existingContribution.status === 'PENDING' &&
                    isPastDeadline) {

                    await prisma.contribution.update({
                        where: { id: existingContribution.id },
                        data: {
                            isLate: true,
                            penaltyApplied: penaltyToApply
                        }
                    })

                    result.penaltiesApplied++
                    result.totalAmount += penaltyToApply
                }
            }

            return result
        } catch (error) {
            console.error(`Error checking penalties for group ${groupId}:`, error)
            result.errors.push(error instanceof Error ? error.message : 'Unknown error')
            return result
        }
    }

    /**
     * Checks all active groups for late contributions.
     * Can be triggered by a CRON job.
     */
    static async checkAllGroups(): Promise<PenaltyResult[]> {
        const groups = await prisma.group.findMany({
            where: { isActive: true }
        })

        const results: PenaltyResult[] = []
        for (const group of groups) {
            const result = await this.checkGroupPenalties(group.id)
            results.push(result)
        }

        return results
    }
}
