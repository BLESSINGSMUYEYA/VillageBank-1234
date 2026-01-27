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

const growthData = [
    { name: 'Jan', users: 400, volume: 2400 },
    { name: 'Feb', users: 600, volume: 3200 },
    { name: 'Mar', users: 900, volume: 5100 },
    { name: 'Apr', users: 1200, volume: 7800 },
    { name: 'May', users: 1500, volume: 9500 },
    { name: 'Jun', users: 2100, volume: 13000 },
]

const regionData = [
    { name: 'Northern', value: 30, color: '#3b82f6' },
    { name: 'Central', value: 45, color: '#8b5cf6' },
    { name: 'Southern', value: 25, color: '#10b981' },
]

export function GrowthChart() {
    return (
        <AdminGlassCard title="Platform Growth" description="User acquisition and transaction volume trends">
            <div className="h-[300px] w-full p-4 md:p-6">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData}>
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
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
        </AdminGlassCard>
    )
}

export function RegionDistributionChart() {
    return (
        <AdminGlassCard title="Regional Distribution" description="Active user base by region">
            <div className="p-4 md:p-6 flex flex-col h-full">
                <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={regionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {regionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    borderRadius: '12px',
                                    border: 'none'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center flex-wrap gap-4 mt-4">
                    {regionData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </AdminGlassCard>
    )
}
