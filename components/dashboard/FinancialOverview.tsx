
'use client'

import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { itemFadeIn } from '@/lib/motions'

interface FinancialOverviewProps {
    charts: React.ReactNode
}

export function FinancialOverview({ charts }: FinancialOverviewProps) {
    const { t } = useLanguage()

    return (
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
                        <div className="zen-label text-muted-foreground flex items-center gap-2">
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
    )
}
