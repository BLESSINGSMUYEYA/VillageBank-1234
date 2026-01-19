'use client'

import { motion } from 'framer-motion'
import { TrendingUp, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { itemFadeIn } from '@/lib/motions'

import { GlassCard } from '@/components/ui/GlassCard'

export function FinancialOverview() {
    return (
        <motion.div variants={itemFadeIn}>
            <Link href="/analytics" className="group block">
                <GlassCard className="p-7 rounded-[2rem] border-white/20 shadow-xl shadow-emerald-900/5 transition-all group-hover:shadow-2xl group-hover:shadow-emerald-900/10" blur="xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500">
                                <TrendingUp className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-[#1B4332] dark:text-emerald-50">Growth & Analytics</h3>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Performance Intelligence</p>
                            </div>
                        </div>
                        <div className="p-2.5 rounded-full bg-slate-50 dark:bg-white/5 text-slate-300 group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:rotate-45">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                    </div>
                </GlassCard>
            </Link>
        </motion.div>
    )
}
