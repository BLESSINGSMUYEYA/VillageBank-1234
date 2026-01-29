'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Zap, PiggyBank, Users } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { itemFadeIn } from '@/lib/motions'
import { ContributionModal } from '@/components/contributions/ContributionModal'
import { JoinGroupQR } from '@/components/groups/JoinGroupQR'

interface QuickActionsProps {
    pendingApprovals?: any[]
    user?: any
}

export function QuickActions({ pendingApprovals = [], user }: QuickActionsProps) {
    const { t } = useLanguage()
    const [isContributionModalOpen, setIsContributionModalOpen] = useState(false)

    const actions = [
        { label: t('dashboard.action_contribute'), icon: Zap, action: () => setIsContributionModalOpen(true) },
        { label: t('dashboard.action_borrow'), icon: PiggyBank, href: '/loans/new' },
        { label: t('dashboard.action_join'), icon: Users, href: '/groups' },
        { label: t('dashboard.action_create'), icon: Plus, href: '/groups/new' }
    ]

    return (
        <motion.div variants={itemFadeIn} className="w-full">
            <GlassCard
                className="p-3 sm:p-4 rounded-[2rem] border-white/20 shadow-xl shadow-emerald-900/5 bg-white/40 dark:bg-white/5"
                blur="md"
            >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    {/* Title with Plus Icon */}
                    <div className="flex items-center gap-2 px-2 sm:px-4 py-2 sm:border-r border-slate-200/50 dark:border-white/10 sm:pr-6">
                        <div className="w-6 h-6 shrink-0 rounded-full bg-emerald-500 flex items-center justify-center">
                            <Plus className="w-3.5 h-3.5 text-white stroke-[3px]" />
                        </div>
                        <span className="text-[11px] font-bold text-[#1B4332] uppercase tracking-[0.15em] whitespace-nowrap">
                            {t('dashboard.quick_actions')}
                        </span>
                    </div>

                    {/* Compact Pill Buttons */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {actions.map((btn, idx) => {
                            const commonStyles = "flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-white/80 dark:bg-white/10 border border-slate-100 dark:border-white/5 hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all group min-w-[100px] sm:min-w-0"
                            const Icon = btn.icon
                            const innerContent = (
                                <>
                                    <Icon className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                                    <span className="text-xs font-bold text-[#1B4332] dark:text-emerald-50 whitespace-nowrap">{btn.label}</span>
                                </>
                            )

                            // Special handling for Join button to use the scanner
                            if (btn.label === 'Join') {
                                return (
                                    <JoinGroupQR key={idx}>
                                        <button className={commonStyles}>
                                            {innerContent}
                                        </button>
                                    </JoinGroupQR>
                                )
                            }

                            return btn.action ? (
                                <button key={idx} onClick={btn.action} className={commonStyles}>
                                    {innerContent}
                                </button>
                            ) : (
                                <Link key={idx} href={btn.href!} className={commonStyles}>
                                    {innerContent}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </GlassCard>

            <ContributionModal
                isOpen={isContributionModalOpen}
                onClose={() => setIsContributionModalOpen(false)}
            />
        </motion.div>
    )
}
