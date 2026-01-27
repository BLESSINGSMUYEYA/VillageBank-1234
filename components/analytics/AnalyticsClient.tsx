'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { InlineLogoLoader } from '@/components/ui/LogoLoader'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatsCard } from '@/components/ui/stats-card'
import { ChartData } from '@/lib/dashboard-service'
import { formatCurrency } from '@/lib/utils'
import { staggerContainer } from '@/lib/motions'
import { Target, TrendingUp, Shield, Construction } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'

interface AnalyticsClientProps {
    data: ChartData
}

const AnalyticsCharts = dynamic(() => import('./AnalyticsCharts').then(mod => mod.AnalyticsCharts), {
    ssr: false,
    loading: () => (
        <GlassCard className="p-8 min-h-[500px] flex items-center justify-center" hover={false}>
            <div className="flex flex-col items-center gap-4">
                <InlineLogoLoader size="lg" />
                <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading Analytics Engine...</p>
            </div>
        </GlassCard>
    )
})



export function AnalyticsClient({ data }: AnalyticsClientProps) {
    const [chartMode, setChartMode] = useState<'monthly' | 'cumulative' | 'active'>('monthly')

    // Prepare data for "Smart Graphs"
    // 1. Cumulative Data
    const cumulativeData = useMemo(() => {
        let runningTotal = 0
        return data.monthlyData.map((d: any) => {
            runningTotal += d.amount
            return { ...d, cumulative: runningTotal }
        })
    }, [data.monthlyData])

    // 2. Projection (Next 6 months based on average)
    const projectedData = useMemo(() => {
        const lastMonth = cumulativeData[cumulativeData.length - 1]
        const lastTotal = lastMonth?.cumulative || 0
        const avgMonthly = data.summaryStats.averageMonthly || 0

        const projections = []
        for (let i = 1; i <= 6; i++) {
            const nextTotal = lastTotal + (avgMonthly * i)
            const date = new Date()
            date.setMonth(date.getMonth() + i)
            projections.push({
                month: date.toLocaleDateString('en-US', { month: 'short' }) + ' (Est)',
                cumulative: nextTotal,
                isProjection: true
            })
        }
        return [...cumulativeData, ...projections]
    }, [cumulativeData, data.summaryStats.averageMonthly])

    return (
        <PageContainer>
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-6 sm:space-y-10"
            >
                <PageHeader
                    title={
                        <>
                            Growth & <span className="text-gradient-primary">Analysis</span>
                        </>
                    }
                    description="Deep dive into your financial performance, future projections, and community impact."
                    badge="Wealth Intelligence"
                    backHref="/dashboard"
                    backLabel="Back to Dashboard"
                />

                <div className="py-20">
                    <EmptyState
                        icon={Construction}
                        title="Analytics Engine Upgrading"
                        description="We are currently enhancing our analytics engine to bring you deeper insights and AI-powered projections. Check back soon!"
                    />
                </div>
            </motion.div>
        </PageContainer >
    )
}
