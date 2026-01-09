
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { DollarSign, Wallet, Users, Zap, ArrowUpRight, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { formatCurrency, cn } from '@/lib/utils'
import { itemFadeIn } from '@/lib/motions'

interface DashboardHeroProps {
    user: { firstName: string | null }
    stats: {
        totalContributions: number
        totalGroups: number
    }
    pendingApprovalsCount: number
    recentActivityCount: number
}

export function DashboardHero({ user, stats, pendingApprovalsCount, recentActivityCount }: DashboardHeroProps) {
    const { t } = useLanguage()
    const [isContributionsVisible, setIsContributionsVisible] = useState(false)

    return (
        <motion.div variants={itemFadeIn}>
            <div className="zen-card relative overflow-hidden group/hero">

                {/* Ambient Background Glow */}
                <div className="bg-hero-glow opacity-0 group-hover/hero:opacity-100 transition-opacity duration-1000" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-banana/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Top Identity Section */}
                <div className="relative p-8 sm:p-10">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="space-y-4 max-w-2xl">
                            <div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h1 className="text-4xl sm:text-5xl font-black tracking-tighter leading-[0.9] mb-3">
                                        <span className="text-foreground">{t('common.dashboard')}</span>
                                        <span className="text-blue-600 dark:text-banana">.</span>
                                    </h1>
                                </motion.div>
                                <p className="text-base sm:text-lg font-medium text-muted-foreground/80 leading-relaxed max-w-xl">
                                    {t('dashboard.welcome')}, <span className="text-foreground font-bold">{user.firstName}</span>!
                                    <br className="hidden sm:block" />
                                    <span className="opacity-80">{t('dashboard.rev_finances')}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 shrink-0 mt-2 md:mt-0">
                            <Link href="/contributions/new">
                                <div className="relative group rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 p-[1px] shadow-glow-blue transition-shadow">
                                    <Button
                                        size="lg"
                                        className="relative h-12 bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-xl px-8 font-black tracking-wide overflow-hidden"
                                    >
                                        <div className="bg-shimmer-slide" />
                                        <DollarSign className="w-5 h-5 mr-2" />
                                        {t('dashboard.make_contribution')}
                                    </Button>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Grid Divider */}
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10 border-t border-white/10 bg-white/5 dark:bg-black/20">
                    {/* Total Contributions */}
                    <div className="p-6 sm:p-8 space-y-2 hover:bg-white/5 transition-colors group cursor-default relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-banana/0 to-banana/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="zen-label opacity-60 flex items-center gap-2 relative z-10">
                            <div className="p-1 rounded bg-banana/10 text-banana">
                                <Wallet className="w-3.5 h-3.5" />
                            </div>
                            {t('dashboard.total_contributions') || 'Savings'}
                        </div>
                        <div className="flex items-center gap-3 relative z-10">
                            <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                                {isContributionsVisible ? formatCurrency(stats.totalContributions) : '••••••'}
                            </p>
                            <button
                                onClick={() => setIsContributionsVisible(!isContributionsVisible)}
                                className="text-muted-foreground/40 hover:text-blue-500 transition-colors p-1 hover:bg-blue-500/10 rounded-lg"
                            >
                                {isContributionsVisible ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        <div className="flex items-center gap-2 pt-1 relative z-10">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('dashboard.status_healthy')}</p>
                        </div>
                    </div>

                    {/* Active Groups */}
                    <div className="p-6 sm:p-8 space-y-2 hover:bg-white/5 transition-colors group cursor-default relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="zen-label opacity-60 flex items-center gap-2 relative z-10">
                            <div className="p-1 rounded bg-blue-500/10 text-blue-500">
                                <Users className="w-3.5 h-3.5" />
                            </div>
                            {t('common.groups') || 'Network'}
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight relative z-10">{stats.totalGroups}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest relative z-10">Active Circles</p>
                    </div>

                    {/* Recent Activity Count */}
                    <div className="p-6 sm:p-8 space-y-2 hover:bg-white/5 transition-colors group cursor-default relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="zen-label opacity-60 flex items-center gap-2 relative z-10">
                            <div className="p-1 rounded bg-purple-500/10 text-purple-500">
                                <Zap className="w-3.5 h-3.5" />
                            </div>
                            {t('dashboard.recent_activity')}
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-purple-500 tracking-tight relative z-10">{recentActivityCount}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest relative z-10">This Month</p>
                    </div>

                    {/* Pending Approvals */}
                    <Link href="/treasurer/approvals" className="block h-full">
                        <div className="p-6 sm:p-8 space-y-2 hover:bg-white/5 transition-colors group cursor-pointer h-full relative overflow-hidden">
                            {pendingApprovalsCount > 0 && (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 via-red-500/5 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="absolute top-6 right-6 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-lg shadow-red-500/50"></span>
                                    </span>
                                </>
                            )}
                            <div className="zen-label opacity-60 flex items-center gap-2 relative z-10">
                                <div className={cn("p-1 rounded", pendingApprovalsCount > 0 ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground")}>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </div>
                                {t('dashboard.pending_approvals')}
                            </div>
                            <p className={cn("text-2xl sm:text-3xl font-black tracking-tight relative z-10", pendingApprovalsCount > 0 ? "text-red-500" : "text-muted-foreground")}>
                                {pendingApprovalsCount}
                            </p>
                            <div className="flex items-center gap-1.5 relative z-10 group-hover:translate-x-1 transition-transform">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest  group-hover:text-blue-500 transition-colors">Review Items</span>
                                <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-blue-500" />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </motion.div>
    )
}
