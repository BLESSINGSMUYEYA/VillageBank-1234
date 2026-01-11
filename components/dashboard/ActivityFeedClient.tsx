'use client'

import { Activity, Banknote, Calendar, CreditCard, Users, Wallet } from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, cn } from '@/lib/utils'
import { staggerContainer, itemFadeIn } from '@/lib/motions'

interface ActivityFeedClientProps {
    activities: any[]
}

export function ActivityFeedClient({ activities }: ActivityFeedClientProps) {
    if (!activities || activities.length === 0) {
        return (
            <div className="text-center py-16 px-4 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-700">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                    <Activity className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-2">No activities yet</h3>
                <p className="text-sm font-medium text-muted-foreground max-w-xs mx-auto">
                    Your financial timeline is empty. Join a group to get started.
                </p>
            </div>
        )
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
        >
            {activities.map((activity) => (
                <motion.div
                    key={activity.id}
                    variants={itemFadeIn}
                    className="group"
                >
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-5 sm:p-6 rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-slate-800 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-900/5 cursor-default relative overflow-hidden">
                        {/* Status Stripe */}
                        <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-1",
                            activity.type.includes('LOAN') ? 'bg-purple-500' :
                                activity.type.includes('CONTRIBUTION') ? 'bg-emerald-500' :
                                    'bg-blue-500'
                        )} />

                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-black/5",
                            activity.type.includes('LOAN') ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' :
                                activity.type.includes('CONTRIBUTION') ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                    'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        )}>
                            {activity.type.includes('LOAN') ? <Banknote className="w-6 h-6" /> :
                                activity.type.includes('CONTRIBUTION') ? <Wallet className="w-6 h-6" /> :
                                    <Users className="w-6 h-6" />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={cn(
                                        "text-[10px] font-black uppercase tracking-wider border-0 h-5 px-2",
                                        activity.type.includes('LOAN') ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' :
                                            activity.type.includes('CONTRIBUTION') ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                                'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                    )}>
                                        {activity.type.replace(/_/g, ' ')}
                                    </Badge>
                                    <span className="text-[10px] font-bold text-muted-foreground/50">
                                        {new Date(activity.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <p className="text-base font-black text-foreground mb-1 leading-snug">
                                {activity.description}
                            </p>

                            <div className="flex items-center gap-2 mt-3">
                                <Badge variant="secondary" className="bg-white dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-lg px-2 py-1 text-[10px] font-bold text-muted-foreground border border-black/5 dark:border-white/5">
                                    @{activity.groupTag || 'community'}
                                </Badge>
                                {activity.groupName && (
                                    <span className="text-[10px] font-medium text-muted-foreground/60 truncate">
                                        {activity.groupName}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-black/5 dark:border-white/5 pt-4 sm:pt-0 mt-2 sm:mt-0 pl-0 sm:pl-6 sm:border-l">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 sm:hidden">Amount</span>
                            {activity.amount && (
                                <div className="text-right">
                                    <span className={cn(
                                        "text-lg font-black block",
                                        activity.type.includes('LOAN') ? 'text-purple-600 dark:text-purple-400' :
                                            activity.type.includes('CONTRIBUTION') ? 'text-emerald-600 dark:text-emerald-400' :
                                                'text-foreground'
                                    )}>
                                        {formatCurrency(activity.amount)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    )
}
