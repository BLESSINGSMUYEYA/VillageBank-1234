import { Suspense } from 'react'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDashboardStats, getRecentActivity, getPendingApprovals } from '@/lib/dashboard-service'
import { redirect } from 'next/navigation'
import DashboardCharts from './DashboardCharts'
import ChartsSkeleton from './ChartsSkeleton'
import { DashboardContent } from './DashboardContent'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session || !session.userId) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string }
  })

  if (!user) {
    redirect('/login')
  }

  // Fetch critical data in parallel
  const [stats, recentActivity, pendingApprovals] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
    getPendingApprovals()
  ])

  return (
    <DashboardContent
      user={{
        firstName: user.firstName,
      }}
      stats={stats}
      recentActivity={recentActivity}
      pendingApprovals={pendingApprovals}
      charts={
        <Suspense fallback={<ChartsSkeleton />}>
          <DashboardCharts />
        </Suspense>
      }
    />
  )
}
