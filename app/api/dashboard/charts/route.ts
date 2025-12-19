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

    return NextResponse.json({
      monthlyData,
      groupComparison,
      paymentMethods,
      summaryStats: {
        totalContributions,
        averageMonthly,
        highestMonth,
        currentStreak
      }
    })

  } catch (error) {
    console.error('Dashboard charts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
