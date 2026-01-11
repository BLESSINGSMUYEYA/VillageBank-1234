'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { InlineLogoLoader } from '@/components/ui/LogoLoader'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatsCard } from '@/components/ui/stats-card'
import { Badge } from '@/components/ui/badge'
import { ChartData } from '@/lib/dashboard-service'
import { formatCurrency } from '@/lib/utils'
import { staggerContainer } from '@/lib/motions'
import { Target, TrendingUp, Shield } from 'lucide-react'

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
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 sm:space-y-10"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Badge variant="outline" className="mb-3 border-blue-500/20 text-blue-600 dark:text-banana bg-blue-500/5 uppercase tracking-widest text-[10px] h-6 px-3">
                        Wealth Intelligence
                    </Badge>
                    <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight mb-2">
                        Growth & <span className="text-blue-600 dark:text-banana">Analysis</span>
                    </h1>
                    <p className="text-base font-medium text-muted-foreground max-w-lg leading-relaxed">
                        Deep dive into your financial performance, future projections, and community impact.
                    </p>
                </div>
            </div>

            {/* Smart Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                    index={0}
                    variant="glass"
                    icon={Target}
                    label="Net Wealth Accumulated"
                    value={formatCurrency(data.summaryStats.totalContributions)}
                    description="Total contributions across all groups"
                    className="bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/10"
                />
                <StatsCard
                    index={1}
                    variant="glass"
                    icon={TrendingUp}
                    label="Projected Annual"
                    value={formatCurrency(data.summaryStats.averageMonthly * 12)}
                    description="Based on current monthly average"
                    className="bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/10"
                />
                <StatsCard
                    index={2}
                    variant="glass"
                    icon={Shield}
                    label="Safety Score"
                    value="98/100" // Placeholder implementation
                    description="High consistency & zero defaults"
                    className="bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/10"
                />
            </div>

            {/* Main Smart Graph & Diversity Grid */}
            <AnalyticsCharts
                data={data}
                chartMode={chartMode}
                setChartMode={setChartMode}
                projectedData={projectedData}
                cumulativeData={cumulativeData}
            />
        </motion.div>
    )
}
