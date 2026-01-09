
import { FinancialOverview } from '../FinancialOverview'
import DashboardCharts from '@/app/(authenticated)/dashboard/DashboardCharts'
import { Suspense } from 'react'

export async function FinancialOverviewLoader() {
    // Note: DashboardCharts is likely a Client Component or handles its own fetching?
    // Wait, typically DashboardCharts is a Client Component taking data, OR it does fetching.
    // Based on previous code, page.tsx passed `charts={<Suspense><DashboardCharts/></Suspense>}`.
    // This implies `DashboardCharts` is the async data fetcher or contains it.
    // If FinancialOverview wraps it, we just return:

    return (
        <FinancialOverview
            charts={
                <Suspense fallback={<div className="h-full w-full animate-pulse bg-white/5 rounded-2xl" />}>
                    <DashboardCharts />
                </Suspense>
            }
        />
    )
}
