'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { 
  ContributionChart, 
  GroupComparisonChart, 
  TrendChart, 
  PaymentMethodsChart, 
  SummaryStats 
} from '@/components/charts/ContributionChart'

interface DashboardStats {
  totalGroups: number
  totalContributions: number
  totalLoans: number
  pendingLoans: number
  monthlyContribution: number
  loanRepaymentProgress: number
}

interface RecentActivity {
  id: string
  type: string
  description: string
  amount?: number
  createdAt: string
  groupName: string
}

export default function DashboardPage() {
  const { isSignedIn, isLoaded, user } = useUser()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isSignedIn && user) {
      fetchDashboardData()
    }
  }, [isSignedIn, user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/dashboard/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch recent activity
      const activityResponse = await fetch('/api/dashboard/activity')
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setRecentActivity(activityData.activities || [])
      }

      // Fetch chart data
      const chartsResponse = await fetch('/api/dashboard/charts')
      if (chartsResponse.ok) {
        const chartsData = await chartsResponse.json()
        setChartData(chartsData)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <div>Please sign in to view your dashboard.</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Welcome back, {user?.firstName}! Here's your village banking overview.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Groups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.totalGroups}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Active groups you're a member of
              </p>
              <p className="text-xs text-muted-foreground sm:hidden">
                Active groups
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Contributions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.totalContributions)}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                All-time contributions
              </p>
              <p className="text-xs text-muted-foreground sm:hidden">
                All-time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Active Loans</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.totalLoans}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingLoans > 0 && (
                  <span className="hidden sm:inline">{stats.pendingLoans} pending approval</span>
                )}
                {stats.pendingLoans > 0 && (
                  <span className="sm:hidden">{stats.pendingLoans} pending</span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Monthly Contribution</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.monthlyContribution)}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                This month's contribution
              </p>
              <p className="text-xs text-muted-foreground sm:hidden">
                This month
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
              <CardDescription className="text-sm">Your latest village banking activities</CardDescription>
            </div>
            <Link href="/groups">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Eye className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">View All</span>
                <span className="sm:hidden">All</span>
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      activity.type.includes('LOAN') ? 'bg-blue-500' :
                      activity.type.includes('CONTRIBUTION') ? 'bg-green-500' :
                      'bg-gray-500'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{activity.description}</p>
                      <p className="text-xs text-gray-500 truncate">{activity.groupName}</p>
                    </div>
                  </div>
                  <div className="text-right sm:text-left">
                    {activity.amount && (
                      <p className="font-medium text-sm">{formatCurrency(activity.amount)}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 px-4">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h3>
              <p className="text-gray-500 mb-4 text-sm sm:text-base">
                Start by joining a group or making a contribution.
              </p>
              <Link href="/groups/new">
                <Button className="w-full sm:w-auto">
                  <Users className="w-4 h-4 mr-2" />
                  Join or Create Group
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Section */}
      {chartData && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics & Insights</h2>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">View Reports</span>
              <span className="sm:hidden">Reports</span>
            </Button>
          </div>

          {/* Summary Stats */}
          <SummaryStats 
            totalContributions={chartData.summaryStats.totalContributions}
            averageMonthly={chartData.summaryStats.averageMonthly}
            highestMonth={chartData.summaryStats.highestMonth}
            currentStreak={chartData.summaryStats.currentStreak}
          />

          {/* Charts Grid */}
          <Tabs defaultValue="contributions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
              <TabsTrigger value="contributions" className="text-xs sm:text-sm">Contributions</TabsTrigger>
              <TabsTrigger value="groups" className="text-xs sm:text-sm">Groups</TabsTrigger>
              <TabsTrigger value="trends" className="text-xs sm:text-sm">Trends</TabsTrigger>
              <TabsTrigger value="payments" className="text-xs sm:text-sm">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="contributions" className="space-y-4">
              <ContributionChart 
                data={chartData.monthlyData}
                title="Monthly Contribution History"
                description="Your contribution patterns over the last 12 months"
              />
            </TabsContent>

            <TabsContent value="groups" className="space-y-4">
              <GroupComparisonChart 
                data={chartData.groupComparison}
                title="Group Performance Comparison"
                description="Compare contributions and loans across your groups"
              />
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <TrendChart 
                data={chartData.monthlyData}
                title="Contribution Trends"
                description="Visualize your contribution patterns over time"
              />
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <PaymentMethodsChart 
                data={chartData.paymentMethods}
                title="Payment Methods Distribution"
                description="Breakdown of payment methods you've used"
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/contributions/new">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Make Contribution</CardTitle>
              <CardDescription className="text-sm">
                Record your monthly contribution to any of your groups
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/loans/new">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Apply for Loan</CardTitle>
              <CardDescription className="text-sm">
                Request a loan from any of your active groups
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer sm:col-span-2 lg:col-span-1">
          <Link href="/groups">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Manage Groups</CardTitle>
              <CardDescription className="text-sm">
                View and manage your village banking groups
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  )
}