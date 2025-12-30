import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LoansClient } from '@/components/loans/LoansClient'
import { redirect } from 'next/navigation'

export default async function LoansPage() {
  const session = await getSession()

  if (!session || !session.userId) {
    redirect('/login')
  }

  const userId = session.userId as string

  // Get user's loans
  const loans = await prisma.loan.findMany({
    where: {
      userId: userId,
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

  // Get user's active groups
  const userGroups = await prisma.groupMember.findMany({
    where: {
      userId: userId,
      status: 'ACTIVE',
    },
    include: {
      group: true,
    },
  })

  // Calculate eligibility server-side - Sequenced to avoid overwhelming the database connection in dev
  const eligibilityChecks = []
  for (const groupMember of userGroups) {
    const contributions = await prisma.contribution.findMany({
      where: {
        userId: userId,
        groupId: groupMember.groupId,
        status: 'COMPLETED',
      },
      take: 12 // Optimization: only need to check if count >= 3
    })

    const totalContributions = contributions.reduce((sum, c) => sum + Number(c.amount), 0)
    const maxLoanAmount = totalContributions * groupMember.group.maxLoanMultiplier

    const hasActiveLoan = loans.some(l =>
      l.groupId === groupMember.groupId &&
      ['PENDING', 'APPROVED', 'ACTIVE'].includes(l.status)
    )

    eligibilityChecks.push({
      group: groupMember.group,
      eligible: contributions.length >= 3 && !hasActiveLoan,
      contributionsCount: contributions.length,
      totalContributions,
      maxLoanAmount,
      hasActiveLoan,
    })
  }

  return (
    <LoansClient
      loans={loans}
      eligibilityChecks={eligibilityChecks}
    />
  )
}
