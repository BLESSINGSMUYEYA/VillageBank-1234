
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Zap, ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { formatCurrency, cn } from '@/lib/utils'
import { itemFadeIn } from '@/lib/motions'

interface ActivityFeedProps {
    recentActivity: any[]
}

export function ActivityFeed({ recentActivity }: ActivityFeedProps) {
    const { t } = useLanguage()

    return (
        <section className="space-y-6">
            <motion.div variants={itemFadeIn}>
                <div className="flex items-center justify-between px-1 mb-6">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        {t('dashboard.recent_activity')}
                    </h3>
                    <Link href="/activity" className="group flex items-center gap-1.5 text-[10px] font-black text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest">
                        View All
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                <GlassCard className="rounded-[2.5rem] p-8 shadow-2xl shadow-emerald-900/5 overflow-hidden border-white/20" blur="xl" hover={false}>
                    <div className="space-y-6 max-h-[440px] overflow-y-auto no-scrollbar pr-2">
                        {recentActivity.length > 0 ? (
                            <div className="space-y-2">
                                {recentActivity.map((activity, i) => {
                                    const isNew = i < 3; // Mocking "new" status for first 3 items
                                    return (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 + 0.2 }}
                                            className="flex items-center gap-5 group p-4 rounded-3xl hover:bg-emerald-50/50 dark:hover:bg-white/5 transition-all cursor-pointer relative"
                                        >
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all border border-white/20 relative",
                                                activity.type.includes('LOAN') ? 'bg-emerald-50 text-emerald-600' :
                                                    activity.type.includes('CONTRIBUTION') ? 'bg-emerald-50 text-emerald-600' :
                                                        'bg-slate-50 text-slate-500'
                                            )}>
                                                <span className="font-black text-sm">{(activity.groupTag || activity.groupName).charAt(0).toUpperCase()}</span>
                                                {isNew && (
                                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-bold text-[#1B4332] truncate group-hover:text-emerald-700 transition-colors">
                                                        {activity.description}
                                                    </p>
                                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight mt-0.5">
                                                        {activity.groupTag ? `@${activity.groupTag}` : activity.groupName} • {new Date(activity.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    {activity.amount && (
                                                        <p className="text-[13px] font-black text-[#1B4332] tabular-nums">
                                                            {formatCurrency(activity.amount)}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center justify-end gap-1 mt-0.5">
                                                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                                        <span className="text-[9px] font-bold text-emerald-600/80 uppercase tracking-tighter">Success</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 space-y-4 opacity-40">
                                <div className="p-4 rounded-full bg-slate-50">
                                    <Zap className="w-8 h-8 text-slate-300" />
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('dashboard.no_activity_detected')}</p>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </motion.div>
        </section>
    )
}
