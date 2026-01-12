'use client'

import React from 'react' // Explicitly import React
import { Button } from '@/components/ui/button'
import { Users, DollarSign, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions'
import { GlassCard } from '@/components/ui/GlassCard'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

export default function Home() {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-blue-500/30 overflow-x-hidden font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[100px] animate-pulse-slow delay-700" />
                <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-banana/10 dark:bg-banana/20 rounded-full blur-[110px] animate-pulse-slow delay-1000" />
            </div>

            <div className="relative z-10">
                <MarketingHeader />

                <main className="container mx-auto px-6 pt-12 pb-24">
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        className="text-center space-y-8 mb-32"
                    >
                        {/* Hero Badge */}
                        <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/5 dark:bg-white/5 border border-blue-600/10 dark:border-white/10 backdrop-blur-md">
                            <Sparkles className="w-4 h-4 text-blue-600 dark:text-banana" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-banana">{t('landing.hero_badge')}</span>
                        </motion.div>

                        {/* Main Title */}
                        <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] max-w-5xl mx-auto">
                            {t('landing.main_title')}
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p variants={fadeIn} className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-bold leading-relaxed">
                            {t('landing.subtitle')}
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link href="/register" className="w-full sm:w-auto">
                                <Button className="w-full sm:w-auto h-16 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all group">
                                    {t('landing.start_moving')}
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/login" className="w-full sm:w-auto">
                                <Button variant="outline" className="w-full sm:w-auto h-16 px-12 rounded-2xl border-2 border-slate-200 dark:border-white/10 dark:bg-white/5 font-black text-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
                                    {t('landing.access_ledger')}
                                </Button>
                            </Link>
                        </motion.div>

                        {/* Stats Preview */}
                        <motion.div variants={fadeIn} className="pt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            {[
                                { label: t('landing.active_members'), value: '100' },
                                { label: t('landing.managed_capital'), value: 'MWK 25M' },
                                { label: t('landing.success_rate'), value: '99.8%' },
                                { label: t('landing.community_groups'), value: '7+' },
                            ].map((stat, i) => (
                                <div key={i} className="space-y-1">
                                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Features Grid */}
                    <div className="mb-20">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">{t('landing.features_title')}</h2>
                        </div>
                        <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto"
                        >
                            {[
                                {
                                    icon: Users,
                                    title: t('landing.circle_mgt'),
                                    desc: t('landing.circle_mgt_desc'),
                                    color: 'bg-blue-500'
                                },
                                {
                                    icon: DollarSign,
                                    title: t('landing.liquidity'),
                                    desc: t('landing.liquidity_desc'),
                                    color: 'bg-emerald-500'
                                },
                                {
                                    icon: TrendingUp,
                                    title: t('landing.staking'),
                                    desc: t('landing.staking_desc'),
                                    color: 'bg-indigo-500'
                                }
                            ].map((feature, i) => (
                                <motion.div key={i} variants={itemFadeIn}>
                                    <GlassCard className="h-full p-10 flex flex-col items-center text-center group" hover={true}>
                                        <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-inner group-hover:rotate-6 transition-transform", feature.color)}>
                                            <feature.icon className="w-10 h-10 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{feature.title}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                                            {feature.desc}
                                        </p>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Trust Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-40 space-y-16"
                    >
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{t('landing.trust_title')}</h2>
                            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-bold">
                                {t('landing.trust_desc')}
                            </p>
                        </div>
                    </motion.div>

                    {/* Registration CTA */}
                    <div className="mt-40">
                        <GlassCard className="p-12 sm:p-20 border-none bg-slate-900 dark:bg-white relative overflow-hidden" hover={false}>
                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-48 -mt-48" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -ml-32 -mb-32" />

                            <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                                <h2 className="text-4xl sm:text-6xl font-black text-white dark:text-slate-950 tracking-tighter">{t('landing.cta_title')}</h2>
                                <p className="text-lg text-slate-400 dark:text-slate-600 max-w-xl font-bold">
                                    {t('landing.cta_desc')}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                    <Link href="/register" className="w-full sm:w-auto">
                                        <Button className="h-16 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-2xl hover:scale-105 transition-all w-full">
                                            {t('landing.create_first_group')}
                                        </Button>
                                    </Link>
                                    <Link href="/login" className="w-full sm:w-auto">
                                        <Button variant="outline" className="h-16 px-12 rounded-2xl border-white/20 dark:border-slate-950/20 text-white dark:text-slate-950 font-black text-lg hover:bg-white/10 dark:hover:bg-slate-950/5 transition-all w-full">
                                            {t('landing.member_login')}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </main>

                <MarketingFooter />
            </div>
        </div>
    )
}

