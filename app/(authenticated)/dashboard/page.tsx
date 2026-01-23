
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
  const [stats, recentActivity, pendingApprovals, remindersResult, announcements] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
    getPendingApprovals(),
    getUpcomingReminders(user.id),
    prisma.announcement.findMany({
      where: {
        type: 'BANNER',
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  ])

  const reminders = remindersResult.success ? remindersResult.data : []

  const flattenedApprovals = [
    ...(pendingApprovals?.contributions?.map((c: any) => ({ ...c, type: 'CONTRIBUTION' })) || []),
    ...(pendingApprovals?.loans || [])
  ]

  return (
    <div className="space-y-12">
      <DashboardBannerCarousel announcements={announcements} />

      <DashboardContent
        user={user}
        stats={stats}
        recentActivity={recentActivity}
        pendingApprovals={flattenedApprovals}
        reminders={reminders}
      />
    </div>
  )
}
