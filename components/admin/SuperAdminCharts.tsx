"use client"

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AdminGlassCard } from './AdminGlassCard'



const regionData = [
    { name: 'Northern', value: 30, color: '#3b82f6' },
    { name: 'Central', value: 45, color: '#8b5cf6' },
    { name: 'Southern', value: 25, color: '#10b981' },
]

interface GrowthData {
    name: string
    users: number
    volume: number
}

interface GrowthChartProps {
    data?: GrowthData[]
}

export function GrowthChart({ data }: GrowthChartProps) {
    if (!data) return null

    return (
        <AdminGlassCard title="Platform Growth" description="User acquisition and transaction volume trends">
            <div className="overflow-x-auto scrollbar-hide scroll-smooth pb-2 -mx-4 md:mx-0">
                <div className="h-[280px] md:h-[320px] w-full px-4 py-4 md:p-6 text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                                tickMargin={10}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    fontSize: '12px'
                                }}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <Area
                                type="monotone"
                                dataKey="users"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorUsers)"
                            />
                            <Area
                                type="monotone"
                                dataKey="volume"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorVolume)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </AdminGlassCard>
    )
}

interface RegionalSummary {
    region: string
    users: number
    groups: number
    contributions: number
    loans: number
    admin: string
}

interface RegionDistributionChartProps {
    data?: RegionalSummary[]
}

const REGION_COLORS: Record<string, string> = {
    'Northern': '#3b82f6',
    'Central': '#8b5cf6',
    'Southern': '#10b981',
}

export function RegionDistributionChart({ data }: RegionDistributionChartProps) {
    // Transform data for chart or use defaults if empty
    const chartData = data?.map(item => ({
        name: item.region,
        value: item.users,
        color: REGION_COLORS[item.region] || '#cbd5e1'
    })) || [
            { name: 'No Data', value: 1, color: '#e2e8f0' }
        ]

    const totalUsers = data?.reduce((sum, item) => sum + item.users, 0) || 0

    return (
        <AdminGlassCard title="Regional Distribution" description="Active user base by region">
            <div className="flex flex-col h-full min-h-[350px]">
                {/* Donut Chart Container */}
                <div className="flex-1 min-h-[220px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius="60%"
                                outerRadius="80%"
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}
                                itemStyle={{ color: '#1e293b' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Centered Total Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                            {totalUsers.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                            Total Users
                        </span>
                    </div>
                </div>

                {/* Responsive Custom Legend */}
                <div className="mt-4 px-4 pb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {data?.map((item) => {
                            const percentage = totalUsers > 0 ? Math.round((item.users / totalUsers) * 100) : 0
                            return (
                                <div key={item.region} className="flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-center p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2 mb-0 sm:mb-1">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: REGION_COLORS[item.region] || '#cbd5e1' }} />
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            {item.region}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                                            {item.users.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] font-medium text-muted-foreground inline-block">
                                            ({percentage}%)
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </AdminGlassCard>
    )
}
