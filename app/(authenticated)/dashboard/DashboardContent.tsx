'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
    Users,
    DollarSign,
    TrendingUp,
    Calendar,
    Eye,
    BarChart3,
    ArrowUpRight,
    Wallet,
    PiggyBank,
    Zap
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'

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
        <div className="space-y-8 animate-fade-in relative">
            {/* Nano-Glass Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 shadow-2xl p-8 sm:p-10 mb-8 border border-white/10">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-banana/20 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl opacity-50"></div>

                <div className="relative z-10">
                    <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2">
                        {t('common.dashboard')}
                    </h1>
                    <p className="text-lg text-blue-100 max-w-2xl font-medium leading-relaxed">
                        {t('dashboard.welcome')}, <span className="text-banana font-black">{user.firstName}</span>! Ready to revolutionize your finances?
                    </p>
                </div>
            </div>

            {/* Treasurer Notification - "Nano Alert" */}
            {pendingApprovals.length > 0 && (
                <Alert className="relative overflow-hidden border-l-4 border-l-banana bg-card shadow-lg rounded-xl border-t-0 border-r-0 border-b-0">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-1">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-banana/10 rounded-full">
                                <DollarSign className="h-6 w-6 text-banana-700 dark:text-banana" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground text-lg">{t('dashboard.pending_approvals')}</h3>
                                <p className="text-muted-foreground font-medium">
                                    {t('dashboard.pending_desc').replace('{count}', pendingApprovals.length.toString())}
                                </p>
                            </div>
                        </div>
                        <Link href="/treasurer/approvals" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto bg-banana hover:bg-yellow-400 text-banana-foreground font-black rounded-xl shadow-md transition-all hover:scale-105 active:scale-95">
                                {t('dashboard.review_now')}
                            </Button>
                        </Link>
                    </div>
                </Alert>
            )}

            {/* "Banana Bento" Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1 */}
                <Card className="group relative overflow-hidden border-none shadow-lg bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-24 h-24 text-blue-900 dark:text-blue-100" />
                    </div>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-700 dark:text-blue-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Users className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">{t('dashboard.total_groups')}</span>
                        </div>
                        <div className="text-4xl font-black text-foreground mb-1">{stats.totalGroups}</div>
                        <div className="text-xs font-bold text-muted-foreground">{t('dashboard.active_groups_desc')}</div>
                    </CardContent>
                </Card>

                {/* Card 2 - Featured (Banana) */}
                <Card className="group relative overflow-hidden border-none shadow-lg bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet className="w-24 h-24 text-banana dark:text-banana" />
                    </div>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-banana/20 rounded-xl text-yellow-700 dark:text-yellow-400 group-hover:bg-banana group-hover:text-blue-950 transition-colors">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">{t('dashboard.total_contributions')}</span>
                        </div>
                        <div className="text-4xl font-black text-foreground mb-1 truncate" title={formatCurrency(stats.totalContributions)}>
                            {formatCurrency(stats.totalContributions)}
                        </div>
                        <div className="flex items-center text-xs font-bold text-green-600 dark:text-green-400">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            <span>+12.5% {t('dashboard.all_time')}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 3 */}
                <Card className="group relative overflow-hidden border-none shadow-lg bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <PiggyBank className="w-24 h-24 text-pink-600" />
                    </div>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-pink-100 dark:bg-pink-900/30 rounded-xl text-pink-600 dark:text-pink-400 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">{t('dashboard.active_loans')}</span>
                        </div>
                        <div className="text-4xl font-black text-foreground mb-1">{stats.totalLoans}</div>
                        <div className="text-xs font-bold text-muted-foreground break-words">
                            {stats.pendingLoans > 0 ? (
                                <span className="text-orange-600">{stats.pendingLoans} pending approval</span>
                            ) : 'All active & healthy'}
                        </div>
                    </CardContent>
                </Card>

                {/* Card 4 */}
                <Card className="group relative overflow-hidden border-none shadow-lg bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar className="w-24 h-24 text-purple-600" />
                    </div>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Monthly Avg</span>
                        </div>
                        <div className="text-4xl font-black text-foreground mb-1 truncate" title={formatCurrency(stats.monthlyContribution)}>
                            {formatCurrency(stats.monthlyContribution)}
                        </div>
                        <div className="text-xs font-bold text-muted-foreground">{t('dashboard.this_month')}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Split Section: Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Feed */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Charts Section Container */}
                    <div>
                        <h2 className="text-2xl font-black text-foreground mb-4">Performance</h2>
                        <div className="bg-card rounded-3xl border border-border shadow-sm p-2 overflow-hidden">
                            {charts}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                            <Zap className="w-6 h-6 text-banana filled" fill="currentColor" />
                            {t('dashboard.recent_activity')}
                        </h2>
                        <Link href="/groups">
                            <Button variant="ghost" size="sm" className="font-bold text-muted-foreground hover:text-blue-600">
                                {t('common.view_all')} <ArrowUpRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>

                    <Card className="bg-card border-none shadow-sm h-full">
                        <CardContent className="p-0">
                            {recentActivity.length > 0 ? (
                                <div className="divide-y divide-border">
                                    {recentActivity.map((activity, i) => (
                                        <div key={activity.id} className="p-4 sm:p-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center group">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-white/20 ${activity.type.includes('LOAN') ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' :
                                                    activity.type.includes('CONTRIBUTION') ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' :
                                                        'bg-gradient-to-br from-gray-500 to-gray-600 text-white'
                                                    }`}>
                                                    <span className="font-black text-lg">{activity.groupName.charAt(0)}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-foreground line-clamp-1 group-hover:text-blue-600 transition-colors">{activity.description}</p>
                                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{activity.groupName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full pl-16 sm:pl-0">
                                                {activity.amount && (
                                                    <div className="font-black text-foreground whitespace-nowrap bg-muted/50 px-3 py-1 rounded-lg">
                                                        {formatCurrency(activity.amount)}
                                                    </div>
                                                )}
                                                <div className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                                                    {new Date(activity.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-1">{t('dashboard.no_activity')}</h3>
                                    <p className="text-muted-foreground mb-4">Time to start building your wealth!</p>
                                    <Link href="/groups/new">
                                        <Button className="rounded-xl font-bold bg-blue-900 hover:bg-blue-800 text-white">
                                            <Users className="w-4 h-4 mr-2" />
                                            {t('dashboard.join_create')}
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Action Tiles */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-foreground">{t('dashboard.analytics')}</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <Link href="/contributions/new">
                            <div className="group relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-lg overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer">
                                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                                <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
                                    <div className="bg-white/20 w-fit p-3 rounded-2xl backdrop-blur-sm">
                                        <DollarSign className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black mb-1">{t('dashboard.make_contribution')}</h3>
                                        <p className="text-blue-100 text-sm font-medium leading-tight opacity-90">{t('dashboard.make_contribution_desc')}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/loans/new">
                                <div className="group bg-card border border-border hover:border-banana/50 hover:bg-banana-soft rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer h-full flex flex-col justify-between">
                                    <div className="mb-4">
                                        <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center text-pink-600 mb-2">
                                            <Wallet className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-foreground leading-tight">{t('dashboard.apply_loan')}</h3>
                                    </div>
                                    <ArrowUpRight className="self-end w-5 h-5 text-muted-foreground group-hover:text-banana-foreground transition-colors" />
                                </div>
                            </Link>

                            <Link href="/groups">
                                <div className="group bg-card border border-border hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer h-full flex flex-col justify-between">
                                    <div className="mb-4">
                                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 mb-2">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-foreground leading-tight">{t('dashboard.manage_groups')}</h3>
                                    </div>
                                    <ArrowUpRight className="self-end w-5 h-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                                </div>
                            </Link>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    )
}
