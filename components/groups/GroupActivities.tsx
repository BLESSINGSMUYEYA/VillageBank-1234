'use client'

import { Activity, Banknote, Calendar, ChevronsUp, User, Users, Wallet } from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { formatDateTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency } from '@/lib/utils'

interface GroupActivitiesProps {
    activities: any[]
}

const staggerContainer = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemFadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 }
}

export default function GroupActivities({ activities }: GroupActivitiesProps) {
    if (!activities || activities.length === 0) {
        return (
            <div className="text-center py-12 px-4 rounded-3xl bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-700">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-section-title text-foreground mb-2">No activities yet</h3>
                <p className="text-body-primary text-muted-foreground max-w-xs mx-auto">
                    Recent group events will be listed here.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {activities.map((activity, i) => (
                <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group"
                >
                    <div className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                            activity.actionType.includes('LOAN') ? 'bg-purple-100 text-purple-600' :
                                activity.actionType.includes('CONTRIBUTION') ? 'bg-emerald-100 text-emerald-600' :
                                    'bg-blue-100 text-blue-600'
                        )}>
                            {activity.actionType.includes('LOAN') ? <Banknote className="w-5 h-5" /> :
                                activity.actionType.includes('CONTRIBUTION') ? <Wallet className="w-5 h-5" /> :
                                    <Users className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <Badge variant="outline" className="text-tab-label border-0 bg-slate-100 dark:bg-slate-700/50 text-slate-500">
                                    {activity.actionType.replace('_', ' ')}
                                </Badge>
                                <span className="text-micro font-bold text-muted-foreground opacity-60">
                                    {new Date(activity.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-body-primary font-black text-foreground mb-1">
                                {activity.description}
                                {activity.amount && (
                                    <span className="ml-2 text-blue-600 dark:text-banana">
                                        {formatCurrency(activity.amount)}
                                    </span>
                                )}
                            </p>
                            <p className="text-micro font-bold text-muted-foreground opacity-70 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                {activity.userName}
                            </p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
