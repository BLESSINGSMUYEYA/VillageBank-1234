
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
        <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <span className="w-1 h-6 bg-emerald-500 rounded-full" />
                    {t('common.workspace') || 'Workspace'}
                </h3>
            </div>
            <motion.div variants={itemFadeIn}>
                <GlassCard className="flex flex-col p-0 overflow-hidden" hover={false}>
                    <div className="p-5 sm:p-7 border-b border-border/50 flex items-center justify-between bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                                <Zap className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-foreground">
                                    Quick Actions
                                </h2>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t('dashboard.quick_actions') || 'Shortcuts to key tasks'}
                                </p>
                            </div>
                        </div>
                        <div className="zen-label text-muted-foreground">
                            Ready
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/loans/new">
                            <div className="group cursor-pointer bg-white/50 dark:bg-slate-900/50 hover:bg-white/80 dark:hover:bg-slate-800/80 p-6 rounded-2xl transition-all border border-border/50 h-full flex flex-col justify-center shadow-sm hover:shadow-md">
                                <div className="flex items-center gap-4">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                                        <PiggyBank className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg text-foreground">{t('dashboard.apply_loan')}</h3>
                                        <p className="text-xs font-medium text-muted-foreground/60 mt-1">Request capital from your circles</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                        <Link href="/groups">
                            <div className="group cursor-pointer bg-white/50 dark:bg-slate-900/50 hover:bg-white/80 dark:hover:bg-slate-800/80 p-6 rounded-2xl transition-all border border-border/50 h-full flex flex-col justify-center shadow-sm hover:shadow-md">
                                <div className="flex items-center gap-4">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                                        <Users className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg text-foreground">{t('dashboard.manage_groups')}</h3>
                                        <p className="text-xs font-medium text-muted-foreground/60 mt-1">View and manage your networks</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </GlassCard>
            </motion.div>
        </section>
    )
}
