'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
    Users,
    DollarSign,
    TrendingUp,
    Calendar,
    Eye,
    BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { Suspense } from 'react'

interface DashboardContentProps {
    user: any
    stats: any
    recentActivity: any[]
    pendingApprovals: any[]
    charts: React.ReactNode
}

export function DashboardContent({
    user,
    stats,
    recentActivity,
    pendingApprovals,
    charts
}: DashboardContentProps) {
    const { t } = useLanguage()

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('common.dashboard')}</h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                    {t('dashboard.welcome')}, {user.firstName}! {t('dashboard.overview')}.
                </p>
            </div>

            {/* Treasurer Notification Banner */}
            {pendingApprovals.length > 0 && (
                <Alert className="bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-semibold text-blue-900">Pending Approvals</CardTitle>
                                <CardDescription className="text-blue-700 text-xs">
                                    There are {pendingApprovals.length} contributions waiting for your review.
                                </CardDescription>
                            </div>
                        </div>
                        <Link href="/treasurer/approvals">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-none">
                                Review Now
                            </Button>
                        </Link>
                    </div>
                </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">{t('dashboard.total_groups')}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg sm:text-2xl font-bold truncate">{stats.totalGroups}</div>
                        <p className="text-xs text-muted-foreground hidden sm:block">
                            {t('dashboard.active_groups_desc')}
                        </p>
                        <p className="text-xs text-muted-foreground sm:hidden">
                            {t('groups.members')}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">{t('dashboard.total_contributions')}</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg sm:text-2xl font-bold truncate" title={formatCurrency(stats.totalContributions)}>
                            {formatCurrency(stats.totalContributions)}
                        </div>
                        <p className="text-xs text-muted-foreground hidden sm:block">
                            {t('dashboard.all_time')}
                        </p>
                        <p className="text-xs text-muted-foreground sm:hidden">
                            {t('dashboard.all_time')}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">{t('dashboard.active_loans')}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg sm:text-2xl font-bold truncate">{stats.totalLoans}</div>
                        <p className="text-xs text-muted-foreground text-nowrap">
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
                        <CardTitle className="text-xs sm:text-sm font-medium">{t('dashboard.monthly_contribution')}</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg sm:text-2xl font-bold truncate" title={formatCurrency(stats.monthlyContribution)}>
                            {formatCurrency(stats.monthlyContribution)}
                        </div>
                        <p className="text-xs text-muted-foreground hidden sm:block">
                            {t('dashboard.this_month')}
                        </p>
                        <p className="text-xs text-muted-foreground sm:hidden">
                            {t('dashboard.this_month')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div>
                            <CardTitle className="text-lg sm:text-xl">{t('dashboard.recent_activity')}</CardTitle>
                            <CardDescription className="text-sm">Your latest village banking activities</CardDescription>
                        </div>
                        <Link href="/groups">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                <Eye className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">{t('common.view_all')}</span>
                                <span className="sm:hidden">{t('common.view_all')}</span>
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
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${activity.type.includes('LOAN') ? 'bg-blue-500' :
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
                                            {activity.createdAt.toLocaleDateString()}
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

            {/* Analytics Section with Suspense */}
            <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('dashboard.analytics')}</h2>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">{t('dashboard.view_reports')}</span>
                        <span className="sm:hidden">{t('dashboard.view_reports')}</span>
                    </Button>
                </div>

                {charts}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <Link href="/contributions/new">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">{t('dashboard.make_contribution')}</CardTitle>
                            <CardDescription className="text-sm">
                                Record your monthly contribution to any of your groups
                            </CardDescription>
                        </CardHeader>
                    </Link>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <Link href="/loans/new">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">{t('dashboard.apply_loan')}</CardTitle>
                            <CardDescription className="text-sm">
                                Request a loan from any of your active groups
                            </CardDescription>
                        </CardHeader>
                    </Link>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer sm:col-span-2 lg:col-span-1">
                    <Link href="/groups">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">{t('dashboard.manage_groups')}</CardTitle>
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
