'use client'

import { useState } from 'react' // [NEW] Link -> useState
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, PiggyBank, Users, BellRing, ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { itemFadeIn, staggerContainer } from '@/lib/motions'
import { Button } from '@/components/ui/button'
import { ContributionModal } from '@/components/contributions/ContributionModal' // [NEW] Import

interface QuickActionsProps {
    pendingApprovals?: any[]
    user?: any
}

export function QuickActions({ pendingApprovals = [], user }: QuickActionsProps) {
    const { t } = useLanguage()
    const hasPending = pendingApprovals.length > 0
    const [isContributionModalOpen, setIsContributionModalOpen] = useState(false) // [NEW] State for modal

    const quickButtons = [
        {
            label: 'Contribute',
            icon: Zap,
            action: () => setIsContributionModalOpen(true), // [NEW] Open modal action
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        {
            label: 'Borrow',
            icon: PiggyBank,
            href: '/loans/new',
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20'
        },
        {
            label: 'Join',
            icon: Users,
            href: '/groups',
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20'
        },
        {
            label: 'More',
            icon: BellRing, // Using a placeholder icon for 'More' or generic grid
            href: '/dashboard', // Placeholder link
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20'
        }
    ]

    return (
        <section className="space-y-4">
            <motion.div variants={staggerContainer} initial="initial" animate="animate">
                <div className="flex items-center justify-between px-1 mb-2">
                    <h3 className="text-lg font-black uppercase tracking-tight text-muted-foreground flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-500" />
                        {t('common.quick_actions') || 'Quick Actions'}
                    </h3>
                </div>

                {/* Priority / Pending Approvals Banner */}
                {hasPending && (
                    <div className="mb-4">
                        <Link href="/treasurer/approvals">
                            <GlassCard className="group cursor-pointer p-4 flex items-center gap-4 border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 transition-all" hover={true}>
                                <div className="bg-orange-500/20 p-2.5 rounded-xl animate-pulse">
                                    <BellRing className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm text-orange-700 dark:text-orange-300">
                                        {pendingApprovals.length} Pending Requests
                                    </h3>
                                    <p className="text-[11px] text-orange-600/70 font-medium">
                                        Action required
                                    </p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
                            </GlassCard>
                        </Link>
                    </div>
                )}

                {/* 4-Column Quick Buttons Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {quickButtons.map((btn, idx) => (
                        // @ts-ignore - Dynamic check for action vs href
                        btn.action ? (
                            <div onClick={btn.action} key={idx} className="cursor-pointer h-full">
                                <GlassCard className={`group cursor-pointer p-4 h-full flex flex-col items-center justify-center gap-3 text-center transition-all hover:bg-white/5 ${btn.border}`} hover={true}>
                                    <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${btn.bg}`}>
                                        <btn.icon className={`w-6 h-6 ${btn.color}`} />
                                    </div>
                                    <span className="text-xs font-bold text-foreground/80 group-hover:text-foreground">
                                        {btn.label}
                                    </span>
                                </GlassCard>
                            </div>
                        ) : (
                            <Link href={btn.href!} key={idx}>
                                <GlassCard className={`group cursor-pointer p-4 h-full flex flex-col items-center justify-center gap-3 text-center transition-all hover:bg-white/5 ${btn.border}`} hover={true}>
                                    <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${btn.bg}`}>
                                        <btn.icon className={`w-6 h-6 ${btn.color}`} />
                                    </div>
                                    <span className="text-xs font-bold text-foreground/80 group-hover:text-foreground">
                                        {btn.label}
                                    </span>
                                </GlassCard>
                            </Link>
                        )
                    ))}
                </div>
            </motion.div>

            {/* [NEW] Contribution Modal */}
            <ContributionModal
                isOpen={isContributionModalOpen}
                onClose={() => setIsContributionModalOpen(false)}
            />
        </section>
    )
}
