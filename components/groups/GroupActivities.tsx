'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, Activity } from 'lucide-react'
import { formatDateTime, cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { staggerContainer, itemFadeIn } from '@/lib/motions'

interface GroupActivitiesProps {
    activities: any[]
}

export default function GroupActivities({ activities }: GroupActivitiesProps) {
    if (!activities || activities.length === 0) {
        return (
            <GlassCard className="p-12 text-center" hover={false}>
                <div className="w-20 h-20 bg-slate-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Activity className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-2">No Activities Yet</h3>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                    Recent activities within this group will appear here. Start contributing or applying for loans!
                </p>
            </GlassCard>
        )
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 p-6 sm:p-10"
        >
            <div className="space-y-4">
                {activities.map((activity, index) => (
                    <motion.div key={activity.id} variants={itemFadeIn}>
                        <GlassCard className="p-6 relative overflow-hidden group" hover={true}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                                        <Activity className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-black text-foreground tracking-tight">
                                                {activity.actionType.replace(/_/g, ' ')}
                                            </span>
                                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-blue-500/20 text-blue-600 bg-blue-500/5 px-2 py-0.5 rounded-md">
                                                Event
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground font-bold leading-relaxed pr-4">
                                            {activity.description}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-muted-foreground pt-1">
                                            <div className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5" />
                                                {activity.user.ubankTag ? `@${activity.user.ubankTag}` : `${activity.user.firstName} ${activity.user.lastName}`}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDateTime(new Date(activity.createdAt))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}
