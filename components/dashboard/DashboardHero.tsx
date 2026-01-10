
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { DollarSign, Wallet, Users, ArrowUpRight, ArrowRight, Eye, EyeOff, Shield } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { formatCurrency, cn } from '@/lib/utils'
import { itemFadeIn } from '@/lib/motions'
import { SecurityVerificationModal } from '@/app/(authenticated)/dashboard/SecurityVerificationModal'

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
}

export function DashboardHero({ user, stats, pendingApprovalsCount }: DashboardHeroProps) {
    const { t } = useLanguage()
    const [isContributionsVisible, setIsContributionsVisible] = useState(false)
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)

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
            <div className="zen-card relative overflow-hidden group/hero">

                {/* Ambient Background Glow - Reduced Opacity */}
                <div className="bg-hero-glow opacity-0 group-hover/hero:opacity-50 transition-opacity duration-1000" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-banana/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                {/* Top Identity Section */}
                <div className="relative p-6 sm:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="space-y-3 max-w-2xl">
                            <div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h1 className="text-page-title mb-2">
                                        <span className="text-foreground">{t('common.dashboard')}</span>
                                        <span className="text-blue-600 dark:text-banana">.</span>
                                    </h1>
                                </motion.div>
                                <p className="text-body-primary text-muted-foreground/80 leading-relaxed max-w-xl">
                                    {t('dashboard.welcome')}, <span className="text-foreground font-bold">{user.firstName}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 shrink-0 mt-2 md:mt-0">
                            <Link href="/contributions/new">
                                <div className="relative group rounded-xl shadow-glow-blue transition-shadow">
                                    <Button
                                        size="lg"
                                        className="relative h-11 bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-xl px-6 font-black tracking-wide overflow-hidden shadow-xl shadow-blue-500/20"
                                    >
                                        <div className="bg-shimmer-slide" />
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        {t('dashboard.make_contribution')}
                                    </Button>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Grid - Cleaner Layout (No Dividers) */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border-t border-white/5 bg-white/5 dark:bg-black/10">
                    {/* Total Contributions */}
                    <div className="col-span-2 md:col-span-1 p-4 rounded-xl hover:bg-white/5 transition-colors group cursor-default relative overflow-hidden">
                        <div className="zen-label opacity-60 flex items-center gap-2 mb-2">
                            <Wallet className="w-3.5 h-3.5 text-banana" />
                            {t('dashboard.total_contributions') || 'Savings'}
                        </div>
                        <div className="flex items-center gap-3 relative z-10">
                            <p className="text-3xl sm:text-2xl font-black tracking-tight text-foreground">
                                {isContributionsVisible ? formatCurrency(stats.totalContributions) : '••••••'}
                            </p>
                            <button
                                onClick={handleToggleVisibility}
                                className="text-muted-foreground/40 hover:text-blue-500 transition-colors"
                            >
                                {isContributionsVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>

                    {/* Active Groups */}
                    <div className="p-4 rounded-xl hover:bg-white/5 transition-colors group cursor-default relative overflow-hidden">
                        <div className="zen-label opacity-60 flex items-center gap-2 mb-2">
                            <Users className="w-3.5 h-3.5 text-blue-500" />
                            {t('common.groups') || 'Network'}
                        </div>
                        <p className="text-stat-value text-blue-600 dark:text-blue-400">{stats.totalGroups}</p>
                    </div>

                    {/* Pending Approvals - Conditional */}
                    {isAdminOrTreasurer ? (
                        <Link href="/treasurer/approvals" className="block h-full">
                            <div className="p-4 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer h-full relative overflow-hidden">
                                <div className="zen-label opacity-60 flex items-center gap-2 mb-2">
                                    <ArrowUpRight className={cn("w-3.5 h-3.5", pendingApprovalsCount > 0 ? "text-red-500" : "text-muted-foreground")} />
                                    {t('dashboard.pending_approvals')}
                                </div>
                                <div className="flex items-end justify-between">
                                    <p className={cn("text-stat-value", pendingApprovalsCount > 0 ? "text-red-500" : "text-muted-foreground/50")}>
                                        {pendingApprovalsCount}
                                    </p>
                                    {pendingApprovalsCount > 0 && <ArrowRight className="w-3.5 h-3.5 text-red-500 relative bottom-1" />}
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <div className="p-4 rounded-xl hover:bg-white/5 transition-colors group cursor-default relative overflow-hidden opacity-50">
                            <div className="zen-label opacity-60 flex items-center gap-2 mb-2">
                                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                                Status
                            </div>
                            <p className="text-lg font-black text-emerald-500 tracking-tight">Active</p>
                        </div>
                    )}
                </div>
            </div>

            <SecurityVerificationModal
                open={isVerificationModalOpen}
                onOpenChange={setIsVerificationModalOpen}
                onVerified={handleVerified}
            />
        </motion.div>
    )
}
