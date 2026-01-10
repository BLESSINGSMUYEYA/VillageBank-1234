
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, PiggyBank, Users } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { itemFadeIn } from '@/lib/motions'

export function QuickActions() {
    const { t } = useLanguage()

    return (
        <section className="space-y-4">
            <motion.div variants={itemFadeIn}>
                <div className="flex items-center justify-between px-1 mb-2">
                    <h3 className="text-lg font-black uppercase tracking-tight text-muted-foreground flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-500" />
                        {t('common.workspace') || 'Workspace'}
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
