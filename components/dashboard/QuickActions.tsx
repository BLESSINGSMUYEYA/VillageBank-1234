'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, PiggyBank, Users, BellRing, ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { itemFadeIn, staggerContainer } from '@/lib/motions'
import { Button } from '@/components/ui/button'

interface QuickActionsProps {
    pendingApprovals?: any[]
    user?: any
}

export function QuickActions({ pendingApprovals = [], user }: QuickActionsProps) {
    const { t } = useLanguage()
    const hasPending = pendingApprovals.length > 0
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'TREASURER' // Simplified check, ideally check group roles

    return (
        <section className="space-y-4">
            <motion.div variants={staggerContainer} initial="initial" animate="animate">
                <div className="flex items-center justify-between px-1 mb-2">
                    <h3 className="text-lg font-black uppercase tracking-tight text-muted-foreground flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-500" />
                        {hasPending ? 'Priority Action' : t('common.workspace') || 'Next Steps'}
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. Smart / Predictive Action Slot */}
                    {hasPending ? (
                        <Link href="/treasurer/approvals">
                            <GlassCard className="group cursor-pointer p-5 sm:p-6 h-full flex flex-col justify-center border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 transition-all" hover={true}>
                                <div className="flex items-center gap-4">
                                    <div className="bg-orange-500/20 p-3 rounded-xl group-hover:scale-95 transition-transform animate-pulse">
                                        <BellRing className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-black text-base text-orange-700 dark:text-orange-300">
                                            {pendingApprovals.length} Pending Requests
                                        </h3>
                                        <p className="text-xs text-orange-600/70 mt-0.5 font-medium">
                                            Requires your approval
                                        </p>
                                    </div>
                                    <Button size="icon" variant="ghost" className="shrink-0 text-orange-500">
                                        <ArrowRight className="w-5 h-5" />
                                    </Button>
                                </div>
                            </GlassCard>
                        </Link>
                    ) : (
                        <Link href="/loans/new">
                            <GlassCard className="group cursor-pointer p-5 sm:p-6 h-full flex flex-col justify-center hover:bg-white/5 transition-all" hover={true}>
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-500/10 p-3 rounded-xl group-hover:scale-95 transition-transform">
                                        <PiggyBank className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base text-foreground">{t('dashboard.apply_loan')}</h3>
                                        <p className="text-xs text-muted-foreground/60 mt-0.5">Request capital</p>
                                    </div>
                                </div>
                            </GlassCard>
                        </Link>
                    )}

                    {/* 2. Standard Action Slot */}
                    <Link href="/groups">
                        <GlassCard className="group cursor-pointer p-5 sm:p-6 h-full flex flex-col justify-center hover:bg-white/5 transition-all" hover={true}>
                            <div className="flex items-center gap-4">
                                <div className="bg-emerald-500/10 p-3 rounded-xl group-hover:scale-95 transition-transform">
                                    <Users className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-foreground">{t('dashboard.manage_groups')}</h3>
                                    <p className="text-xs text-muted-foreground/60 mt-0.5">View your networks</p>
                                </div>
                            </div>
                        </GlassCard>
                    </Link>
                </div>
            </motion.div>
        </section>
    )
}
