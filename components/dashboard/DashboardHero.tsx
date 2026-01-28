
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/GlassCard'
import { DollarSign, Wallet, Users, ArrowUpRight, ArrowRight, Eye, EyeOff, Shield } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { formatCurrency, cn } from '@/lib/utils'
import { itemFadeIn } from '@/lib/motions'
import { SecurityVerificationModal } from '@/app/(authenticated)/dashboard/SecurityVerificationModal'
import { ContributionModal } from '@/components/contributions/ContributionModal'

interface DashboardHeroProps {
    user: {
        firstName: string | null
        role: string
    }
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
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)
    const [isContributionModalOpen, setIsContributionModalOpen] = useState(false)
    const router = useRouter()

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good Morning'
        if (hour < 18) return 'Good Afternoon'
        return 'Good Evening'
    }

    const handleToggleVisibility = () => {
        if (isContributionsVisible) {
            setIsContributionsVisible(false)
        } else {
            setIsVerificationModalOpen(true)
        }
    }

    const handleVerified = () => {
        setIsContributionsVisible(true)
    }

    const isAdminOrTreasurer = user.role === 'ADMIN' || user.role === 'TREASURER'

    return (
        <motion.div variants={itemFadeIn} className="space-y-6">
            <GlassCard
                className="overflow-hidden p-0 rounded-3xl border-white/20 shadow-2xl shadow-emerald-900/5"
                blur="xl"
                hover={false}
            >
                <div className="p-5 sm:p-10 relative overflow-hidden">
                    {/* Ambient Background Glows */}
                    <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Top Identity Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
                        <div className="space-y-4 max-w-2xl">
                            <div className="space-y-1">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                >
                                    <h1 className="hidden sm:block text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 mb-3 sm:mb-4 text-left break-words leading-tight">
                                        {t('common.dashboard')}
                                        <span className="text-emerald-500 dark:text-banana">.</span>
                                    </h1>
                                </motion.div>
                                <div className="text-xs sm:text-sm md:text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl flex flex-wrap items-center gap-2 sm:gap-3">
                                    <div className="px-2.5 sm:px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                                        <Shield className="w-3 h-3" />
                                        Secure Hub
                                    </div>
                                    <span className="inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                    <span className="inline">
                                        {getGreeting()}, <span className="text-slate-900 dark:text-white font-black">{user.firstName}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden sm:block w-full md:w-auto shrink-0 relative z-10">
                            <Button
                                size="xl"
                                onClick={() => {
                                    if (stats.totalGroups > 0) {
                                        setIsContributionModalOpen(true)
                                    } else {
                                        toast.info("Join a Group First", {
                                            description: "You need to be a member of a group to make contributions.",
                                            duration: 5000,
                                        })
                                        router.push('/groups')
                                    }
                                }}
                                variant="banana"
                                className="w-full md:w-auto font-bold tracking-wide shadow-xl group/btn transition-all active:scale-95 px-8"
                            >
                                <DollarSign className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                <span className="whitespace-nowrap">{t('dashboard.make_contribution')}</span>
                                <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid - Premium Layout */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 relative z-10">
                        {/* Total Contributions - Large Card */}
                        <div className="col-span-2 p-3 sm:p-4 bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-2xl flex items-center justify-between group hover:border-emerald-200 hover:shadow-lg transition-all">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <p className="text-label-caps text-slate-400">
                                        {t('dashboard.total_contributions') || 'Total Savings'}
                                    </p>
                                    <button
                                        onClick={handleToggleVisibility}
                                        className="text-slate-300 hover:text-emerald-600 transition-colors p-1"
                                    >
                                        {isContributionsVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <p className="text-stat-value text-main">
                                    {isContributionsVisible ? formatCurrency(stats.totalContributions) : '••••••'}
                                </p>
                            </div>
                            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm">
                                <Wallet className="w-5 h-5 sm:w-8 sm:h-8 text-emerald-600" />
                            </div>
                        </div>

                        {/* Active Groups */}
                        <div className="p-3 sm:p-4 bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-2xl flex flex-col justify-between group hover:border-emerald-200 transition-all">
                            <div className="flex justify-between items-start">
                                <p className="text-label-caps text-slate-400">
                                    {t('common.groups')}
                                </p>
                                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:text-emerald-600 transition-colors">
                                    <Users className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                                </div>
                            </div>
                            <div className="mt-3 sm:mt-4">
                                <p className="text-card-title text-main">{stats.totalGroups}</p>
                                <p className="text-micro text-slate-400 mt-1 uppercase font-bold">Memberships</p>
                            </div>
                        </div>

                        {/* Status / Approvals */}
                        {isAdminOrTreasurer ? (
                            <Link href="/treasurer/approvals" className="block h-full group">
                                <div className="p-3 sm:p-4 bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-2xl flex flex-col justify-between h-full hover:border-emerald-200 transition-all relative overflow-hidden">
                                    {pendingApprovalsCount > 0 && (
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-3xl" />
                                    )}
                                    <div className="flex justify-between items-start">
                                        <p className={cn(
                                            "text-label-caps",
                                            pendingApprovalsCount > 0 ? "text-red-500" : "text-slate-400"
                                        )}>
                                            {t('dashboard.pending_approvals') ? 'Pending' : 'Pending'}
                                        </p>
                                        <div className={cn(
                                            "p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all",
                                            pendingApprovalsCount > 0 ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400"
                                        )}>
                                            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </div>
                                    </div>
                                    <div className="mt-3 sm:mt-4 flex items-end justify-between">
                                        <div>
                                            <p className={cn("text-card-title", pendingApprovalsCount > 0 ? "text-red-500" : "text-main")}>
                                                {pendingApprovalsCount}
                                            </p>
                                            <p className="text-micro text-slate-400 mt-1 uppercase font-bold">Pending</p>
                                        </div>
                                        {pendingApprovalsCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mb-1" />}
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div className="p-3 sm:p-4 bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-2xl flex flex-col justify-between group hover:border-emerald-200 transition-all">
                                <div className="flex justify-between items-start">
                                    <p className="text-label-caps text-slate-400">
                                        Status
                                    </p>
                                    <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600">
                                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                </div>
                                <div className="mt-3 sm:mt-4">
                                    <p className="text-card-title text-emerald-600 uppercase">Healthy</p>
                                    <p className="text-micro text-slate-400 mt-1 uppercase font-bold">Verified</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </GlassCard>

            <SecurityVerificationModal
                open={isVerificationModalOpen}
                onOpenChange={setIsVerificationModalOpen}
                onVerified={handleVerified}
            />

            <ContributionModal
                isOpen={isContributionModalOpen}
                onClose={() => setIsContributionModalOpen(false)}
            />
        </motion.div>
    )
}
