'use client'

import { motion } from 'framer-motion'
import { Plus, Video, TrendingUp, Play, Square, Activity, Heart, Clock, Calendar, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { fadeIn } from '@/lib/motions'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { toast } from 'sonner'
import { CreateReminderDialog } from './CreateReminderDialog'

import { GlassCard } from '@/components/ui/GlassCard'
import { Reminder } from '@prisma/client'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface DashboardWidgetsProps {
    stats: {
        loanRepaymentProgress: number
    }
    reminders?: Reminder[]
    userId?: string
}

export function DashboardWidgets({ stats, reminders = [], userId = '' }: DashboardWidgetsProps) {
    const { t } = useLanguage()
    const progress = Math.min(100, Math.max(0, stats?.loanRepaymentProgress || 0))
    const nextReminder = reminders.length > 0 ? reminders[0] : null

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Reminders Widget */}
            <motion.div variants={fadeIn}>
                <GlassCard className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 flex flex-col justify-between min-h-[280px] sm:min-h-[320px] h-full border-slate-200/60 dark:border-white/5 bg-white/60 dark:bg-white/5" blur="xl">
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-6 sm:mb-8">
                            <h3 className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('dashboard.reminders')}</h3>
                            <CreateReminderDialog userId={userId} />
                        </div>

                        {nextReminder ? (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-lg sm:text-xl font-black text-main line-clamp-2">{nextReminder.title}</h4>
                                    <div className="flex items-center gap-2 text-slate-500 mt-2">
                                        <Calendar className="w-3.5 h-3.5 text-banana" />
                                        <p className="text-xs font-medium">
                                            {new Date(nextReminder.datetime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </p>
                                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        <p className="text-xs font-medium">
                                            {new Date(nextReminder.datetime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                {nextReminder.description && (
                                    <p className="text-xs text-slate-400 line-clamp-2 bg-white/50 dark:bg-white/5 p-3 rounded-xl">
                                        {nextReminder.description}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 opacity-60">
                                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center mb-2">
                                    <CheckCircle2 className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="text-sm font-bold text-slate-500">{t('dashboard.all_caught_up')}</p>
                                <p className="text-[10px] uppercase tracking-wide text-slate-400">{t('dashboard.no_upcoming_events')}</p>
                            </div>
                        )}
                    </div>

                    {nextReminder?.link ? (
                        <a href={nextReminder.link} target="_blank" rel="noopener noreferrer" className="block w-full mt-4">
                            <Button
                                className="w-full bg-main hover:bg-main/90 text-white rounded-2xl sm:rounded-[1.25rem] py-6 sm:py-8 font-bold flex gap-3 h-14 sm:h-16 shadow-xl shadow-emerald-900/20 group transition-all active:scale-95"
                            >
                                <Video className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                {t('dashboard.join_meeting')}
                            </Button>
                        </a>
                    ) : (
                        <Button
                            disabled
                            className="w-full mt-4 bg-slate-200 dark:bg-white/5 text-slate-400 rounded-2xl sm:rounded-[1.25rem] py-6 sm:py-8 font-bold flex gap-3 h-14 sm:h-16 shadow-none cursor-not-allowed border border-dashed border-slate-300 dark:border-white/10"
                        >
                            <Calendar className="w-5 h-5 opacity-50" />
                            {t('dashboard.no_action_required')}
                        </Button>
                    )}
                </GlassCard>
            </motion.div>

            {/* Combined Metrics View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Loan Progress */}
                <motion.div variants={fadeIn}>
                    <GlassCard className="p-6 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 flex flex-col justify-between min-h-[280px] sm:min-h-[320px] h-full border-slate-200/60 dark:border-white/5 bg-white/60 dark:bg-white/5" blur="xl">
                        <h3 className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('dashboard.loan_health')}</h3>
                        <div className="flex flex-col items-center justify-center space-y-4 py-4">
                            <div className="relative">
                                <ProgressRing
                                    radius={45}
                                    stroke={5}
                                    progress={progress}
                                    indicatorClassName="stroke-emerald-600"
                                    trackClassName="stroke-emerald-100/50"
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl sm:text-2xl font-black text-main">{progress}%</span>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('dashboard.repaid')}</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-emerald-700">{t('dashboard.healthy_standing')}</p>
                                <p className="text-[9px] text-slate-400 font-medium">{t('dashboard.on_track')}</p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Pulse Health - System Score */}
                <motion.div variants={fadeIn} className="hidden md:block">
                    <GlassCard className="bg-[#1B4332] dark:bg-emerald-950 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-emerald-900/20 overflow-hidden relative group min-h-[280px] sm:min-h-[320px] h-full border-none ring-1 ring-white/10" blur="xl" hover={true} gradient={false}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-banana/20 rounded-full blur-[60px]" />
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div>
                                <div className="flex items-center gap-2 mb-6 sm:mb-8">
                                    <Activity className="w-4 h-4 text-banana animate-pulse" />
                                    <h3 className="text-banana/80 text-[10px] font-bold uppercase tracking-[0.2em]">{t('dashboard.pulse_health')}</h3>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-3xl sm:text-4xl font-black text-white tracking-tighter">9.8</div>
                                    <p className="text-[10px] font-bold text-banana uppercase tracking-widest">{t('dashboard.system_score')}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-1 rounded-full bg-white/10 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "98%" }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="h-full bg-banana"
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-white/40">{t('dashboard.perfect')}</span>
                                </div>
                                <p className="text-[10px] text-emerald-100/60 font-medium leading-tight">
                                    {t('dashboard.optimal_state')}
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    )
}
