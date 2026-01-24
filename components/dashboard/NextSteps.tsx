'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, ArrowRight, UserPlus, Wallet, Settings } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { fadeIn, staggerContainer } from '@/lib/motions'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface NextStepsProps {
  user: {
    firstName: string | null
    lastName: string | null
  }
  stats: {
    totalGroups: number
    totalContributions: number
  }
}

export function NextSteps({ user, stats }: NextStepsProps) {
  const { t } = useLanguage()
  const steps = [
    {
      title: 'Complete your Profile',
      description: 'Ensure your account details are up to date.',
      icon: UserPlus,
      completed: !!(user.firstName && user.lastName),
      action: 'Edit Profile',
      href: '/profile'
    },
    {
      title: 'Join or Create a Group',
      description: 'Start participating in a village bank.',
      icon: Settings,
      completed: stats.totalGroups > 0,
      action: 'Browse Groups',
      href: '/groups'
    },
    {
      title: 'Make a Contribution',
      description: 'Record your first savings entry.',
      icon: Wallet,
      completed: stats.totalContributions > 0,
      action: 'Record Now',
      href: '/vault'
    }
  ]

  const completedCount = steps.filter(s => s.completed).length
  const allCompleted = completedCount === steps.length
  const progressPercentage = (completedCount / steps.length) * 100

  return (
    <section className="space-y-6 w-full">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
          {allCompleted ? 'Pulse Insights' : 'Onboarding Progress'}
        </h3>
        <div className="flex items-center gap-3">
          {!allCompleted && (
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
              {completedCount}/{steps.length} COMPLETED
            </span>
          )}
          {allCompleted && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Optimization</span>
            </div>
          )}
        </div>
      </div>

      <motion.div
        variants={fadeIn}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <GlassCard
          className="rounded-[2.5rem] border-slate-200/60 dark:border-white/5 overflow-hidden relative shadow-2xl shadow-emerald-900/5 bg-white/60 dark:bg-white/5"
          blur="xl"
          hover={false}
        >
          {allCompleted ? (
            /* Smart Insights View */
            <div className="p-6 sm:p-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 text-center md:text-left">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[2rem] bg-[#1B4332] flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-900/40 shrink-0">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div className="flex-1 space-y-1 sm:space-y-2">
                <h4 className="text-lg sm:text-xl font-black text-[#1B4332]">System Fully Optimized</h4>
                <p className="text-[13px] sm:text-sm font-medium text-slate-500 max-w-xl">
                  You've completed all essential setup steps. Your "Pulse" is now reflecting real-time group health and financial metrics.
                </p>
              </div>
              <Link
                href="/analytics"
                className="w-full md:w-auto h-11 sm:h-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-300 hover:text-emerald-600 px-6 sm:px-8 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-sm transition-all shadow-sm group"
              >
                View Analytics
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            /* Standard Onboarding View */
            <>
              <div className="px-8 pt-8">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Setup {Math.round(progressPercentage)}%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Next Milestone: Optimized Pulse</span>
                </div>
                <div className="w-full h-2 bg-slate-100/50 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-[#1B4332] shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  />
                </div>
              </div>

              <div className="divide-y divide-white/10 mt-6 bg-white/30 dark:bg-black/5">
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-start sm:items-center gap-4 sm:gap-6 p-5 sm:p-8 transition-all relative group ${step.completed ? 'opacity-40 grayscale' : 'hover:bg-white/40'}`}
                  >
                    <div className="shrink-0">
                      {step.completed ? (
                        <div className="w-8 h-8 rounded-xl sm:rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={`text-base font-black mb-0.5 transition-all ${step.completed ? 'text-slate-500 line-through decoration-emerald-500/40' : 'text-[#1B4332]'}`}>
                        {step.title}
                      </h4>
                      <p className="text-xs font-medium text-slate-500 max-w-md">
                        {step.description}
                      </p>
                    </div>

                    {!step.completed && (
                      <div className="shrink-0 hidden sm:flex items-center">
                        <Link
                          href={step.href}
                          className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-[11px] font-black px-6 py-3 rounded-2xl transition-all shadow-xl shadow-emerald-900/10 flex items-center gap-2 group/btn active:scale-95"
                        >
                          {step.action}
                          <ArrowRight className="w-3.5 h-3.5 translate-x-0 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    )}

                    {!step.completed && (
                      <Link href={step.href} className="absolute inset-0 sm:hidden z-10" />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </GlassCard>
      </motion.div>
    </section>
  )
}
