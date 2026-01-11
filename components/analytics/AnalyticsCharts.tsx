'use client'

import { useState } from 'react'
import {
    ResponsiveContainer,
    AreaChart, Area,
    BarChart, Bar,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import {
    Activity,
    PieChart as PieChartIcon, BarChart2
} from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/GlassCard'

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

interface AnalyticsChartsProps {
    data: any
    chartMode: 'monthly' | 'cumulative' | 'active'
    setChartMode: (mode: 'monthly' | 'cumulative' | 'active') => void
    projectedData: any[]
    cumulativeData: any[]
}

export function AnalyticsCharts({ data, chartMode, setChartMode, projectedData, cumulativeData }: AnalyticsChartsProps) {
    return (
        <div className="space-y-6 sm:space-y-10">
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
        </div>
    )
}
