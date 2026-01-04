'use client'
import { useState } from 'react'

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
import { motion, AnimatePresence } from 'framer-motion'
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
    const langContext = useLanguage()
    const t = langContext.t
    const [showInsights, setShowInsights] = useState(false)

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
                                {t('dashboard.rev_finances')}
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


            {/* Wallet Hero - The Zen Core */}
            <motion.div variants={itemFadeIn}>
                <GlassCard
                    className="relative overflow-hidden p-8 sm:p-12 border-white/40 dark:border-white/10 bg-gradient-to-br from-blue-600 to-indigo-800 dark:from-slate-800 dark:to-slate-900 shadow-2xl shadow-blue-500/20"
                    hover={false}
                    gradient={false}
                >
                    {/* Background Decorative Element */}
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <p className="text-white/60 font-black uppercase tracking-[0.2em] text-xs sm:text-sm">
                                {t('dashboard.total_contributions') || 'Total Savings'}
                            </p>
                            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
                                {formatCurrency(stats.totalContributions)}
                            </h2>
                            <div className="flex flex-wrap gap-3 pt-2">
                                <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest">
                                        {t('dashboard.status_healthy')}
                                    </span>
                                </div>
                                <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2">
                                    <Users className="w-3 h-3 text-blue-200" />
                                    <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest">
                                        {stats.totalGroups} Groups
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Link href="/contributions/new">
                                <Button variant="banana" size="xl" className="h-16 px-8 rounded-2xl text-lg shadow-xl shadow-black/20 group">
                                    <DollarSign className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                                    {t('dashboard.make_contribution')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Insights Drawer / Toggle Section */}
            <AnimatePresence>
                {showInsights && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <GlassCard className="p-1 sm:p-2 mb-8 sm:mb-12" hover={false}>
                            <div className="rounded-2xl overflow-hidden bg-card/10 backdrop-blur-3xl min-h-[400px]">
                                {charts}
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Split: Activity & Quick Actions Only (Zen) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 min-h-[400px]">
                {/* Left Area: Activity Feed (Widened) */}
                <motion.div variants={itemFadeIn} className="xl:col-span-2 space-y-6">
                    <GlassCard className="h-full flex flex-col p-0 overflow-hidden" hover={false}>
                        <div className="p-5 sm:p-7 border-b border-border/50 flex items-center justify-between bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-500/10 rounded-xl">
                                    <TrendingUp className="w-5 h-5 text-blue-500" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black text-foreground">
                                    {t('dashboard.recent_activity')}
                                </h2>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[600px] scrollbar-thin">
                            {recentActivity.length > 0 ? (
                                <div className="divide-y divide-border/20">
                                    {recentActivity.map((activity, i) => (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="p-5 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-5 group cursor-pointer"
                                        >
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:scale-105",
                                                activity.type.includes('LOAN') ? 'bg-blue-600 text-white' :
                                                    activity.type.includes('CONTRIBUTION') ? 'bg-emerald-600 text-white' :
                                                        'bg-slate-600 text-white'
                                            )}>
                                                <span className="font-black text-lg">{activity.groupName.charAt(0)}</span>
                                            </div>

                                            <div className="flex-1 min-w-0 flex items-center justify-between">
                                                <div>
                                                    <p className="text-base font-black text-foreground truncate">{activity.description}</p>
                                                    <p className="text-xs font-bold text-muted-foreground opacity-60 mt-0.5">{activity.groupName}</p>
                                                </div>
                                                <div className="text-right">
                                                    {activity.amount && (
                                                        <p className="text-sm font-black text-blue-600 dark:text-banana mb-1">
                                                            {formatCurrency(activity.amount)}
                                                        </p>
                                                    )}
                                                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{new Date(activity.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 opacity-40">
                                    <Zap size={48} className="mb-4" />
                                    <p className="text-sm font-black uppercase tracking-widest">{t('dashboard.no_activity_detected')}</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Right Area: Insights & Secondary Actions */}
                <div className="space-y-6">
                    {/* Insights Toggle Card */}
                    <motion.div variants={itemFadeIn}>
                        <GlassCard
                            className="p-6 cursor-pointer border-blue-500/20 hover:border-blue-500/40 group transition-all"
                            onClick={() => setShowInsights(!showInsights)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl text-blue-600">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black">{showInsights ? t('dashboard.hide_insights') : t('dashboard.show_insights')}</h3>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">{t('dashboard.growth_analytics')}</p>
                                    </div>
                                </div>
                                <ArrowRight className={cn("w-5 h-5 transition-transform", showInsights ? "rotate-90" : "")} />
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Secondary Actions */}
                    <motion.div variants={itemFadeIn} className="grid grid-cols-1 gap-4">
                        <Link href="/loans/new">
                            <GlassCard className="p-6 group cursor-pointer hover:bg-white/40">
                                <div className="flex items-center gap-4">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                                        <PiggyBank className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <h3 className="font-black text-sm">{t('dashboard.apply_loan')}</h3>
                                </div>
                            </GlassCard>
                        </Link>
                        <Link href="/groups">
                            <GlassCard className="p-6 group cursor-pointer hover:bg-white/40">
                                <div className="flex items-center gap-4">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                                        <Users className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <h3 className="font-black text-sm">{t('dashboard.manage_groups')}</h3>
                                </div>
                            </GlassCard>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}
