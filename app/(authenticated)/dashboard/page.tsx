
import { Suspense } from 'react'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { motion } from 'framer-motion' // Wait, Page is Server Component, cannot use motion directly on root div unless it's a client component.
// But DashboardContent was client.
// I should make a 'DashboardShell' client component for the layout animations?
// Or just use a standard div. The previous Page returned DashboardContent (Client).
// I will just use standard divs for the server page structure.
// The inner components (Hero, Feed) have their own animations.

import { DashboardHeroLoader } from '@/components/dashboard/server/DashboardHeroLoader'
import { ActivityFeedLoader } from '@/components/dashboard/server/ActivityFeedLoader'
import { FinancialOverviewLoader } from '@/components/dashboard/server/FinancialOverviewLoader'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { HeroSkeleton, ActivitySkeleton, ChartsSkeleton } from '@/components/dashboard/skeletons'

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

  return (
    <div className="space-y-6 sm:space-y-10 pb-10">
      <Suspense fallback={<HeroSkeleton />}>
        <DashboardHeroLoader user={user} />
      </Suspense>

      <div className="space-y-12 sm:space-y-16">
        <FinancialOverviewLoader />

        <Suspense fallback={<ActivitySkeleton />}>
          <ActivityFeedLoader />
        </Suspense>

        <QuickActions />
      </div>
    </div>
  )
}
