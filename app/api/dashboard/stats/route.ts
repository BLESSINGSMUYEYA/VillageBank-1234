import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    
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

    const stats = {
      totalGroups: userGroups.length,
      totalContributions,
      totalLoans: activeLoans,
      pendingLoans,
      monthlyContribution: monthlyContribution?.amount || 0,
      loanRepaymentProgress: 0, // TODO: Calculate actual repayment progress
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
