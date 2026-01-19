import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import {
  getDashboardStats,
  getRecentActivity,
  getPendingApprovals
} from '@/lib/dashboard-service'

import { DashboardContent } from './DashboardContent'
import { DashboardBannerCarousel } from '@/components/dashboard/DashboardBannerCarousel'

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

  // Fetch data for DashboardContent
  const [stats, recentActivity, pendingApprovals] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
    getPendingApprovals()
  ])

  return (
    <div className="space-y-12">
      <DashboardBannerCarousel />

      <DashboardContent
        user={user}
        stats={stats}
        recentActivity={recentActivity}
        pendingApprovals={pendingApprovals}
      />
    </div>
  )
}
