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
            <div>
                <h1 className="text-display text-gray-900">{t('common.dashboard')}</h1>
                <p className="text-body text-gray-600 mt-2">
                    {t('dashboard.welcome')}, {user.firstName}! {t('dashboard.overview')}.
                </p>
            </div>

            {/* Treasurer Notification Banner */}
            {pendingApprovals.length > 0 && (
                <Alert className="bg-blue-50/80 border-blue-200/50 backdrop-blur-md border-none shadow-xl">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-h3 text-blue-900">{t('dashboard.pending_approvals')}</CardTitle>
                                <CardDescription className="text-blue-700 text-xs">
                                    {t('dashboard.pending_desc').replace('{count}', pendingApprovals.length.toString())}
                                </CardDescription>
                            </div>
                        </div>
                        <Link href="/treasurer/approvals">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-none rounded-2xl font-black">
                                {t('dashboard.review_now')}
                            </Button>
                        </Link>
                    </div>
                </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="hover:shadow-lg transition-shadow border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase leading-snug">{t('dashboard.total_groups')}</CardTitle>
                        <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-xl shrink-0 ml-2">
                            <Users className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-h2 font-black truncate">{stats.totalGroups}</div>
                        <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                            {t('dashboard.active_groups_desc')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 sm:hidden">
                            {t('groups.members')}
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase leading-snug">{t('dashboard.total_contributions')}</CardTitle>
                        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl shrink-0 ml-2">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-h2 font-black truncate" title={formatCurrency(stats.totalContributions)}>
                            {formatCurrency(stats.totalContributions)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {t('dashboard.all_time')}
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase leading-snug">{t('dashboard.active_loans')}</CardTitle>
                        <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-xl shrink-0 ml-2">
                            <TrendingUp className="h-4 w-4 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-h2 font-black truncate">{stats.totalLoans}</div>
                        <p className="text-xs text-gray-500 mt-1 break-words">
                            {stats.pendingLoans > 0 && (
                                <span>{stats.pendingLoans} {t('contributions.pending').toLowerCase()}</span>
                            )}
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase leading-snug">{t('dashboard.monthly_contribution')}</CardTitle>
                        <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl shrink-0 ml-2">
                            <Calendar className="h-4 w-4 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-h2 font-black truncate" title={formatCurrency(stats.monthlyContribution)}>
                            {formatCurrency(stats.monthlyContribution)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {t('dashboard.this_month')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-none shadow-lg bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div>
                            <CardTitle className="text-h3">{t('dashboard.recent_activity')}</CardTitle>
                            <CardDescription className="text-body">{t('dashboard.activity_desc')}</CardDescription>
                        </div>
                        <Link href="/groups">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-2xl font-black bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-500 hover:text-blue-500 transition-colors">
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
                                <div key={activity.id} className="group relative p-3 sm:p-4 bg-white/80 dark:bg-gray-800/80 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600/5 to-transparent rounded-bl-[5rem] -mr-8 -mt-8"></div>

                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-2 h-2 rounded-full shrink-0 ${activity.type.includes('LOAN') ? 'bg-blue-500' :
                                                activity.type.includes('CONTRIBUTION') ? 'bg-green-500' :
                                                    'bg-gray-500'
                                                }`} />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-body font-black truncate">{activity.description}</p>
                                                <p className="text-xs text-gray-500 truncate">{activity.groupName}</p>
                                            </div>
                                        </div>
                                        <div className="text-right sm:text-left">
                                            {activity.amount && (
                                                <p className="text-body font-black">{formatCurrency(activity.amount)}</p>
                                            )}
                                            <p className="text-xs text-gray-500 font-bold">
                                                {new Date(activity.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 sm:py-8 px-4">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-h3 text-gray-900 mb-2">{t('dashboard.no_activity')}</h3>
                            <p className="text-body text-gray-500 mb-4">
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
                    <h2 className="text-display text-gray-900">{t('dashboard.analytics')}</h2>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-2xl font-black bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-500 hover:text-blue-500 transition-colors">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        <span>{t('dashboard.view_reports')}</span>
                    </Button>
                </div>

                {charts}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Link href="/contributions/new">
                    <Card className="group relative hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md overflow-hidden">
                        <CardHeader className="p-4 sm:p-6">
                            <div className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            <CardTitle className="text-h3 relative z-10">{t('dashboard.make_contribution')}</CardTitle>
                            <CardDescription className="text-body relative z-10">
                                {t('dashboard.make_contribution_desc')}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/loans/new">
                    <Card className="group relative hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md overflow-hidden">
                        <CardHeader className="p-4 sm:p-6">
                            <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            <CardTitle className="text-h3 relative z-10">{t('dashboard.apply_loan')}</CardTitle>
                            <CardDescription className="text-body relative z-10">
                                {t('dashboard.apply_loan_desc')}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/groups">
                    <Card className="group relative hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md overflow-hidden sm:col-span-2 lg:col-span-1">
                        <CardHeader className="p-4 sm:p-6">
                            <div className="absolute inset-0 bg-purple-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            <CardTitle className="text-h3 relative z-10">{t('dashboard.manage_groups')}</CardTitle>
                            <CardDescription className="text-body relative z-10">
                                {t('dashboard.manage_groups_desc')}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
