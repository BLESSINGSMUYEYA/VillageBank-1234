'use client'

import dynamic from 'next/dynamic'
import { InlineLogoLoader } from '@/components/ui/LogoLoader'

const ContributionChart = dynamic(() => import('@/components/charts/ContributionChart').then(mod => mod.ContributionChart), { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center bg-white/5 rounded-2xl animate-pulse"><InlineLogoLoader size="sm" /></div> })

interface DashboardChartsClientProps {
    chartData: any
}

export function DashboardChartsClient({ chartData }: DashboardChartsClientProps) {
    return (
        <div className="space-y-4 sm:space-y-6">
            <ContributionChart
                data={chartData.monthlyData}
                title="Monthly Contribution History"
                description="Your contribution patterns over the last 12 months"
            />
        </div>
    )
}
