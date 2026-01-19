'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { fadeIn, itemFadeIn, staggerContainer } from '@/lib/motions'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatsCard } from '@/components/ui/stats-card'
import { TrendingUp, Wallet, Award, Calendar } from 'lucide-react'

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
  '#3b82f6', // Blue 500
  '#10b981', // Emerald 500
  '#8b5cf6', // Violet 500
  '#f59e0b', // Amber 500
  '#ec4899', // Pink 500
  '#6366f1', // Indigo 500
  '#14b8a6', // Teal 500
]

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

interface ChartBaseProps {
  title?: string
  description?: string
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

interface ContributionChartProps extends ChartBaseProps {
  data: ContributionData[]
}

const ANALYTICS_COLORS = ['#D8F3DC', '#95D5B2', '#74C69D', '#52B788', '#40916C', '#2D6A4F', '#1B4332']

export function ContributionChart({ data, title = "Project Analytics", description = "" }: ContributionChartProps) {
  return (
    <motion.div variants={fadeIn} className="h-full bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-sm font-bold text-[#1B4332] tracking-tight">{title}</h3>
          <div className="bg-[#F8FAFC] px-2 py-1 rounded-md border border-slate-100 flex items-center gap-1">
            <span className="text-[10px] font-bold text-emerald-500">74%</span>
            <TrendingUp className="w-3 h-3 text-emerald-500" />
          </div>
        </div>
        <div className="flex-1 w-full min-h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar
                dataKey="amount"
                radius={[50, 50, 50, 50]}
                animationDuration={1500}
                animationEasing="ease-out"
                barSize={24}
              >
                {data.map((entry, index) => (
                  <Cell key={`contribution-cell-${entry.month}-${index}`} fill={ANALYTICS_COLORS[index % ANALYTICS_COLORS.length]} />
                ))}
              </Bar>
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                fontFamily="inherit"
                fontWeight={600}
                dy={10}
                tickFormatter={(val) => val.charAt(0)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}

interface GroupComparisonChartProps extends ChartBaseProps {
  data: GroupData[]
}

export function GroupComparisonChart({ data, title = "Group Performance", description = "Compare contributions and loans across groups" }: GroupComparisonChartProps) {
  return (
    <motion.div variants={fadeIn} className="h-full">
      <div className="flex flex-col h-full">
        <div className="mb-4 pl-1">
          <h3 className="text-lg font-black text-foreground tracking-tight">{title}</h3>
          <p className="text-xs font-medium text-muted-foreground">{description}</p>
        </div>
        <div className="flex-1 w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME_COLORS.grid} />
              <XAxis
                dataKey="name"
                stroke={THEME_COLORS.text}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                fontFamily="inherit"
                fontWeight={700}
                dy={10}
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value, 'MWK', true)}
                stroke={THEME_COLORS.text}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                fontFamily="inherit"
                fontWeight={700}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="contributions" fill={THEME_COLORS.primary} name="Contributions" radius={[4, 4, 0, 0]} animationDuration={1000} />
              <Bar dataKey="loans" fill={THEME_COLORS.warning} name="Loans" radius={[4, 4, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}

interface TrendChartProps extends ChartBaseProps {
  data: ContributionData[]
}

export function TrendChart({ data, title = "Contribution Trend", description = "Track your contribution patterns over time" }: TrendChartProps) {
  return (
    <motion.div variants={fadeIn} className="h-full">
      <div className="flex flex-col h-full">
        <div className="mb-4 pl-1">
          <h3 className="text-lg font-black text-foreground tracking-tight">{title}</h3>
          <p className="text-xs font-medium text-muted-foreground">{description}</p>
        </div>
        <div className="flex-1 w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME_COLORS.grid} />
              <XAxis
                dataKey="month"
                stroke={THEME_COLORS.text}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                fontFamily="inherit"
                fontWeight={700}
                dy={10}
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value, 'MWK', true)}
                stroke={THEME_COLORS.text}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                fontFamily="inherit"
                fontWeight={700}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke={THEME_COLORS.secondary}
                strokeWidth={4}
                dot={{ fill: THEME_COLORS.secondary, r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 0, fill: THEME_COLORS.secondary }}
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}

interface PaymentMethodsChartProps extends ChartBaseProps {
  data: PaymentMethodData[]
}

export function PaymentMethodsChart({ data, title = "Payment Methods", description = "Distribution of payment methods used" }: PaymentMethodsChartProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 pl-1">
        <h3 className="text-lg font-black text-foreground tracking-tight">{title}</h3>
        <p className="text-xs font-medium text-muted-foreground">{description}</p>
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={false}
              outerRadius={100}
              innerRadius={60}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
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
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      <StatsCard
        index={0}
        variant="glass"
        icon={Wallet}
        label="Total Contributions"
        value={formatCurrency(totalContributions)}
        description="Lifetime accumulation"
        className="bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/10"
      />
      <StatsCard
        index={1}
        variant="glass"
        icon={TrendingUp}
        label="Monthly Average"
        value={formatCurrency(averageMonthly)}
        description="Consistent growth"
        className="bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/10"
      />
      <StatsCard
        index={2}
        variant="glass"
        icon={Award}
        label="Best Month"
        value={formatCurrency(highestMonth)}
        description="Personal record"
        className="bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/10"
      />
      <StatsCard
        index={3}
        variant="featured"
        icon={Calendar}
        label="Active Streak"
        value={currentStreak.toString()}
        description="Months in a row"
        className="bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20"
      />
    </motion.div>
  )
}
