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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

interface ContributionChartProps {
  data: ContributionData[]
  title?: string
  description?: string
}

export function ContributionChart({ data, title = "Monthly Contributions", description = "Your contribution history over time" }: ContributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip 
              formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Amount']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Bar dataKey="amount" fill="#8884d8" />
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip 
              formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Amount']}
              labelFormatter={(label) => `Group: ${label}`}
            />
            <Bar dataKey="contributions" fill="#82ca9d" name="Contributions" />
            <Bar dataKey="loans" fill="#ffc658" name="Loans" />
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip 
              formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Amount']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.percent}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Amount']} />
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="text-2xl font-bold">{formatCurrency(totalContributions)}</div>
          <p className="text-xs text-muted-foreground">Total Contributions</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="text-2xl font-bold">{formatCurrency(averageMonthly)}</div>
          <p className="text-xs text-muted-foreground">Average Monthly</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="text-2xl font-bold">{formatCurrency(highestMonth)}</div>
          <p className="text-xs text-muted-foreground">Highest Month</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="text-2xl font-bold">{currentStreak}</div>
          <p className="text-xs text-muted-foreground">Current Streak</p>
        </CardContent>
      </Card>
    </div>
  )
}
