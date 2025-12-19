import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate financial summary
    const totalContributions = user.contributions
      .filter(c => c.status === 'COMPLETED')
      .reduce((sum, c) => sum + c.amount, 0)

    const totalLoans = user.loans
      .filter(l => l.status === 'APPROVED' || l.status === 'ACTIVE')
      .reduce((sum, l) => sum + (l.amountApproved || l.amountRequested), 0)

    const outstandingLoanBalance = user.loans
      .filter(l => l.status === 'ACTIVE')
      .reduce((sum, l) => {
        const approved = l.amountApproved || l.amountRequested
        const repaid = l.repayments.reduce((sum, r) => sum + r.amount, 0)
        return sum + (approved - repaid)
      }, 0)

    // Calculate contribution streak
    const contributionStreak = calculateContributionStreak(user.contributions)

    // Calculate eligibility score
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
      isActive: true, // Default to true since User model doesn't have isActive field
      memberships: user.groupMembers.map(member => ({
        id: member.group.id,
        name: member.group.name,
        role: member.role,
        status: member.status,
        joinedAt: member.joinedAt,
        monthlyContribution: member.group.monthlyContribution,
        memberCount: member.group._count.members
      })),
      financialSummary: {
        totalContributions,
        totalLoans,
        outstandingLoanBalance,
        contributionStreak,
        eligibilityScore
      }
    }

    return NextResponse.json(profileData)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, phoneNumber, region } = body

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phoneNumber,
        region
      }
    })

    return NextResponse.json({
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role,
      region: updatedUser.region,
      isActive: true // Default to true since User model doesn't have isActive field
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateContributionStreak(contributions: any[]): number {
  if (!contributions.length) return 0

  const completedContributions = contributions
    .filter(c => c.status === 'COMPLETED')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  let streak = 0
  let currentDate = new Date()

  for (const contribution of completedContributions) {
    const contribDate = new Date(contribution.year, contribution.month - 1)
    const monthsDiff = (currentDate.getFullYear() - contribDate.getFullYear()) * 12 + 
                      (currentDate.getMonth() - contribDate.getMonth())

    if (monthsDiff === streak) {
      streak++
      currentDate = contribDate
    } else {
      break
    }
  }

  return streak
}

function calculateEligibilityScore(user: any, totalContributions: number, outstandingBalance: number): number {
  let score = 100

  // Reduce score based on outstanding balance
  if (outstandingBalance > 0) {
    score -= Math.min(30, (outstandingBalance / 100000) * 30)
  }

  // Increase score based on contribution history
  if (totalContributions > 50000) {
    score += 10
  }

  // Check if user has active loans in good standing
  const activeLoans = user.loans?.filter((l: any) => l.status === 'ACTIVE') || []
  if (activeLoans.length > 0) {
    score += 5
  }

  // Ensure score stays within bounds
  return Math.max(0, Math.min(100, Math.round(score)))
}
