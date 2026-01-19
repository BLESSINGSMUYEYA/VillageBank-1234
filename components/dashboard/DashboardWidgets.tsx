'use client'

import { motion } from 'framer-motion'
import { Plus, Video, TrendingUp, Play, Square, Activity, Heart, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { fadeIn } from '@/lib/motions'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { toast } from 'sonner'

import { GlassCard } from '@/components/ui/GlassCard'

interface DashboardWidgetsProps {
    stats: {
        loanRepaymentProgress: number
    }
}

export function DashboardWidgets({ stats }: DashboardWidgetsProps) {
    const progress = Math.min(100, Math.max(0, stats?.loanRepaymentProgress || 0))

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Reminders Widget */}
            <motion.div variants={fadeIn}>
                <GlassCard className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 flex flex-col justify-between min-h-[280px] sm:min-h-[320px] h-full border-white/20" blur="xl">
                    <div>
                        <h3 className="text-[10px] sm:text-[11px] font-bold text-slate-400 mb-6 sm:mb-8 uppercase tracking-[0.2em]">Reminders</h3>
                        <div className="space-y-2">
                            <h4 className="text-lg sm:text-xl font-black text-main">Monthly Meeting</h4>
                            <div className="flex items-center gap-2 text-slate-500">
                                <Clock className="w-3.5 h-3.5 text-banana" />
                                <p className="text-xs font-medium">02.00 pm - 04.00 pm</p>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={() => toast.info('Meeting Feature', { description: 'The video conferencing feature is coming in a future update.' })}
                        className="w-full bg-main hover:bg-main/90 text-white rounded-2xl sm:rounded-[1.25rem] py-6 sm:py-8 font-bold flex gap-3 h-14 sm:h-16 shadow-xl shadow-emerald-900/20 group transition-all active:scale-95"
                    >
                        <Video className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Start Meeting
                    </Button>
                </GlassCard>
            </motion.div>

            {/* Combined Metrics View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Loan Progress */}
                <motion.div variants={fadeIn}>
                    <GlassCard className="p-6 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 flex flex-col justify-between min-h-[280px] sm:min-h-[320px] h-full border-white/20 bg-gradient-to-br from-white/40 to-emerald-50/10" blur="xl">
                        <h3 className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Loan Health</h3>
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
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Repaid</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-emerald-700">Healthy Standing</p>
                                <p className="text-[9px] text-slate-400 font-medium">On track with schedule</p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Pulse Health - System Score */}
                <motion.div variants={fadeIn}>
                    <GlassCard className="bg-main p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-emerald-900/20 overflow-hidden relative group min-h-[280px] sm:min-h-[320px] h-full" blur="xl" hover={true} gradient={false}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-banana/20 rounded-full blur-[60px]" />
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div>
                                <div className="flex items-center gap-2 mb-6 sm:mb-8">
                                    <Activity className="w-4 h-4 text-banana animate-pulse" />
                                    <h3 className="text-banana/80 text-[10px] font-bold uppercase tracking-[0.2em]">Pulse Health</h3>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-3xl sm:text-4xl font-black text-white tracking-tighter">9.8</div>
                                    <p className="text-[10px] font-bold text-banana uppercase tracking-widest">System Score</p>
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
                                    <span className="text-[10px] font-black text-white/40">PERFECT</span>
                                </div>
                                <p className="text-[10px] text-emerald-100/60 font-medium leading-tight">
                                    Your activities are in optimal state.
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    )
}
