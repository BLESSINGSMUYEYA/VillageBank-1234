
'use client'

import { motion } from 'framer-motion'
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
        <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <span className="w-1 h-6 bg-purple-500 rounded-full" />
                    {t('dashboard.recent_activity')}
                </h3>
            </div>
            <motion.div variants={itemFadeIn}>
                <GlassCard className="flex flex-col p-0 overflow-hidden" hover={false}>
                    <div className="p-5 sm:p-7 border-b border-border/50 flex items-center justify-between bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-500/10 rounded-xl">
                                <Zap className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-foreground">
                                    Activity Log
                                </h2>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t('dashboard.activity_desc') || 'Real-time transaction feed'}
                                </p>
                            </div>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse relative">
                                <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75"></span>
                            </span>
                            Updated
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[600px] scrollbar-thin">
                        {recentActivity.length > 0 ? (
                            <div className="divide-y divide-border/20">
                                {recentActivity.map((activity, i) => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="p-5 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-5 group cursor-pointer"
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:scale-105",
                                            activity.type.includes('LOAN') ? 'bg-blue-600 text-white' :
                                                activity.type.includes('CONTRIBUTION') ? 'bg-emerald-600 text-white' :
                                                    'bg-slate-600 text-white'
                                        )}>
                                            <span className="font-black text-lg">{(activity.groupTag || activity.groupName).charAt(0).toUpperCase()}</span>
                                        </div>

                                        <div className="flex-1 min-w-0 flex items-center justify-between">
                                            <div>
                                                <p className="text-base font-black text-foreground truncate">{activity.description}</p>
                                                <p className="text-xs font-bold text-muted-foreground opacity-60 mt-0.5">
                                                    {activity.groupTag ? `@${activity.groupTag}` : activity.groupName}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                {activity.amount && (
                                                    <p className="text-sm font-black text-blue-600 dark:text-banana mb-1">
                                                        {formatCurrency(activity.amount)}
                                                    </p>
                                                )}
                                                <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{new Date(activity.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 opacity-40">
                                <Zap size={48} className="mb-4" />
                                <p className="text-sm font-black uppercase tracking-widest">{t('dashboard.no_activity_detected')}</p>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </motion.div>
        </section>
    )
}
