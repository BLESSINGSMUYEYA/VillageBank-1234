
import { getDashboardStats, getPendingApprovals, getRecentActivity } from '@/lib/dashboard-service'
import { DashboardHero } from '../DashboardHero'

export async function DashboardHeroLoader({ user }: { user: any }) {
    // Fetch data specifically for the Hero section
    // Note: getRecentActivity is fetched here just for the count. 
    // Ideally update service to support count-only for perf, but parallel execution is fine.
    const [stats, pendingApprovals, recentActivity] = await Promise.all([
        getDashboardStats(),
        getPendingApprovals(),
        getRecentActivity()
    ])

    return (
        <DashboardHero
            user={user}
            stats={stats}
            pendingApprovalsCount={pendingApprovals.contributions.length + pendingApprovals.loans.length}
            recentActivityCount={recentActivity.length}
        />
    )
}
