"use client"

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
    LabelList
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AdminGlassCard } from './AdminGlassCard' // Assuming this exists based on previous files
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Users, Eye, MousePointerClick, TrendingUp, Activity } from 'lucide-react'

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
                <div className="overflow-x-auto">
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
