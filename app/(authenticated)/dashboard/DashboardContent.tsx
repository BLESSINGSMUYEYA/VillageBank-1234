'use client'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
    Users,
    DollarSign,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    Zap,
    Wallet,
    PiggyBank,
    ArrowRight,
    Eye
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatsCard } from '@/components/ui/stats-card'
import { SectionHeader } from '@/components/ui/section-header'
import { motion } from 'framer-motion'
import { staggerContainer, fadeIn, itemFadeIn } from '@/lib/motions'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/lib/utils'

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
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 sm:space-y-10 pb-10"
        >
            {/* Header Section */}
            <motion.div variants={fadeIn}>
                <PageHeader
                    title={t('common.dashboard')}
                    description={
                        <span className="flex flex-wrap items-center gap-1.5">
                            {t('dashboard.welcome')},
                            <span className="text-blue-600 dark:text-banana font-black relative group px-1">
                                {user.firstName}
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500/30 dark:bg-banana/30 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                            </span>!
                            <span className="text-muted-foreground/80 font-normal">
                                Ready to revolutionize your finances?
                            </span>
                        </span>
                    }
                    action={
                        <Link href="/contributions/new" className="hidden sm:block">
                            <Button variant="banana" className="shadow-yellow-500/20 group">
                                <DollarSign className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                                {t('dashboard.make_contribution')}
                            </Button>
                        </Link>
                    }
                />
            </motion.div>

            {/* Pending Approvals Alert */}
            {pendingApprovals.length > 0 && (
                <motion.div variants={itemFadeIn}>
                    <Alert className="relative overflow-hidden border border-banana/20 bg-gradient-to-r from-banana/10 via-yellow-100/30 to-transparent dark:from-banana/5 dark:via-yellow-900/5 dark:to-transparent shadow-xl rounded-2xl xs:rounded-3xl group transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500 hidden xs:block">
                            <Zap size={60} className="text-banana" />
                        </div>
                        <div className="flex flex-col min-[480px]:flex-row items-stretch min-[480px]:items-center justify-between gap-4 p-1 xs:p-2 relative z-10">
                            <div className="flex items-start min-[480px]:items-center gap-3 xs:gap-4 flex-1">
                                <div className="p-2.5 xs:p-3 bg-banana text-banana-foreground rounded-xl xs:rounded-2xl shrink-0 shadow-lg shadow-yellow-500/20">
                                    <DollarSign className="h-5 w-5 xs:h-6 xs:w-6" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-black text-foreground text-base xs:text-lg leading-tight flex items-center gap-2">
                                        {t('dashboard.pending_approvals')}
                                        <span className="flex h-1.5 w-1.5 xs:h-2 xs:w-2 rounded-full bg-red-500 animate-ping" />
                                    </h3>
                                    <p className="text-xs xs:text-sm text-muted-foreground font-medium mt-0.5 xs:mt-1 truncate xs:whitespace-normal">
                                        {t('dashboard.pending_desc', { count: pendingApprovals.length })}
                                    </p>
                                </div>
                            </div>
                            <div className="shrink-0 flex items-center">
                                <Button asChild size="lg" variant="default" className="w-full min-[480px]:w-auto bg-blue-900 border-none hover:bg-blue-800 text-white font-black rounded-xl xs:rounded-2xl shadow-lg shadow-blue-900/20 active:scale-95 transition-all h-12 xs:h-14 px-6">
                                    <Link href="/treasurer/approvals">
                                        <Eye className="w-5 h-5 mr-2" />
                                        {t('dashboard.review_now')}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </Alert>
                </motion.div>
            )}


            {/* Stats Grid */}
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 no-scrollbar">
                <StatsCard
                    index={1}
                    label={t('dashboard.total_groups')}
                    value={stats.totalGroups}
                    description={t('dashboard.active_groups_desc')}
                    icon={Users}
                    className="shrink-0 w-[280px] sm:w-auto"
                />

                <StatsCard
                    index={2}
                    variant="featured"
                    label={t('dashboard.total_contributions')}
                    value={formatCurrency(stats.totalContributions)}
                    icon={Wallet}
                    trend={{
                        value: `+12.5%`,
                        positive: true,
                        icon: TrendingUp
                    }}
                    className="shrink-0 w-[280px] sm:w-auto"
                />

                <StatsCard
                    index={3}
                    variant="glass"
                    label={t('dashboard.active_loans')}
                    value={stats.totalLoans}
                    description={stats.pendingLoans > 0 ? `${stats.pendingLoans} pending` : 'All healthy'}
                    icon={PiggyBank}
                    className="shrink-0 w-[280px] sm:w-auto"
                />

                <StatsCard
                    index={4}
                    label="Monthly Avg"
                    value={formatCurrency(stats.monthlyContribution)}
                    description={t('dashboard.this_month')}
                    icon={Calendar}
                    variant="gradient"
                    gradient="bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-500/20"
                    className="shrink-0 w-[280px] sm:w-auto"
                />
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 min-h-[500px]">
                {/* Left Column: Charts */}
                <motion.div variants={itemFadeIn} className="xl:col-span-2 space-y-6 sm:space-y-8">
                    <GlassCard className="p-1 sm:p-2" hover={false}>
                        <div className="rounded-2xl overflow-hidden bg-card/30">
                            {charts}
                        </div>
                    </GlassCard>

                    {/* Quick Access Mobile */}
                    <div className="grid grid-cols-2 gap-3 xl:hidden">
                        <Link href="/contributions/new" className="col-span-2">
                            <Button variant="banana" size="xl" className="w-full text-lg shadow-blue-500/20">
                                <DollarSign className="w-6 h-6 mr-2" />
                                {t('dashboard.make_contribution')}
                            </Button>
                        </Link>
                        <Link href="/loans/new">
                            <Button variant="outline" className="w-full h-14 font-black border-2 rounded-2xl hover:bg-white/50 dark:hover:bg-slate-800/50 backdrop-blur-sm">
                                {t('dashboard.apply_loan')}
                            </Button>
                        </Link>
                        <Link href="/groups">
                            <Button variant="outline" className="w-full h-14 font-black border-2 rounded-2xl hover:bg-white/50 dark:hover:bg-slate-800/50 backdrop-blur-sm">
                                {t('dashboard.manage_groups')}
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Right Column: Activity & Quick Actions */}
                <div className="space-y-6 sm:space-y-8 flex flex-col">
                    {/* Desktop Quick Actions */}
                    <motion.div variants={itemFadeIn} className="hidden xl:grid grid-cols-1 gap-4">
                        <SectionHeader
                            title={t('dashboard.quick_actions')}
                            icon={Zap}
                            iconColor="text-blue-500"
                        />
                        <Link href="/contributions/new">
                            <GlassCard className="p-6 group cursor-pointer border-blue-500/20 hover:border-blue-500/40" gradient={false}>
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent group-hover:from-blue-600/10 transition-colors" />
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                            <DollarSign className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black leading-tight">{t('dashboard.make_contribution')}</h3>
                                            <p className="text-muted-foreground text-xs font-bold mt-1">Instant financial record</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </GlassCard>
                        </Link>

                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/loans/new">
                                <GlassCard className="p-4" blur="sm">
                                    <div className="p-2 bg-pink-500/10 rounded-xl w-fit mb-3">
                                        <Wallet className="w-5 h-5 text-pink-500" />
                                    </div>
                                    <h3 className="font-black text-sm leading-tight">{t('dashboard.apply_loan')}</h3>
                                </GlassCard>
                            </Link>

                            <Link href="/groups">
                                <GlassCard className="p-4" blur="sm">
                                    <div className="p-2 bg-purple-500/10 rounded-xl w-fit mb-3">
                                        <Users className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h3 className="font-black text-sm leading-tight">{t('dashboard.manage_groups')}</h3>
                                </GlassCard>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Recent Activity Feed */}
                    <motion.div variants={itemFadeIn} className="flex-1 min-h-0">
                        <GlassCard className="h-full flex flex-col p-0 overflow-hidden" hover={false}>
                            <div className="p-5 border-b border-border/50 flex items-center justify-between bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <TrendingUp className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-black text-foreground">
                                        {t('dashboard.recent_activity')}
                                    </h2>
                                </div>
                                <Link href="/groups">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-blue-500/10 hover:text-blue-500">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>

                            <div className="flex-1 overflow-y-auto max-h-[500px] xl:max-h-none scrollbar-thin scrollbar-thumb-muted-foreground/10">
                                {recentActivity.length > 0 ? (
                                    <div className="divide-y divide-border/30">
                                        {recentActivity.map((activity, i) => (
                                            <motion.div
                                                key={activity.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="p-4 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors flex items-center gap-4 group cursor-pointer"
                                            >
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                                                    activity.type.includes('LOAN') ? 'bg-blue-500 text-white' :
                                                        activity.type.includes('CONTRIBUTION') ? 'bg-emerald-500 text-white' :
                                                            'bg-slate-500 text-white'
                                                )}>
                                                    <span className="font-black text-lg">{activity.groupName.charAt(0)}</span>
                                                </div>

                                                <div className="flex-1 min-w-0 grid gap-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-black text-foreground truncate">{activity.description}</p>
                                                        {activity.amount && (
                                                            <span className="text-[10px] font-black text-blue-600 dark:text-banana bg-blue-500/10 dark:bg-banana/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                                                                {formatCurrency(activity.amount)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-bold">
                                                        <span className="truncate pr-2 opacity-70">{activity.groupName}</span>
                                                        <span className="opacity-60">{new Date(activity.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                                        <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
                                            <Calendar className="w-8 h-8 text-muted-foreground/30" />
                                        </div>
                                        <p className="text-sm font-black text-muted-foreground">No recent activity detected.</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}
