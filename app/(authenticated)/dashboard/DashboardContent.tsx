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
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-2">
                <h1 className="text-display font-black bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                    {t('common.dashboard')}
                </h1>
                <p className="text-body text-muted-foreground mt-2">
                    {t('dashboard.welcome')}, <span className="font-bold text-foreground">{user.firstName}</span>! {t('dashboard.overview')}.
                </p>
            </div>

            {/* Treasurer Notification Banner */}
            {pendingApprovals.length > 0 && (
                <Alert className="bg-blue-50/80 border-blue-200/50 backdrop-blur-md border-none shadow-xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 sm:gap-0">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full shrink-0">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-h3 text-blue-900">{t('dashboard.pending_approvals')}</CardTitle>
                                <CardDescription className="text-blue-700 text-xs">
                                    {t('dashboard.pending_desc').replace('{count}', pendingApprovals.length.toString())}
                                </CardDescription>
                            </div>
                        </div>
                        <Link href="/treasurer/approvals" className="w-full sm:w-auto">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-none rounded-2xl font-black w-full sm:w-auto">
                                {t('dashboard.review_now')}
                            </Button>
                        </Link>
                    </div>
                </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black text-muted-foreground uppercase leading-snug">{t('dashboard.total_groups')}</CardTitle>
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900 rounded-xl shrink-0 ml-2">
                            <Users className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-h2 font-black text-foreground truncate">{stats.totalGroups}</div>
                        <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                            {t('dashboard.active_groups_desc')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 sm:hidden">
                            {t('groups.members')}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black text-muted-foreground uppercase leading-snug">{t('dashboard.total_contributions')}</CardTitle>
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900 rounded-xl shrink-0 ml-2">
                            <DollarSign className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-h2 font-black text-foreground truncate" title={formatCurrency(stats.totalContributions)}>
                            {formatCurrency(stats.totalContributions)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('dashboard.all_time')}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black text-muted-foreground uppercase leading-snug">{t('dashboard.active_loans')}</CardTitle>
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900 rounded-xl shrink-0 ml-2">
                            <TrendingUp className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-h2 font-black text-foreground truncate">{stats.totalLoans}</div>
                        <p className="text-xs text-muted-foreground mt-1 break-words">
                            {stats.pendingLoans > 0 && (
                                <span>{stats.pendingLoans} {t('contributions.pending').toLowerCase()}</span>
                            )}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black text-muted-foreground uppercase leading-snug">{t('dashboard.monthly_contribution')}</CardTitle>
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900 rounded-xl shrink-0 ml-2">
                            <Calendar className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-h2 font-black text-foreground truncate" title={formatCurrency(stats.monthlyContribution)}>
                            {formatCurrency(stats.monthlyContribution)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('dashboard.this_month')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div>
                            <CardTitle className="text-h3 text-foreground">{t('dashboard.recent_activity')}</CardTitle>
                            <CardDescription className="text-body text-muted-foreground">{t('dashboard.activity_desc')}</CardDescription>
                        </div>
                        <Link href="/groups">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-xl font-black border-border hover:border-blue-700 hover:text-blue-700 transition-colors">
                                <Eye className="w-4 h-4 mr-2" />
                                <span>{t('common.view_all')}</span>
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {recentActivity.length > 0 ? (
                        <div className="space-y-3 sm:space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="p-3 sm:p-4 bg-muted/50 rounded-xl border border-border hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center space-x-3 overflow-hidden">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.type.includes('LOAN') ? 'bg-blue-100 dark:bg-blue-900' :
                                                activity.type.includes('CONTRIBUTION') ? 'bg-green-100 dark:bg-green-900' :
                                                    'bg-gray-100 dark:bg-gray-800'
                                                }`}>
                                                <div className={`w-2 h-2 rounded-full ${activity.type.includes('LOAN') ? 'bg-blue-700 dark:bg-blue-400' :
                                                    activity.type.includes('CONTRIBUTION') ? 'bg-green-700 dark:bg-green-400' :
                                                        'bg-gray-700 dark:bg-gray-400'
                                                    }`} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-body font-black truncate text-foreground">{activity.description}</p>
                                                <p className="text-xs text-muted-foreground truncate">{activity.groupName}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            {activity.amount && (
                                                <p className="text-body font-black text-foreground">{formatCurrency(activity.amount)}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground font-bold">
                                                {new Date(activity.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 sm:py-8 px-4">
                            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-h3 text-foreground mb-2">{t('dashboard.no_activity')}</h3>
                            <p className="text-body text-muted-foreground mb-4">
                                {t('dashboard.no_activity_desc')}
                            </p>
                            <Link href="/groups/new">
                                <Button className="w-full sm:w-auto rounded-2xl font-black">
                                    <Users className="w-4 h-4 mr-2" />
                                    {t('dashboard.join_create')}
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Analytics Section with Suspense */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <h2 className="text-display text-foreground">{t('dashboard.analytics')}</h2>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-2xl font-black bg-card border-border hover:border-blue-500 hover:text-blue-500 transition-colors">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        <span>{t('dashboard.view_reports')}</span>
                    </Button>
                </div>

                {charts}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Link href="/contributions/new">
                    <Card className="group bg-card border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                        <CardHeader className="p-4 sm:p-6">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-700 transition-colors">
                                <DollarSign className="w-6 h-6 text-blue-700 dark:text-blue-300 group-hover:text-white transition-colors" />
                            </div>
                            <CardTitle className="text-h3 text-foreground">{t('dashboard.make_contribution')}</CardTitle>
                            <CardDescription className="text-body text-muted-foreground mt-2">
                                {t('dashboard.make_contribution_desc')}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/loans/new">
                    <Card className="group bg-card border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                        <CardHeader className="p-4 sm:p-6">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-700 transition-colors">
                                <TrendingUp className="w-6 h-6 text-blue-700 dark:text-blue-300 group-hover:text-white transition-colors" />
                            </div>
                            <CardTitle className="text-h3 text-foreground">{t('dashboard.apply_loan')}</CardTitle>
                            <CardDescription className="text-body text-muted-foreground mt-2">
                                {t('dashboard.apply_loan_desc')}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/groups">
                    <Card className="group bg-card border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer sm:col-span-2 lg:col-span-1">
                        <CardHeader className="p-4 sm:p-6">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-700 transition-colors">
                                <Users className="w-6 h-6 text-blue-700 dark:text-blue-300 group-hover:text-white transition-colors" />
                            </div>
                            <CardTitle className="text-h3 text-foreground">{t('dashboard.manage_groups')}</CardTitle>
                            <CardDescription className="text-body text-muted-foreground mt-2">
                                {t('dashboard.manage_groups_desc')}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div >
    )
}
