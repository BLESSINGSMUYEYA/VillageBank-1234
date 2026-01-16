
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
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
            <div className="zen-card overflow-hidden">
                <div className="p-6 sm:p-8 bg-gradient-to-b from-white/40 to-white/10 dark:from-slate-900/40 dark:to-slate-900/10 border-b border-white/10">
                    {/* Top Identity Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
                        <div className="space-y-3 max-w-2xl">
                            <div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h1 className="text-3xl font-black tracking-tighter mb-2">
                                        <span className="text-foreground">{t('common.dashboard')}</span>
                                        <span className="text-blue-600 dark:text-banana">.</span>
                                    </h1>
                                </motion.div>
                                <p className="text-sm font-medium text-muted-foreground opacity-80 leading-relaxed max-w-xl">
                                    {t('dashboard.welcome')}, <span className="text-foreground font-bold">{user.firstName}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 shrink-0 mt-2 md:mt-0">
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
                                className="relative h-11 bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-xl px-6 font-black tracking-wide shadow-xl shadow-blue-500/20"
                            >
                                <DollarSign className="w-4 h-4 mr-2" />
                                {t('dashboard.make_contribution')}
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid - Simplified & Clean */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {/* Total Contributions */}
                        <div className="col-span-2 p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between group hover:bg-emerald-500/10 transition-colors">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 opacity-70">
                                        {t('dashboard.total_contributions') || 'Savings'}
                                    </p>
                                    <button
                                        onClick={handleToggleVisibility}
                                        className="text-emerald-600/40 hover:text-emerald-600 transition-colors"
                                    >
                                        {isContributionsVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    </button>
                                </div>
                                <p className="text-3xl font-black text-foreground tracking-tight">
                                    {isContributionsVisible ? formatCurrency(stats.totalContributions) : '••••••'}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Wallet className="w-6 h-6 text-emerald-500" />
                            </div>
                        </div>

                        {/* Active Groups */}
                        <div className="col-span-1 p-4 bg-zinc-50/50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-2xl flex flex-col justify-between group hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-70 truncate pr-2">
                                    {t('common.groups')}
                                </p>
                                <Users className="w-4 h-4 text-blue-600 dark:text-banana group-hover:scale-110 transition-transform shrink-0" />
                            </div>
                            <p className="text-2xl font-black text-foreground tracking-tight">{stats.totalGroups}</p>
                        </div>

                        {/* Pending Approvals / Status */}
                        {isAdminOrTreasurer ? (
                            <Link href="/treasurer/approvals" className="block h-full col-span-1">
                                <div className="p-4 bg-zinc-500/5 dark:bg-white/5 border border-zinc-500/10 dark:border-white/5 rounded-2xl flex flex-col justify-between group hover:bg-zinc-500/10 dark:hover:bg-white/10 transition-colors cursor-pointer h-full">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className={cn(
                                            "text-[9px] font-black uppercase tracking-widest opacity-70 truncate pr-2",
                                            pendingApprovalsCount > 0 ? "text-red-500" : "text-muted-foreground"
                                        )}>
                                            {t('dashboard.pending_approvals')}
                                        </p>
                                        <ArrowUpRight className={cn("w-4 h-4 group-hover:scale-110 transition-transform shrink-0", pendingApprovalsCount > 0 ? "text-red-500" : "text-muted-foreground")} />
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <p className={cn("text-2xl font-black tracking-tight", pendingApprovalsCount > 0 ? "text-red-500" : "text-foreground")}>
                                            {pendingApprovalsCount}
                                        </p>
                                        {pendingApprovalsCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div className="col-span-1 p-4 bg-zinc-50/50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-2xl flex flex-col justify-between group">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-70 truncate pr-2">
                                        Status
                                    </p>
                                    <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                                </div>
                                <p className="text-xl font-black text-emerald-500 tracking-tight truncate">Active</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
