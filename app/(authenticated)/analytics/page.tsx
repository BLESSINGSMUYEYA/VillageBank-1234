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
        <AnalyticsClient data={chartData} />
    )
}
