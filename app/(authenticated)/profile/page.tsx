import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProfileClient } from '@/components/profile/ProfileClient'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const session = await getSession()
  const userId = session?.userId

  if (!userId) {
    redirect('/login')
  }

  // Fetch full user profile with related data
  const user = await prisma.user.findUnique({
    where: { id: userId as string },
    include: {
      groupMembers: {
        include: {
          group: {
            select: {
              id: true,
              name: true,
              monthlyContribution: true,
              _count: {
                select: {
                  members: true
                }
              }
            }
          }
        }
      },
      contributions: {
        select: {
          amount: true,
          month: true,
          year: true,
          status: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 12
      },
      loans: {
        select: {
          id: true,
          amountRequested: true,
          amountApproved: true,
          status: true,
          createdAt: true,
          repayments: {
            select: {
              amount: true,
              paidAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      identityVerification: {
        select: {
          status: true
        }
      }
    }
  })

  if (!user) {
    redirect('/login')
  }

  // Calculate financial summary (Server Side Logic)
  const totalContributions = user.contributions
    .filter((c) => c.status === 'COMPLETED')
    .reduce((sum, c) => sum + c.amount, 0)

  const totalLoans = user.loans
    .filter((l) => l.status === 'APPROVED' || l.status === 'ACTIVE')
    .reduce((sum, l) => sum + (l.amountApproved || l.amountRequested), 0)

  const outstandingLoanBalance = user.loans
    .filter((l) => l.status === 'ACTIVE')
    .reduce((sum, l) => {
      const approved = l.amountApproved || l.amountRequested
      const repaid = l.repayments.reduce((rSum, r) => rSum + r.amount, 0)
      return sum + (approved - repaid)
    }, 0)

  const contributionStreak = calculateContributionStreak(user.contributions)
  const eligibilityScore = calculateEligibilityScore(user, totalContributions, outstandingLoanBalance)

  const profileData = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    region: user.region,
    joinedAt: user.createdAt,
    ubankId: user.ubankId,
    isActive: true, // Assuming active if they can login
    isVerified: user.identityVerification?.status === 'VERIFIED'
  }

  const memberships = user.groupMembers.map((member) => ({
    id: member.group.id,
    name: member.group.name,
    role: member.role,
    status: member.status,
    joinedAt: member.joinedAt,
    monthlyContribution: member.group.monthlyContribution,
    memberCount: member.group._count.members
  }))

  const financials = {
    totalContributions,
    totalLoans,
    outstandingLoanBalance,
    contributionStreak,
    eligibilityScore,
    recentContributions: user.contributions.map(c => ({
      amount: c.amount,
      status: c.status,
      date: c.createdAt,
      groupName: 'Community Group' // Fallback or fetch actual group name
    })),
    recentLoans: user.loans.map(l => ({
      id: l.id,
      amount: l.amountRequested,
      status: l.status,
      date: l.createdAt
    }))
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-8 px-0 sm:px-6 lg:px-8 pb-24 space-y-6">
      <ProfileClient
        profile={profileData}
        memberships={memberships}
        financials={financials}
      />
    </div>
  )
}

function calculateContributionStreak(contributions: { status: string; createdAt: Date; year: number; month: number }[]): number {
  if (!contributions.length) return 0

  const completedContributions = contributions
    .filter(c => c.status === 'COMPLETED')
    // Sort by most recent first
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  let streak = 0
  let currentDate = new Date()

  // Simplified streak calculation: logic mirrors the API but runs on server
  for (const contribution of completedContributions) {
    const contribDate = new Date(contribution.year, contribution.month - 1)
    const monthsDiff = (currentDate.getFullYear() - contribDate.getFullYear()) * 12 +
      (currentDate.getMonth() - contribDate.getMonth())

    // Allow for current month or previous month to start streak
    if (monthsDiff === streak || (streak === 0 && monthsDiff <= 1)) {
      if (monthsDiff > streak) streak = monthsDiff // Catch-up if we skipped a month in check
      streak++
      // Determine "previous" expected date for next iteration
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    } else {
      break
    }
  }

  return streak > 0 ? streak : (completedContributions.length > 0 ? 1 : 0) // Basic fallback
}

function calculateEligibilityScore(user: { loans: { status: string }[] }, totalContributions: number, outstandingBalance: number): number {
  let score = 100

  if (outstandingBalance > 0) {
    score -= Math.min(30, (outstandingBalance / 500000) * 30) // Adjusted scale for MWK
  }

  if (totalContributions > 100000) {
    score += 10
  }

  const activeLoans = user.loans?.filter((l) => l.status === 'ACTIVE') || []
  if (activeLoans.length > 0) {
    score += 5
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}
