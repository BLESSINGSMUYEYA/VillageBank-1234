import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { VaultClient } from '@/components/vault/VaultClient'
import { PaymentStatus } from '@prisma/client'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'

export default async function VaultPage({
    searchParams,
}: {
    searchParams: Promise<{
        status?: string;
        groupId?: string;
        search?: string;
        page?: string;
    }>
}) {
    const session = await getSession()
    const userId = session?.userId
    const params = await searchParams

    if (!userId) {
        redirect('/sign-in')
    }

    const page = parseInt(params.page || '1')
    const limit = 10
    const skip = (page - 1) * limit

    // 1. Fetch Contributions with pagination
    const [contributions, totalContributions] = await Promise.all([
        prisma.contribution.findMany({
            where: {
                userId: userId as string,
                ...(params.status && params.status !== 'all' ? { status: params.status as PaymentStatus } : {}),
                ...(params.groupId && params.groupId !== 'all' ? { groupId: params.groupId } : {}),
            },
            include: {
                group: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip,
            take: limit,
        }),
        prisma.contribution.count({
            where: {
                userId: userId as string,
                ...(params.status && params.status !== 'all' ? { status: params.status as PaymentStatus } : {}),
                ...(params.groupId && params.groupId !== 'all' ? { groupId: params.groupId } : {}),
            }
        })
    ])

    // 2. Fetch Loans
    const loans = await prisma.loan.findMany({
        where: {
            userId: userId as string,
        },
        include: {
            group: true,
            repayments: {
                orderBy: {
                    createdAt: 'desc',
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    })

    // 3. Fetch Active Group Memberships (for eligibility and penalties)
    const userGroups = await prisma.groupMember.findMany({
        where: {
            userId: userId as string,
            status: 'ACTIVE',
        },
        include: {
            group: true,
        },
    })

    // 4. Calculate Eligibility (Server Side) - Optimized with single query
    const eligibilityChecks = []

    if (userGroups.length > 0) {
        // Fetch all contribution stats in one query
        const contributionStats = await prisma.contribution.groupBy({
            by: ['groupId'],
            where: {
                userId: userId as string,
                groupId: { in: userGroups.map(g => g.groupId) },
                status: 'COMPLETED',
            },
            _count: {
                id: true
            },
            _sum: {
                amount: true
            }
        })

        // Create a map for quick lookup
        const statsMap = new Map(
            contributionStats.map(stat => [
                stat.groupId,
                {
                    count: stat._count.id,
                    total: Number(stat._sum.amount || 0)
                }
            ])
        )

        // Build eligibility checks using the stats map
        for (const groupMember of userGroups) {
            const stats = statsMap.get(groupMember.groupId) || { count: 0, total: 0 }

            const hasActiveLoan = loans.some(l =>
                l.groupId === groupMember.groupId &&
                ['PENDING', 'APPROVED', 'ACTIVE'].includes(l.status)
            )

            eligibilityChecks.push({
                group: groupMember.group,
                eligible: stats.count >= (groupMember.group.minContributionMonths || 3) && !hasActiveLoan,
                contributionsCount: stats.count,
                totalContributions: stats.total,
                maxLoanAmount: stats.total * groupMember.group.maxLoanMultiplier,
                hasActiveLoan,
                unpaidPenalties: groupMember.unpaidPenalties
            })
        }
    }

    // Search filtering logic for UI
    let filteredContributions = contributions
    if (params.search) {
        const searchTerm = params.search.toLowerCase()
        filteredContributions = contributions.filter(contribution =>
            contribution.group.name.toLowerCase().includes(searchTerm)
        )
    }

    return (
        <PageContainer size="default">
            <PageHeader
                title={
                    <>
                        Your <span className="text-gradient-primary">Vault</span>
                    </>
                }
                description="Track your contributions, loans, and financial journey across all circles."
                badge="Financial Hub"
                backHref="/dashboard"
                backLabel="Back to Dashboard"
            />

            <VaultClient
                contributions={filteredContributions}
                loans={loans}
                userGroups={userGroups}
                eligibilityChecks={eligibilityChecks}
                params={params}
                pagination={{
                    currentPage: page,
                    totalPages: Math.ceil(totalContributions / limit),
                    totalItems: totalContributions
                }}
            />
        </PageContainer>
    )
}
