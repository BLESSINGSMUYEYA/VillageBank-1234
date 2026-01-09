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
    Eye,
    EyeOff
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
import { SecurityVerificationModal } from './SecurityVerificationModal'

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


    // Secure View State
    const [isContributionsVisible, setIsContributionsVisible] = useState(false)
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)

    const handleToggleVisibility = () => {
        if (isContributionsVisible) {
            setIsContributionsVisible(false)
        } else {
            setIsVerificationModalOpen(true)
        }
    }

    const handleVerificationSuccess = () => {
        setIsContributionsVisible(true)
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 sm:space-y-10 pb-10"
        >
            {/* Zen Hero Card - Dashboard Command Center */}
            <motion.div variants={itemFadeIn}>
                <div className="zen-card overflow-hidden">
                    {/* Top Identity Section */}
                    <div className="relative p-6 sm:p-10">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter leading-tight mb-2">
                                        {t('common.dashboard')}
                                    </h1>
                                    <p className="text-sm font-medium text-muted-foreground line-clamp-2 max-w-xl leading-relaxed flex flex-wrap items-center gap-1.5 opacity-80">
                                        {t('dashboard.welcome')},
                                        <span className="text-blue-600 dark:text-banana font-bold">{user.firstName}</span>!
                                        <span className="hidden sm:inline text-muted-foreground/60">•</span>
                                        <span>{t('dashboard.rev_finances')}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 shrink-0">
                                <Link href="/contributions/new">
                                    <Button variant="banana" className="rounded-xl font-black shadow-lg shadow-yellow-500/20 h-12">
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        {t('dashboard.make_contribution')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid Divider */}
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10 border-t border-white/10 bg-white/5 dark:bg-black/20">
                        <div className="p-6 space-y-1">
                            <p className="zen-label opacity-50 flex items-center gap-2">
                                <Wallet className="w-3 h-3" />
                                {t('dashboard.total_contributions') || 'Total Savings'}
                            </p>
                            <div className="flex items-center gap-2">
                                <p className="text-xl sm:text-2xl font-black text-foreground">
                                    {isContributionsVisible ? formatCurrency(stats.totalContributions) : '••••••'}
                                </p>
                                <button
                                    onClick={handleToggleVisibility}
                                    className="text-muted-foreground/50 hover:text-foreground transition-colors focus:outline-none"
                                >
                                    {isContributionsVisible ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('dashboard.status_healthy')}</p>
                        </div>
                        <div className="p-6 space-y-1">
                            <p className="zen-label opacity-50 flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                {t('common.groups') || 'Network'}
                            </p>
                            <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-banana">{stats.totalGroups}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Active Circles</p>
                        </div>
                        <div className="p-6 space-y-1">
                            <p className="zen-label opacity-50 flex items-center gap-2">
                                <Zap className="w-3 h-3" />
                                {t('dashboard.recent_activity')}
                            </p>
                            <p className="text-xl sm:text-2xl font-black text-emerald-500">{recentActivity.length}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">This Month</p>
                        </div>
                        <div className="p-6 space-y-1 relative group cursor-pointer hover:bg-white/5 transition-colors">
                            {pendingApprovals.length > 0 && (
                                <span className="absolute top-4 right-4 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            )}
                            <p className="zen-label opacity-50 flex items-center gap-2">
                                <ArrowUpRight className="w-3 h-3" />
                                {t('dashboard.pending_approvals')}
                            </p>
                            <p className={cn("text-xl sm:text-2xl font-black", pendingApprovals.length > 0 ? "text-red-500" : "text-foreground")}>
                                {pendingApprovals.length}
                            </p>
                            <Link href="/treasurer/approvals" className="text-[10px] font-bold text-muted-foreground uppercase hover:text-blue-500 flex items-center gap-1">
                                Review Items <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content Area - Sequential Layout */}
            <div className="space-y-12 sm:space-y-16">

                {/* 1. Performance (Growth & Analytics) */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-600 dark:bg-banana rounded-full" />
                            {t('dashboard.growth_and_analytics') || 'Growth & Analytics'}
                        </h3>
                    </div>
                    <motion.div variants={itemFadeIn}>
                        <GlassCard className="flex flex-col p-0 overflow-hidden" hover={false}>
                            <div className="p-5 sm:p-7 border-b border-border/50 flex items-center justify-between bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-500/10 rounded-xl">
                                        <TrendingUp className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-foreground">
                                            Financial Performance
                                        </h2>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            {t('dashboard.analytics') || 'Analytics & Insights'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse relative">
                                        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></span>
                                    </span>
                                    Live Data
                                </div>
                            </div>
                            <div className="p-1 sm:p-2 bg-white/20 dark:bg-slate-900/20">
                                <div className="rounded-2xl overflow-hidden bg-card/10 backdrop-blur-3xl min-h-[400px]">
                                    {charts}
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </section>

                {/* 2. Live Feed (Recent Activity) */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            <span className="w-1 h-6 bg-purple-500 rounded-full" />
                            {t('dashboard.recent_activity')}
                        </h3>
                    </div>
                    <motion.div variants={itemFadeIn}>
                        <GlassCard className="flex flex-col p-0 overflow-hidden" hover={false}>
                            <div className="p-5 sm:p-7 border-b border-border/50 flex items-center justify-between bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-500/10 rounded-xl">
                                        <TrendingUp className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-foreground">
                                            Activity Log
                                        </h2>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            {t('dashboard.activity_desc') || 'Real-time transaction feed'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse relative">
                                        <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75"></span>
                                    </span>
                                    Updated
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
                                                    <span className="font-black text-lg">{(activity.groupTag || activity.groupName).charAt(0).toUpperCase()}</span>
                                                </div>

                                                <div className="flex-1 min-w-0 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-base font-black text-foreground truncate">{activity.description}</p>
                                                        <p className="text-xs font-bold text-muted-foreground opacity-60 mt-0.5">
                                                            {activity.groupTag ? `@${activity.groupTag}` : activity.groupName}
                                                        </p>
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
                </section>

                {/* 3. Workspace (Quick Actions) */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            <span className="w-1 h-6 bg-emerald-500 rounded-full" />
                            {t('common.workspace') || 'Workspace'}
                        </h3>
                    </div>
                    <motion.div variants={itemFadeIn}>
                        <GlassCard className="flex flex-col p-0 overflow-hidden" hover={false}>
                            <div className="p-5 sm:p-7 border-b border-border/50 flex items-center justify-between bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                                        <Zap className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-foreground">
                                            Quick Actions
                                        </h2>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            {t('dashboard.quick_actions') || 'Shortcuts to key tasks'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Ready
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link href="/loans/new">
                                    <div className="group cursor-pointer bg-white/50 dark:bg-slate-900/50 hover:bg-white/80 dark:hover:bg-slate-800/80 p-6 rounded-2xl transition-all border border-border/50 h-full flex flex-col justify-center">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                                                <PiggyBank className="w-6 h-6 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-lg text-foreground">{t('dashboard.apply_loan')}</h3>
                                                <p className="text-xs font-medium text-muted-foreground/60 mt-1">Request capital from your circles</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                <Link href="/groups">
                                    <div className="group cursor-pointer bg-white/50 dark:bg-slate-900/50 hover:bg-white/80 dark:hover:bg-slate-800/80 p-6 rounded-2xl transition-all border border-border/50 h-full flex flex-col justify-center">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                                                <Users className="w-6 h-6 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-lg text-foreground">{t('dashboard.manage_groups')}</h3>
                                                <p className="text-xs font-medium text-muted-foreground/60 mt-1">View and manage your networks</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </GlassCard>
                    </motion.div>
                </section>

            </div>
            {/* Password Verification Dialog */}
            <SecurityVerificationModal
                open={isVerificationModalOpen}
                onOpenChange={setIsVerificationModalOpen}
                onVerified={handleVerificationSuccess}
            />
        </motion.div>
    )
}
