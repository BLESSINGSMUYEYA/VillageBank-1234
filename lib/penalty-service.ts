import { prisma } from './prisma'

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
            if (group.penaltyAmount <= 0) return result // No penalty configured

            const now = new Date()
            const currentMonth = now.getMonth() + 1
            const currentYear = now.getFullYear()
            const currentDay = now.getDate()

            // Only check if we are past the due day
            if (currentDay <= group.contributionDueDay) {
                return result
            }

            for (const member of group.members) {
                // Check if contribution exists for this month
                const existingContribution = await prisma.contribution.findUnique({
                    where: {
                        groupId_userId_month_year: {
                            groupId,
                            userId: member.userId,
                            month: currentMonth,
                            year: currentYear
                        }
                    }
                })

                if (!existingContribution) {
                    // Create a pending late contribution with the penalty
                    await prisma.contribution.create({
                        data: {
                            groupId,
                            userId: member.userId,
                            month: currentMonth,
                            year: currentYear,
                            amount: group.monthlyContribution, // Amount still due
                            penaltyApplied: group.penaltyAmount,
                            isLate: true,
                            status: 'PENDING',
                        }
                    })

                    // Create activity log
                    await prisma.activity.create({
                        data: {
                            userId: member.userId,
                            groupId,
                            actionType: 'PENALTY_APPLIED',
                            description: `Late contribution penalty of ${group.penaltyAmount} applied for ${currentMonth}/${currentYear}`,
                            metadata: {
                                amount: group.penaltyAmount,
                                month: currentMonth,
                                year: currentYear
                            }
                        }
                    })

                    // TODO: Create notification for the user

                    result.penaltiesApplied++
                    result.totalAmount += group.penaltyAmount
                } else if (!existingContribution.isLate &&
                    existingContribution.status === 'PENDING' &&
                    new Date(existingContribution.createdAt).getDate() > group.contributionDueDay) {
                    // If contribution exists but was created after due date and hasn't been marked late yet
                    await prisma.contribution.update({
                        where: { id: existingContribution.id },
                        data: {
                            isLate: true,
                            penaltyApplied: group.penaltyAmount
                        }
                    })

                    result.penaltiesApplied++
                    result.totalAmount += group.penaltyAmount
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
