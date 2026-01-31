"use client"

import { useState } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    FunnelChart,
    Funnel,
    LabelList,
    Area,
    AreaChart
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AdminGlassCard } from './AdminGlassCard' // Assuming this exists based on previous files
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Users, Eye, MousePointerClick, TrendingUp, Activity, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

// --- Viral Funnel Component ---
interface FunnelProps {
    data: {
        views: number
        conversions: number
        rate: string
    }
}

export function ViralFunnelChart({ data }: FunnelProps) {
    const chartData = [
        {
            name: 'Total Views',
            value: data.views,
            fill: '#8b5cf6',
            icon: Eye
        },
        {
            name: 'Join Requests',
            value: data.conversions,
            fill: '#10b981',
            icon: MousePointerClick
        }
    ]

    return (
        <AdminGlassCard title="Viral Acquisition Funnel" description={`Conversion Rate: ${data.rate}%`}>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} interval={0} />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                                <LabelList dataKey="value" position="right" fill="#64748b" fontWeight="bold" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-800/50 rounded-lg">
                                <Eye className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Views</p>
                                <p className="text-2xl font-black">{data.views.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute left-8 -top-4 bottom-0 w-0.5 border-l-2 border-dashed border-slate-200 dark:border-slate-700 h-8 -z-10" />
                        <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg">
                                    <MousePointerClick className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Conversions</p>
                                    <p className="text-2xl font-black">{data.conversions.toLocaleString()}</p>
                                </div>
                            </div>
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                                {data.rate}% Rate
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </AdminGlassCard>
    )
}

// --- Retention Pulse Component ---
interface RetentionProps {
    data: {
        activeUsers: number
        rate: string
    }
}

export function RetentionPulse({ data }: RetentionProps) {
    const rate = parseFloat(data.rate)
    const chartData = [
        { name: 'Active', value: rate, color: '#ec4899' }, // Pink
        { name: 'Inactive', value: 100 - rate, color: '#f1f5f9' }
    ]

    return (
        <AdminGlassCard title="Retention Pulse" description="7-Day Active User Rate">
            <div className="p-6 flex flex-col items-center justify-center h-full min-h-[300px]">
                <div className="relative w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Activity className="w-8 h-8 text-pink-500 mb-1" />
                        <span className="text-3xl font-black text-slate-900 dark:text-white">{data.rate}%</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Health</span>
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Weekly Active Users (WAU)</p>
                    <p className="text-2xl font-bold">{data.activeUsers.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-2 max-w-[200px]">
                        Users who performed at least one action in the last 7 days.
                    </p>
                </div>
            </div>
        </AdminGlassCard>
    )
}

// --- Growth Leaderboard Component ---
interface LeaderboardProps {
    data: {
        name: string
        region: string
        newMembers: number
    }[]
}

export function GrowthLeaderboard({ data }: LeaderboardProps) {
    return (
        <AdminGlassCard title="Growth Champions" description="Top groups by new member acquisition (30 days)">
            <div className="p-0">
                {/* Mobile View: Card List */}
                <div className="md:hidden space-y-3 p-4">
                    {data.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No significant growth recorded.
                        </div>
                    ) : (
                        data.map((group, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary/50 to-transparent opacity-50" />
                                <div className="w-8 h-8 flex items-center justify-center font-black text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                                    #{index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{group.name}</div>
                                    <div className="text-[10px] text-muted-foreground capitalize flex items-center gap-1.5 mt-0.5">
                                        <Badge variant="outline" className="text-[9px] h-4 px-1 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                            {group.region || 'Unknown'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        +{group.newMembers}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="text-left p-4 text-xs font-black uppercase text-muted-foreground tracking-wider pl-6">Rank</th>
                                <th className="text-left p-4 text-xs font-black uppercase text-muted-foreground tracking-wider">Group</th>
                                <th className="text-right p-4 text-xs font-black uppercase text-muted-foreground tracking-wider pr-6">New Members</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {data.map((group, index) => (
                                <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                                    <td className="p-4 pl-6 font-mono text-sm text-muted-foreground">#{index + 1}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900 dark:text-slate-100">{group.name}</div>
                                        <div className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                                            {group.region && (
                                                <Badge variant="secondary" className="text-[10px] h-4 px-1">{group.region}</Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 pr-6 text-right">
                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            +{group.newMembers}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-muted-foreground">
                                        No significant growth recorded in the last 30 days.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminGlassCard>
    )
}

// --- User Growth Trends Component ---
interface UserGrowthProps {
    data: {
        daily: { name: string; value: number }[]
        weekly: { name: string; value: number }[]
        monthly: { name: string; value: number }[]
    }
}

export function UserGrowthChart({ data }: UserGrowthProps) {
    const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily')

    const chartData = data[view]

    return (
        <AdminGlassCard
            title="User Growth Trends"
            description="New user registrations over time"
            action={
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button
                        onClick={() => setView('daily')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${view === 'daily' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                    >
                        Daily
                    </button>
                    <button
                        onClick={() => setView('weekly')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${view === 'weekly' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setView('monthly')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${view === 'monthly' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                    >
                        Monthly
                    </button>
                </div>
            }
        >
            <div className="overflow-x-auto pb-2">
                <div className="h-[300px] w-full min-w-[600px] p-4 md:p-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis
                                dataKey="name"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#94a3b8"
                            />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#94a3b8"
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorGrowth)"
                                name="New Users"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </AdminGlassCard>
    )
}

// --- Health Pulse Component ---
interface HealthProps {
    data: {
        name: string
        value: number
    }[]
}

export function HealthPulse({ data }: HealthProps) {
    return (
        <div className="h-full w-full flex flex-col justify-center space-y-6 px-2">
            {data.map((item, index) => (
                <div key={index} className="space-y-2">
                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2">
                            <Activity className={cn(
                                "w-4 h-4",
                                item.name === 'CPU' ? "text-rose-500" :
                                    item.name === 'Memory' ? "text-purple-500" : "text-blue-500"
                            )} />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.name}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-muted-foreground">{item.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-1000 ease-out",
                                item.name === 'CPU' ? "bg-rose-500" :
                                    item.name === 'Memory' ? "bg-purple-500" : "bg-blue-500"
                            )}
                            style={{ width: `${item.value}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}
