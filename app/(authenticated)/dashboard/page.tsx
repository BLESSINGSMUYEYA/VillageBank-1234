import { Suspense } from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { getDashboardStats, getRecentActivity, getPendingApprovals } from '@/lib/dashboard-service'
import { redirect } from 'next/navigation'
import DashboardCharts from './DashboardCharts'
import ChartsSkeleton from './ChartsSkeleton'
import { DashboardContent } from './DashboardContent'

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
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
