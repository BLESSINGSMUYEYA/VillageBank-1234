import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { VaultClient } from '@/components/vault/VaultClient'
import { PaymentStatus } from '@prisma/client'

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

    // 4. Calculate Eligibility (Server Side)
    const eligibilityChecks = []
    for (const groupMember of userGroups) {
        const completedContributions = await prisma.contribution.count({
            where: {
                userId: userId as string,
                groupId: groupMember.groupId,
                status: 'COMPLETED',
            },
        })

        const totalContributionsValue = await prisma.contribution.aggregate({
            where: {
                userId: userId as string,
                groupId: groupMember.groupId,
                status: 'COMPLETED',
            },
            _sum: {
                amount: true
            }
        }).then(res => Number(res._sum.amount || 0))

        const hasActiveLoan = loans.some(l =>
            l.groupId === groupMember.groupId &&
            ['PENDING', 'APPROVED', 'ACTIVE'].includes(l.status)
        )

        eligibilityChecks.push({
            group: groupMember.group,
            eligible: completedContributions >= (groupMember.group.minContributionMonths || 3) && !hasActiveLoan,
            contributionsCount: completedContributions,
            totalContributions: totalContributionsValue,
            maxLoanAmount: totalContributionsValue * groupMember.group.maxLoanMultiplier,
            hasActiveLoan,
            unpaidPenalties: groupMember.unpaidPenalties
        })
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
        <div className="w-full max-w-7xl mx-auto py-4 sm:py-8 px-0 sm:px-6 lg:px-8 pb-24 space-y-6">
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
        </div>
    )
}
