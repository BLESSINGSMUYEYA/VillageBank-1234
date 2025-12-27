import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ContributionsClient } from '@/components/contributions/ContributionsClient'

export default async function ContributionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; groupId?: string; month?: string; year?: string; search?: string }>
}) {
  const session = await getSession()
  const userId = session?.userId
  const params = await searchParams

  if (!userId) {
    return <div className="p-8 text-center text-h3">Please sign in to access contributions.</div>
  }

  // Build prisma query
  const whereClause: any = {
    userId: userId as string,
  }

  if (params.status && params.status !== 'all') {
    whereClause.status = params.status
  }

  if (params.groupId && params.groupId !== 'all') {
    whereClause.groupId = params.groupId
  }

  if (params.month && params.year && params.month !== 'all') {
    const monthYearParts = params.month.split('-')
    if (monthYearParts.length === 2) {
      whereClause.month = parseInt(monthYearParts[0])
      whereClause.year = parseInt(monthYearParts[1])
    }
  }

  const contributions = await prisma.contribution.findMany({
    where: whereClause,
    include: {
      group: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Get user's active groups
  const userGroups = await prisma.groupMember.findMany({
    where: {
      userId: userId as string,
      status: 'ACTIVE',
    },
    include: {
      group: true,
    },
  })

  // Basic filtering for search term if applicable
  let filteredContributions = contributions
  if (params.search) {
    const searchTerm = params.search.toLowerCase()
    filteredContributions = contributions.filter(contribution =>
      contribution.group.name.toLowerCase().includes(searchTerm) ||
      contribution.group.region.toLowerCase().includes(searchTerm)
    )
  }

  return (
    <ContributionsClient
      contributions={filteredContributions}
      userGroups={userGroups}
      params={params}
    />
  )
}
