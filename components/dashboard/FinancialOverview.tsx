'use client'

import { motion } from 'framer-motion'
import { TrendingUp, ArrowUpRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { itemFadeIn } from '@/lib/motions'

export function FinancialOverview() {
    const { t } = useLanguage()

    return (
        <motion.div variants={itemFadeIn}>
            <Link href="/analytics" className="group">
                <GlassCard
                    className="relative overflow-hidden p-6 flex items-center justify-between group-hover:bg-blue-500/5 dark:group-hover:bg-banana/5 transition-colors duration-500"
                    hover={true}
                >
                    {/* Background Decorative Elements */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 dark:bg-banana/10 rounded-full blur-3xl group-hover:bg-blue-500/20 dark:group-hover:bg-banana/20 transition-all duration-500" />

                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-banana group-hover:scale-110 transition-transform duration-300">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                                Growth & Analytics
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                            </h3>
                            <p className="text-sm font-medium text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-banana transition-colors">
                                View detailed financial reports and projections
                            </p>
                        </div>
                    </div>


                </GlassCard>
            </Link>
        </motion.div>
    )
}
