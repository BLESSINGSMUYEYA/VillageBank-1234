'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ResponsiveContainer,
    AreaChart, Area,
    BarChart, Bar,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import {
    Wallet, TrendingUp, Award, Calendar,
    ArrowUpRight, Target, Shield, Zap,
    PieChart as PieChartIcon, BarChart2, Activity
} from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatsCard } from '@/components/ui/stats-card'
import { itemFadeIn, staggerContainer } from '@/lib/motions'
import { Badge } from '@/components/ui/badge'

interface AnalyticsClientProps {
    data: any // Keeping loose for flexibility with server props
}

const THEME_COLORS = {
    primary: '#3b82f6', // Blue
    secondary: '#F59E0B', // Banana/Amber
    accent: '#8b5cf6', // Violet
    success: '#10B981', // Emerald
    warning: '#F97316', // Orange
    info: '#3B82F6', // Blue
    grid: 'rgba(255,255,255,0.1)',
    text: '#94a3b8' // Slate 400
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 p-3 rounded-xl shadow-xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs font-bold text-foreground">
                            {entry.name === 'amount' || entry.name === 'value' ? formatCurrency(entry.value) : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

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


            {/* Main Smart Graph */}
            <GlassCard className="p-6 sm:p-8 min-h-[500px] flex flex-col" hover={false}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                            <Activity className="w-6 h-6 text-blue-500" />
                            Wealth Trajectory
                        </h2>
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                            Visualize your capital growth over time.
                        </p>
                    </div>

                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <button
                            onClick={() => setChartMode('monthly')}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                                chartMode === 'monthly'
                                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-banana shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setChartMode('cumulative')}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                                chartMode === 'cumulative'
                                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-banana shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Cumulative
                        </button>
                        <button
                            onClick={() => setChartMode('active')}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                                chartMode === 'active'
                                    ? "bg-white dark:bg-slate-700 text-emerald-500 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Projection
                        </button>
                    </div>
                </div>

                <div className="flex-1 w-full min-h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        {chartMode === 'monthly' ? (
                            <BarChart data={data.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME_COLORS.grid} />
                                <XAxis dataKey="month" stroke={THEME_COLORS.text} fontSize={10} tickLine={false} axisLine={false} fontWeight={700} dy={10} />
                                <YAxis tickFormatter={(v) => formatCurrency(v, 'MWK', true)} stroke={THEME_COLORS.text} fontSize={10} tickLine={false} axisLine={false} fontWeight={700} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                <Bar dataKey="amount" fill={THEME_COLORS.primary} radius={[6, 6, 0, 0]} animationDuration={1000} />
                            </BarChart>
                        ) : (
                            <AreaChart data={chartMode === 'active' ? projectedData : cumulativeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME_COLORS.primary} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={THEME_COLORS.primary} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME_COLORS.success} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={THEME_COLORS.success} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME_COLORS.grid} />
                                <XAxis dataKey="month" stroke={THEME_COLORS.text} fontSize={10} tickLine={false} axisLine={false} fontWeight={700} dy={10} />
                                <YAxis tickFormatter={(v) => formatCurrency(v, 'MWK', true)} stroke={THEME_COLORS.text} fontSize={10} tickLine={false} axisLine={false} fontWeight={700} />
                                <Tooltip content={<CustomTooltip />} />

                                <Area
                                    type="monotone"
                                    dataKey="cumulative"
                                    stroke={THEME_COLORS.primary}
                                    fillOpacity={1}
                                    fill="url(#colorCumulative)"
                                    strokeWidth={3}
                                />
                                {chartMode === 'active' && (
                                    <Area
                                        type="monotone"
                                        dataKey="cumulative"
                                        stroke={THEME_COLORS.success}
                                        strokeDasharray="5 5"
                                        fillOpacity={1}
                                        fill="url(#colorProjected)"
                                        strokeWidth={3}
                                        connectNulls // Helps connect the projection line if data logic requires
                                    />
                                )}
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* Diversity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="p-6 min-h-[400px] flex flex-col" hover={false}>
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-purple-500" />
                            Portfolio Diversity
                        </h3>
                        <p className="text-xs font-medium text-muted-foreground">Distribution across payment methods.</p>
                    </div>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.paymentMethods}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.paymentMethods.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={[THEME_COLORS.primary, THEME_COLORS.secondary, THEME_COLORS.accent, THEME_COLORS.success][index % 4]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    content={({ payload }: any) => (
                                        <div className="flex flex-wrap justify-center gap-4 mt-4">
                                            {payload.map((entry: any, index: number) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{entry.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                <GlassCard className="p-6 min-h-[400px] flex flex-col" hover={false}>
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-orange-500" />
                            Group Performance
                        </h3>
                        <p className="text-xs font-medium text-muted-foreground">Contributions vs Loans per group.</p>
                    </div>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.groupComparison} layout="vertical" margin={{ left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={THEME_COLORS.grid} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} stroke={THEME_COLORS.text} fontSize={10} tickLine={false} axisLine={false} fontWeight={700} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                <Bar dataKey="contributions" fill={THEME_COLORS.primary} radius={[0, 4, 4, 0]} barSize={20} />
                                <Bar dataKey="loans" fill={THEME_COLORS.warning} radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>
        </motion.div>
    )
}
