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

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all'
    const status = searchParams.get('status')
    const dateRange = searchParams.get('dateRange') || 'month'
    const minAmount = searchParams.get('minAmount')
    const maxAmount = searchParams.get('maxAmount')
    const groups = searchParams.get('groups')?.split(',').filter(Boolean)
    const paymentMethods = searchParams.get('paymentMethods')?.split(',').filter(Boolean)

    const results: any[] = []

    // Calculate date filter
    const now = new Date()
    const dateFilter = new Date()
    switch (dateRange) {
      case 'week':
        dateFilter.setDate(now.getDate() - 7)
        break
      case 'month':
        dateFilter.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        dateFilter.setMonth(now.getMonth() - 3)
        break
      case 'year':
        dateFilter.setFullYear(now.getFullYear() - 1)
        break
    }

    // Search Groups
    if (type === 'all' || type === 'groups') {
      const groupsWhere: any = {
        members: {
          some: {
            userId: userId
          }
        }
      }

      if (query) {
        groupsWhere.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      }

      const groups = await prisma.group.findMany({
        where: groupsWhere,
        include: {
          members: {
            where: { userId },
            select: { role: true, status: true }
          },
          _count: {
            select: {
              members: true,
              contributions: true,
              loans: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })

      results.push(...groups.map(group => ({
        id: group.id,
        type: 'group',
        title: group.name,
        description: group.description || `Group in ${group.region}`,
        status: group.members[0]?.status,
        date: group.createdAt.toISOString(),
        group: group.name,
        url: `/groups/${group.id}`,
        metadata: {
          region: group.region,
          memberCount: group._count.members,
          role: group.members[0]?.role
        }
      })))
    }

    // Search Contributions
    if (type === 'all' || type === 'contributions') {
      const contributionsWhere: any = {
        userId: userId,
        createdAt: { gte: dateFilter }
      }

      if (query) {
        contributionsWhere.OR = [
          { transactionRef: { contains: query, mode: 'insensitive' } }
        ]
      }

      if (status) {
        contributionsWhere.status = status
      }

      if (minAmount || maxAmount) {
        contributionsWhere.amount = {}
        if (minAmount) contributionsWhere.amount.gte = Number(minAmount)
        if (maxAmount) contributionsWhere.amount.lte = Number(maxAmount)
      }

      if (groups?.length) {
        contributionsWhere.groupId = { in: groups }
      }

      if (paymentMethods?.length) {
        contributionsWhere.paymentMethod = { in: paymentMethods }
      }

      const contributions = await prisma.contribution.findMany({
        where: contributionsWhere,
        include: {
          group: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })

      results.push(...contributions.map(contrib => ({
        id: contrib.id,
        type: 'contribution',
        title: `Contribution - ${contrib.group.name}`,
        description: `${contrib.paymentMethod} ${contrib.transactionRef ? `(${contrib.transactionRef})` : ''}`,
        amount: Number(contrib.amount),
        status: contrib.status,
        date: contrib.createdAt.toISOString(),
        group: contrib.group.name,
        url: `/contributions`,
        metadata: {
          paymentMethod: contrib.paymentMethod,
          transactionRef: contrib.transactionRef,
          month: contrib.month,
          year: contrib.year
        }
      })))
    }

    // Search Loans
    if (type === 'all' || type === 'loans') {
      const loansWhere: any = {
        userId: userId,
        createdAt: { gte: dateFilter }
      }

      if (query) {
        loansWhere.OR = [
          { purpose: { contains: query, mode: 'insensitive' } }
        ]
      }

      if (status) {
        loansWhere.status = status
      }

      if (minAmount || maxAmount) {
        loansWhere.amountRequested = {}
        if (minAmount) loansWhere.amountRequested.gte = Number(minAmount)
        if (maxAmount) loansWhere.amountRequested.lte = Number(maxAmount)
      }

      if (groups?.length) {
        loansWhere.groupId = { in: groups }
      }

      const loans = await prisma.loan.findMany({
        where: loansWhere,
        include: {
          group: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })

      results.push(...loans.map(loan => ({
        id: loan.id,
        type: 'loan',
        title: `Loan - ${loan.group.name}`,
        description: `Loan of MWK ${Number(loan.amountApproved || loan.amountRequested).toLocaleString()}`,
        amount: Number(loan.amountApproved || loan.amountRequested),
        status: loan.status,
        date: loan.createdAt.toISOString(),
        group: loan.group.name,
        url: `/loans`,
        metadata: {
          amountRequested: Number(loan.amountRequested),
          amountApproved: loan.amountApproved ? Number(loan.amountApproved) : null,
          repaymentPeriodMonths: loan.repaymentPeriodMonths,
          interestRate: loan.interestRate
        }
      })))
    }

    // Search Activities
    if (type === 'all' || type === 'activities') {
      const activitiesWhere: any = {
        userId: userId,
        createdAt: { gte: dateFilter }
      }

      if (query) {
        activitiesWhere.OR = [
          { actionType: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      }

      if (groups?.length) {
        activitiesWhere.groupId = { in: groups }
      }

      const activities = await prisma.activity.findMany({
        where: activitiesWhere,
        include: {
          group: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })

      results.push(...activities.map(activity => ({
        id: activity.id,
        type: 'activity',
        title: activity.actionType,
        description: activity.description,
        date: activity.createdAt.toISOString(),
        group: activity.group?.name,
        url: '/dashboard',
        metadata: activity.metadata
      })))
    }

    // Sort results by relevance (exact matches first, then by date)
    const sortedResults = results.sort((a, b) => {
      // If there's a query, prioritize exact matches in title
      if (query) {
        const aExact = a.title.toLowerCase().includes(query.toLowerCase())
        const bExact = b.title.toLowerCase().includes(query.toLowerCase())
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
      }

      // Then sort by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    return NextResponse.json({
      results: sortedResults,
      total: sortedResults.length
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
