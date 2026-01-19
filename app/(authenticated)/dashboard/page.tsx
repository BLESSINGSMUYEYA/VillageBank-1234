import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import {
  getDashboardStats,
  getRecentActivity,
  getPendingApprovals
} from '@/lib/dashboard-service'
import { getUpcomingReminders } from '@/lib/reminders'

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
  const [stats, recentActivity, pendingApprovals, remindersResult] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
    getPendingApprovals(),
    getUpcomingReminders(user.id)
  ])

  const reminders = remindersResult.success ? remindersResult.data : []

  return (
    <div className="space-y-12">
      <DashboardBannerCarousel />

      <DashboardContent
        user={user}
        stats={stats}
        recentActivity={recentActivity}
        pendingApprovals={pendingApprovals}
        reminders={reminders}
      />
    </div>
  )
}
