import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { LoansClient } from '@/components/loans/LoansClient'

export default async function LoansPage() {
  const { userId } = await auth()

  if (!userId) {
    return <div className="p-8 text-center text-h3">Please sign in to access loans.</div>
  }

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

  // Calculate eligibility server-side
  const eligibilityChecks = await Promise.all(
    userGroups.map(async (groupMember) => {
      const contributions = await prisma.contribution.findMany({
        where: {
          userId: userId,
          groupId: groupMember.groupId,
          status: 'COMPLETED',
        },
      })

      const totalContributions = contributions.reduce((sum, c) => sum + Number(c.amount), 0)
      const maxLoanAmount = totalContributions * groupMember.group.maxLoanMultiplier

      const hasActiveLoan = loans.some(l =>
        l.groupId === groupMember.groupId &&
        ['PENDING', 'APPROVED', 'ACTIVE'].includes(l.status)
      )

      return {
        group: groupMember.group,
        eligible: contributions.length >= 3 && !hasActiveLoan,
        contributionsCount: contributions.length,
        totalContributions,
        maxLoanAmount,
        hasActiveLoan,
      }
    })
  )

  return (
    <LoansClient
      loans={loans}
      eligibilityChecks={eligibilityChecks}
    />
  )
}
