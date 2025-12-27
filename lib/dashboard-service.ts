import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export interface DashboardStats {
    totalGroups: number
    totalContributions: number
    totalLoans: number
    pendingLoans: number
    monthlyContribution: number
    loanRepaymentProgress: number
}

export interface RecentActivity {
    id: string
    type: string
    description: string
    amount?: number
    createdAt: Date
    groupName: string
}

export interface ChartData {
    monthlyData: Array<{ month: string; amount: number; count: number }>
    groupComparison: Array<{ name: string; contributions: number; loans: number }>
    paymentMethods: Array<{ method: string; value: number; percentage: number }>
    summaryStats: {
        totalContributions: number
        averageMonthly: number
        highestMonth: number
        currentStreak: number
    }
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const session = await getSession()
    const userId = session?.userId

    if (!userId) {
        throw new Error('Unauthorized')
    }

    // Get user's groups
    const userGroups = await prisma.group.findMany({
        where: {
            members: {
                some: {
                    userId: userId,
                    status: 'ACTIVE',
                },
            },
        },
    })

    // Get user's contributions
    const contributions = await prisma.contribution.findMany({
        where: {
            userId: userId,
            status: 'COMPLETED',
        },
    })

    // Get user's loans
    const loans = await prisma.loan.findMany({
        where: {
            userId: userId,
        },
    })

    // Get current month contribution
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    const monthlyContribution = await prisma.contribution.findFirst({
        where: {
            userId: userId,
            month: currentMonth,
            year: currentYear,
            status: 'COMPLETED',
        },
    })

    // Calculate stats
    const totalContributions = contributions.reduce((sum, c) => sum + Number(c.amount), 0)
    const pendingLoans = loans.filter(loan => loan.status === 'PENDING').length
    const activeLoans = loans.filter(loan => ['APPROVED', 'ACTIVE'].includes(loan.status)).length

    return {
        totalGroups: userGroups.length,
        totalContributions,
        totalLoans: activeLoans,
        pendingLoans,
        monthlyContribution: monthlyContribution?.amount || 0,
        loanRepaymentProgress: await calculateRepaymentProgress(userId as string),
    }
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
    const session = await getSession()
    const userId = session?.userId

    if (!userId) {
        throw new Error('Unauthorized')
    }

    // Get user's recent activities
    const activities = await prisma.activity.findMany({
        where: {
            userId: userId as string,
        },
        include: {
            group: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 10,
    })

    // Format activities for dashboard
    return activities.map(activity => ({
        id: activity.id,
        type: activity.actionType,
        description: activity.description,
        amount: (activity.metadata as any)?.amount as number | undefined,
        createdAt: activity.createdAt,
        groupName: activity.group?.name || 'Unknown Group',
    }))
}

export async function getChartData(): Promise<ChartData> {
    const session = await getSession()
    const userId = session?.userId

    if (!userId) {
        throw new Error('Unauthorized')
    }

    // Get monthly contribution data for the last 12 months
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const contributions = await prisma.contribution.findMany({
        where: {
            userId: userId,
            status: 'COMPLETED',
            createdAt: {
                gte: twelveMonthsAgo
            }
        },
        include: {
            group: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            createdAt: 'asc'
        }
    })

    // Process monthly contribution data
    const monthlyData = contributions.reduce((acc, contrib) => {
        const month = new Date(contrib.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        const existing = acc.find(item => item.month === month)

        if (existing) {
            existing.amount += Number(contrib.amount)
            existing.count += 1
        } else {
            acc.push({
                month,
                amount: Number(contrib.amount),
                count: 1
            })
        }

        return acc
    }, [] as Array<{ month: string; amount: number; count: number }>)

    // Get group comparison data
    const groupData = await prisma.group.findMany({
        where: {
            members: {
                some: {
                    userId: userId,
                    status: 'ACTIVE'
                }
            }
        },
        include: {
            _count: {
                select: {
                    contributions: {
                        where: {
                            userId: userId,
                            status: 'COMPLETED'
                        }
                    },
                    loans: {
                        where: {
                            userId: userId
                        }
                    }
                }
            },
            contributions: {
                where: {
                    userId: userId,
                    status: 'COMPLETED'
                },
                select: {
                    amount: true
                }
            },
            loans: {
                where: {
                    userId: userId,
                    status: { in: ['APPROVED', 'ACTIVE'] }
                },
                select: {
                    amountApproved: true,
                    amountRequested: true
                }
            }
        }
    })

    const groupComparison = groupData.map(group => ({
        name: group.name,
        contributions: group.contributions.reduce((sum, c) => sum + Number(c.amount), 0),
        loans: group.loans.reduce((sum, l) => sum + Number(l.amountApproved || l.amountRequested), 0)
    }))

    // Get payment methods distribution
    const paymentMethods = contributions.reduce((acc, contrib) => {
        const method = contrib.paymentMethod || 'OTHER'
        const existing = acc.find(item => item.method === method)

        if (existing) {
            existing.value += Number(contrib.amount)
        } else {
            acc.push({
                method,
                value: Number(contrib.amount),
                percentage: 0
            })
        }

        return acc
    }, [] as Array<{ method: string; value: number; percentage: number }>)

    // Calculate percentages
    const total = paymentMethods.reduce((sum, pm) => sum + pm.value, 0)
    paymentMethods.forEach(pm => {
        pm.percentage = Math.round((pm.value / total) * 100)
    })

    // Calculate summary stats
    const totalContributions = contributions.reduce((sum, c) => sum + Number(c.amount), 0)
    const averageMonthly = monthlyData.length > 0 ? totalContributions / monthlyData.length : 0
    const highestMonth = monthlyData.length > 0 ? Math.max(...monthlyData.map(d => d.amount)) : 0

    // Calculate contribution streak
    const sortedMonths = monthlyData.map(d => d.month).reverse()
    let currentStreak = 0
    const expectedMonths = []
    for (let i = 0; i < 12; i++) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        expectedMonths.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))
    }

    expectedMonths.forEach(expectedMonth => {
        if (sortedMonths[currentStreak] === expectedMonth) {
            currentStreak++
        }
    })

    return {
        monthlyData,
        groupComparison,
        paymentMethods,
        summaryStats: {
            totalContributions,
            averageMonthly,
            highestMonth,
            currentStreak
        }
    }
}

export async function getPendingApprovals() {
    const session = await getSession()
    const userId = session?.userId as string

    if (!userId) {
        throw new Error('Unauthorized')
    }

    // Get groups where user is Admin or Treasurer
    const managedGroups = await prisma.groupMember.findMany({
        where: {
            userId: userId,
            role: { in: ['ADMIN', 'TREASURER'] },
            status: 'ACTIVE'
        },
        select: {
            groupId: true
        }
    })

    const groupIds = managedGroups.map(mg => mg.groupId)

    if (groupIds.length === 0) {
        return []
    }

    // Get pending contributions for these groups
    const pendingContributions = await prisma.contribution.findMany({
        where: {
            groupId: { in: groupIds },
            status: 'PENDING'
        },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true
                }
            },
            group: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return pendingContributions
}


async function calculateRepaymentProgress(userId: string): Promise<number> {
    const loans = await prisma.loan.findMany({
        where: {
            userId,
            status: { in: ['APPROVED', 'ACTIVE', 'COMPLETED'] }
        },
        include: {
            repayments: true
        }
    })

    if (loans.length === 0) return 0

    let totalToRepay = 0
    let totalRepaid = 0

    loans.forEach(loan => {
        // Simple logic: total due = principal + (principal * interest / 100)
        const principal = loan.amountApproved || loan.amountRequested
        const interest = (principal * loan.interestRate) / 100
        totalToRepay += principal + interest

        const repaid = loan.repayments.reduce((sum, r) => sum + Number(r.amount), 0)
        totalRepaid += repaid
    })

    if (totalToRepay === 0) return 0

    return Math.min(100, Math.round((totalRepaid / totalToRepay) * 100))
}
