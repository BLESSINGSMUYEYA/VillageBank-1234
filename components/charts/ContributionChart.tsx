'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface ContributionData {
  month: string
  amount: number
  count: number
}

interface GroupData {
  name: string
  contributions: number
  loans: number
}

interface PaymentMethodData {
  method: string
  value: number
  percentage: number
  [key: string]: any
}

const COLORS = [
  '#1e3a8a', // Navy Blue
  '#3b82f6', // Royal Blue
  '#60a5fa', // Light Blue
  '#2563eb', // Bright Blue
  '#9333ea', // Purple
  '#16a34a', // Green
  '#ea580c', // Orange
]

const THEME_COLORS = {
  primary: '#1e3a8a', // Executive Navy
  secondary: '#F59E0B', // Banana Gold (Amber-500)
  accent: '#FCD34D', // Banana Light (Amber-300)
  success: '#10B981', // Emerald
  warning: '#F97316', // Orange
  info: '#3B82F6' // Blue
}

interface ContributionChartProps {
  data: ContributionData[]
  title?: string
  description?: string
}

export function ContributionChart({ data, title = "Monthly Contributions", description = "Your contribution history over time" }: ContributionChartProps) {
  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-xl font-black text-blue-900 dark:text-blue-100">{title}</CardTitle>
        <CardDescription className="text-muted-foreground font-medium">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.2} />
            <XAxis dataKey="month" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(value) => formatCurrency(value)} stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'var(--muted)' }}
              contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
              itemStyle={{ color: 'var(--foreground)' }}
              formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Amount']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Bar dataKey="amount" fill={THEME_COLORS.primary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface GroupComparisonChartProps {
  data: GroupData[]
  title?: string
  description?: string
}

export function GroupComparisonChart({ data, title = "Group Performance", description = "Compare contributions and loans across groups" }: GroupComparisonChartProps) {
  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-xl font-black text-blue-900 dark:text-blue-100">{title}</CardTitle>
        <CardDescription className="text-muted-foreground font-medium">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.2} />
            <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(value) => formatCurrency(value)} stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'var(--muted)' }}
              contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
              itemStyle={{ color: 'var(--foreground)' }}
              formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Amount']}
              labelFormatter={(label) => `Group: ${label}`}
            />
            <Bar dataKey="contributions" fill={THEME_COLORS.primary} name="Contributions" radius={[4, 4, 0, 0]} />
            <Bar dataKey="loans" fill={THEME_COLORS.warning} name="Loans" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface TrendChartProps {
  data: ContributionData[]
  title?: string
  description?: string
}

export function TrendChart({ data, title = "Contribution Trend", description = "Track your contribution patterns over time" }: TrendChartProps) {
  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-xl font-black text-blue-900 dark:text-blue-100">{title}</CardTitle>
        <CardDescription className="text-muted-foreground font-medium">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.2} />
            <XAxis dataKey="month" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(value) => formatCurrency(value)} stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
              itemStyle={{ color: 'var(--foreground)' }}
              formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Amount']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Line type="monotone" dataKey="amount" stroke={THEME_COLORS.secondary} strokeWidth={3} dot={{ fill: THEME_COLORS.secondary, r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface PaymentMethodsChartProps {
  data: PaymentMethodData[]
  title?: string
  description?: string
}

export function PaymentMethodsChart({ data, title = "Payment Methods", description = "Distribution of payment methods used" }: PaymentMethodsChartProps) {
  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-xl font-black text-blue-900 dark:text-blue-100">{title}</CardTitle>
        <CardDescription className="text-muted-foreground font-medium">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}`}
              outerRadius={100}
              innerRadius={60}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
              itemStyle={{ color: 'var(--foreground)' }}
              formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Amount']}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface SummaryStatsProps {
  totalContributions: number
  averageMonthly: number
  highestMonth: number
  currentStreak: number
}

export function SummaryStats({ totalContributions, averageMonthly, highestMonth, currentStreak }: SummaryStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl">
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Total</p>
        <div className="text-lg font-black text-blue-900 dark:text-blue-100 truncate" title={formatCurrency(totalContributions)}>
          {formatCurrency(totalContributions)}
        </div>
      </div>
      <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl">
        <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1">Monthly Avg</p>
        <div className="text-lg font-black text-purple-900 dark:text-purple-100 truncate" title={formatCurrency(averageMonthly)}>
          {formatCurrency(averageMonthly)}
        </div>
      </div>
      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl">
        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Highest</p>
        <div className="text-lg font-black text-emerald-900 dark:text-emerald-100 truncate" title={formatCurrency(highestMonth)}>
          {formatCurrency(highestMonth)}
        </div>
      </div>
      <div className="p-4 bg-banana/10 rounded-2xl">
        <p className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-widest mb-1">Streak</p>
        <div className="text-lg font-black text-yellow-900 dark:text-yellow-100 truncate">
          {currentStreak} <span className="text-xs font-bold opacity-60">months</span>
        </div>
      </div>
    </div>
  )
}
