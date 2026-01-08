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
    groupTag?: string
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

    // Parallel fetch of main entities
    const [userGroupsCount, contributions, loans] = await Promise.all([
        prisma.group.count({
            where: {
                members: {
                    some: {
                        userId: userId,
                        status: 'ACTIVE',
                    },
                },
            },
        }),
        prisma.contribution.findMany({
            where: {
                userId: userId,
                status: 'COMPLETED',
            },
        }),
        prisma.loan.findMany({
            where: {
                userId: userId,
            },
            include: {
                repayments: true
            }
        })
    ])

    // Get current month info for filtering
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // Filter in memory to avoid extra DB calls
    const monthlyContribution = contributions.find(c =>
        c.month === currentMonth &&
        c.year === currentYear
    )

    // Calculate stats
    const totalContributions = contributions.reduce((sum, c) => sum + Number(c.amount), 0)
    const pendingLoans = loans.filter(loan => loan.status === 'PENDING').length
    const activeLoans = loans.filter(loan => ['APPROVED', 'ACTIVE'].includes(loan.status)).length

    // Calculate repayment progress using the already fetched loans
    let repaymentProgress = 0
    const eligibleLoans = loans.filter(l => ['APPROVED', 'ACTIVE', 'COMPLETED'].includes(l.status))
    if (eligibleLoans.length > 0) {
        let totalToRepay = 0
        let totalRepaid = 0

        eligibleLoans.forEach(loan => {
            const principal = loan.amountApproved || loan.amountRequested
            const interest = (principal * loan.interestRate) / 100
            totalToRepay += principal + interest
            totalRepaid += loan.repayments.reduce((sum, r) => sum + Number(r.amount), 0)
        })

        if (totalToRepay > 0) {
            repaymentProgress = Math.min(100, Math.round((totalRepaid / totalToRepay) * 100))
        }
    }

    return {
        totalGroups: userGroupsCount,
        totalContributions,
        totalLoans: activeLoans,
        pendingLoans,
        monthlyContribution: monthlyContribution?.amount || 0,
        loanRepaymentProgress: repaymentProgress,
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
                    ubankTag: true,
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
        groupTag: activity.group?.ubankTag || undefined,
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

    // Get pending contributions for groups where user is Admin or Treasurer
    // Combined into a single efficient query using relational filtering
    const pendingContributions = await prisma.contribution.findMany({
        where: {
            status: 'PENDING',
            group: {
                members: {
                    some: {
                        userId: userId,
                        role: { in: ['ADMIN', 'TREASURER'] },
                        status: 'ACTIVE'
                    }
                }
            }
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
                    name: true,
                    monthlyContribution: true,
                    lateContributionFee: true,
                    penaltyAmount: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    // Enrich with member balance and penalties
    const enrichedPending = await Promise.all(pendingContributions.map(async (contribution) => {
        const member = await prisma.groupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId: contribution.groupId,
                    userId: contribution.userId
                }
            },
            select: {
                balance: true,
                unpaidPenalties: true
            }
        })

        return {
            ...contribution,
            member: member || { balance: 0, unpaidPenalties: 0 }
        }
    }))

    return enrichedPending
}

