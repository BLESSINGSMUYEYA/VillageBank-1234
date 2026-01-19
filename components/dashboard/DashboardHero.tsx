
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
                className="overflow-hidden p-0 rounded-[2.5rem] border-white/20 shadow-2xl shadow-emerald-900/5"
                blur="xl"
                hover={false}
            >
                <div className="p-5 sm:p-10 bg-gradient-to-br from-white/60 via-white/40 to-emerald-50/20 dark:from-slate-900/60 dark:to-emerald-900/10">
                    {/* Top Identity Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div className="space-y-4 max-w-2xl">
                            <div className="space-y-1">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                >
                                    <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-main">
                                        {t('common.dashboard')}
                                        <span className="text-banana">.</span>
                                    </h1>
                                </motion.div>
                                <p className="text-sm sm:text-base font-medium text-slate-500 leading-relaxed max-w-xl">
                                    {t('dashboard.welcome')}, <span className="text-main font-black">{user.firstName}</span>
                                </p>
                            </div>
                        </div>

                        <div className="w-full md:w-auto shrink-0">
                            <Button
                                size="lg"
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
                                className="w-full md:w-auto h-12 rounded-2xl px-8 font-bold tracking-wide shadow-xl group/btn transition-all active:scale-95"
                            >
                                <DollarSign className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                <span className="whitespace-nowrap">{t('dashboard.make_contribution')}</span>
                                <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid - Premium Layout */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {/* Total Contributions - Large Card */}
                        <div className="col-span-2 p-3 sm:p-4 bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-2xl sm:rounded-3xl flex items-center justify-between group hover:border-emerald-200 hover:shadow-lg transition-all">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                        {t('dashboard.total_contributions') || 'Total Savings'}
                                    </p>
                                    <button
                                        onClick={handleToggleVisibility}
                                        className="text-slate-300 hover:text-emerald-600 transition-colors p-1"
                                    >
                                        {isContributionsVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <p className="text-xl sm:text-3xl font-black text-main tracking-tighter">
                                    {isContributionsVisible ? formatCurrency(stats.totalContributions) : '••••••'}
                                </p>
                            </div>
                            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm">
                                <Wallet className="w-5 h-5 sm:w-8 sm:h-8 text-emerald-600" />
                            </div>
                        </div>

                        {/* Active Groups */}
                        <div className="p-3 sm:p-4 bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-2xl sm:rounded-3xl flex flex-col justify-between group hover:border-emerald-200 transition-all">
                            <div className="flex justify-between items-start">
                                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                    {t('common.groups')}
                                </p>
                                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:text-emerald-600 transition-colors">
                                    <Users className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                                </div>
                            </div>
                            <div className="mt-3 sm:mt-4">
                                <p className="text-lg sm:text-2xl font-black text-main tracking-tight">{stats.totalGroups}</p>
                                <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 mt-1 uppercase">Memberships</p>
                            </div>
                        </div>

                        {/* Status / Approvals */}
                        {isAdminOrTreasurer ? (
                            <Link href="/treasurer/approvals" className="block h-full group">
                                <div className="p-3 sm:p-4 bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-2xl sm:rounded-3xl flex flex-col justify-between h-full hover:border-emerald-200 transition-all relative overflow-hidden">
                                    {pendingApprovalsCount > 0 && (
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-3xl" />
                                    )}
                                    <div className="flex justify-between items-start">
                                        <p className={cn(
                                            "text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]",
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
                                            <p className={cn("text-lg sm:text-2xl font-black tracking-tight", pendingApprovalsCount > 0 ? "text-red-500" : "text-main")}>
                                                {pendingApprovalsCount}
                                            </p>
                                            <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 mt-1 uppercase">Pending</p>
                                        </div>
                                        {pendingApprovalsCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mb-1" />}
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div className="p-3 sm:p-4 bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-2xl sm:rounded-3xl flex flex-col justify-between group hover:border-emerald-200 transition-all">
                                <div className="flex justify-between items-start">
                                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                        Status
                                    </p>
                                    <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600">
                                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                </div>
                                <div className="mt-3 sm:mt-4">
                                    <p className="text-base sm:text-2xl font-black text-emerald-600 tracking-tight uppercase">Healthy</p>
                                    <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 mt-1 uppercase">Verified</p>
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
