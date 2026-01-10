
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
        <section className="space-y-4">
            <motion.div variants={itemFadeIn}>
                <div className="flex items-center justify-between px-1 mb-2">
                    <h3 className="text-lg font-black uppercase tracking-tight text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        {t('dashboard.growth_and_analytics') || 'Growth & Analytics'}
                    </h3>
                </div>

                <GlassCard className="flex flex-col p-5 sm:p-6 overflow-hidden" hover={false}>
                    <div className="rounded-2xl overflow-hidden bg-white/5 dark:bg-black/20 backdrop-blur-3xl min-h-[400px]">
                        {charts}
                    </div>
                </GlassCard>
            </motion.div>
        </section>
    )
}
