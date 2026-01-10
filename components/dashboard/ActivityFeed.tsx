
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Zap } from 'lucide-react'
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
        <section className="space-y-4">
            <motion.div variants={itemFadeIn}>
                <div className="flex items-center justify-between px-1 mb-2">
                    <h3 className="text-lg font-black uppercase tracking-tight text-muted-foreground flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-500" />
                        {t('dashboard.recent_activity')}
                    </h3>
                    <Link href="/activity" className="text-xs font-bold text-blue-600 hover:text-blue-500">View All</Link>
                </div>

                <GlassCard className="flex flex-col p-5 sm:p-6 overflow-hidden" hover={false}>
                    <div className="flex-1 overflow-y-auto max-h-[500px] scrollbar-thin p-2">
                        {recentActivity.length > 0 ? (
                            <div className="space-y-2">
                                {recentActivity.map((activity, i) => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="p-4 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-4 group cursor-pointer"
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:scale-95",
                                            activity.type.includes('LOAN') ? 'bg-blue-600/10 text-blue-500' :
                                                activity.type.includes('CONTRIBUTION') ? 'bg-emerald-600/10 text-emerald-500' :
                                                    'bg-slate-600/10 text-slate-500'
                                        )}>
                                            <span className="font-black text-sm">{(activity.groupTag || activity.groupName).charAt(0).toUpperCase()}</span>
                                        </div>

                                        <div className="flex-1 min-w-0 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-foreground truncate">{activity.description}</p>
                                                <p className="text-[10px] font-medium text-muted-foreground opacity-60">
                                                    {activity.groupTag ? `@${activity.groupTag}` : activity.groupName}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                {activity.amount && (
                                                    <p className="text-sm font-black text-foreground mb-0.5">
                                                        {formatCurrency(activity.amount)}
                                                    </p>
                                                )}
                                                <p className="text-[10px] font-medium text-muted-foreground/40">{new Date(activity.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 opacity-40">
                                <Zap size={40} className="mb-4 text-muted-foreground/50" />
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('dashboard.no_activity_detected')}</p>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </motion.div>
        </section>
    )
}
