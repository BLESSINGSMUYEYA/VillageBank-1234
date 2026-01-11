import { getChartData } from '@/lib/dashboard-service'
import { AnalyticsClient } from '@/components/analytics/AnalyticsClient'
import { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Financial Analytics | Village Bank',
    description: 'Detailed insights into your financial growth and performance.',
}

export default async function AnalyticsPage() {
    const chartData = await getChartData()

    return (
        <div className="container max-w-5xl mx-auto py-8 sm:py-12 px-4 space-y-8 pb-20">
            {/* Back Navigation */}
            <div>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 dark:hover:text-banana transition-all duration-300 group mb-6"
                >
                    <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                    Back to Dashboard
                </Link>
            </div>

            <AnalyticsClient data={chartData} />
        </div>
    )
}
