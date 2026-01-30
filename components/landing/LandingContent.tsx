'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Users, DollarSign, TrendingUp, ArrowRight, Sparkles, ShieldCheck, Eye, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions'
import { GlassCard } from '@/components/ui/GlassCard'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export function LandingContent() {
    const { t } = useLanguage()

    const stats = [
        { label: 'Active Members', value: '100' },
        { label: 'Managed Capital', value: 'MWK 25M' },
        { label: 'Success Rate', value: '99.8%' },
        { label: 'Community Groups', value: '7+' },
    ]

    const features = [
        {
            icon: Users,
            title: 'Circle Management',
            desc: 'Organize and manage your village banking groups with ease.',
            color: 'bg-emerald-500'
        },
        {
            icon: DollarSign,
            title: 'Liquidity',
            desc: 'Access loans and manage contributions seamlessly.',
            color: 'bg-teal-500'
        },
        {
            icon: TrendingUp,
            title: 'Staking',
            desc: 'Grow your savings with transparent interest tracking.',
            color: 'bg-green-500'
        }
    ]

    return (
        <main className="container mx-auto px-6 pt-12 pb-24">
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                viewport={{ once: true }}
                className="text-center space-y-8 mb-32"
            >
                {/* Hero Badge */}
                <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600/5 dark:bg-white/5 border border-emerald-600/10 dark:border-white/10 backdrop-blur-md">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">{t('landing.hero_badge')}</span>
                </motion.div>

                {/* Main Title */}
                <motion.h1 variants={fadeIn} className="text-page-title text-slate-900 dark:text-white max-w-5xl mx-auto">
                    {t('landing.main_title')}
                    <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">.</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p variants={fadeIn} className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-bold leading-relaxed">
                    {t('landing.subtitle')}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                    <Link href="/register" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-lg shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] transition-all border border-emerald-400/20 group">
                            {t('landing.start_moving')}
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link href="/login" className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto h-16 px-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm font-bold text-lg text-slate-700 dark:text-white hover:bg-white/80 dark:hover:bg-white/10 transition-all hover:scale-[1.02]">
                            {t('landing.access_ledger')}
                        </Button>
                    </Link>
                </motion.div>

                {/* Stats Preview */}
                <motion.div variants={fadeIn} className="pt-20 max-w-5xl mx-auto">
                    <GlassCard className="p-8 border-white/20 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md" hover={false}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, i) => (
                                <div key={i} className="space-y-1">
                                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>
            </motion.div>

            {/* Features Grid */}
            <div className="mb-32">
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
                    {features.map((feature, i) => (
                        <motion.div key={i} variants={itemFadeIn}>
                            <GlassCard className="h-full p-10 flex flex-col items-center text-center group" hover={true} variant="premium">
                                <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-inner group-hover:rotate-6 transition-transform", feature.color)}>
                                    <feature.icon className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-card-title text-2xl mb-4">{feature.title}</h3>
                                <p className="text-body-primary text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* University / Floating Ledger Section */}
            <div className="mb-40 relative">
                <div className="absolute inset-0 bg-emerald-600/5 dark:bg-white/5 skew-y-3 transform -z-10 rounded-[3rem]" />
                <div className="py-24 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-16 max-w-7xl mx-auto">
                    <div className="md:w-1/2 space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-black text-xs uppercase tracking-widest border border-emerald-200 dark:border-emerald-800">
                            <Sparkles className="w-4 h-4" />
                            <span>New: uBank University</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1]">
                            Master Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Community Finances</span>
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-lg">
                            Whether you are a Treasurer needing to record cash, or a Member looking for a loan, our detailed step-by-step guides have you covered.
                        </p>
                        <div className="pt-4">
                            <Link href="/help">
                                <Button className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-base shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                                    Start Learning
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Floating Ledger Animation */}
                    <div className="md:w-1/2 relative h-[500px] w-full flex items-center justify-center">
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="relative z-10 w-full max-w-md"
                        >
                            <GlassCard className="p-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-2xl">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/30">
                                            $
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold opacity-60 uppercase tracking-wider">Total Savings</div>
                                            <div className="text-2xl font-black text-slate-900 dark:text-white">MWK 1,250,400</div>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
                                        +12.5%
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {[1, 2, 3].map((_, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                            <div className="space-y-2 flex-1">
                                                <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                                                <div className="h-2 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 text-center">
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                        Real-time Ledger Sync
                                    </p>
                                </div>
                            </GlassCard>

                            {/* Floating Elements */}
                            <motion.div
                                animate={{ y: [0, 30, 0], x: [0, 10, 0] }}
                                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute -top-10 -right-10 z-20"
                            >
                                <GlassCard className="p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border-none" hover={false}>
                                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                                </GlassCard>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, -20, 0], x: [0, -10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                className="absolute -bottom-5 -left-5 z-20"
                            >
                                <GlassCard className="px-6 py-3 rounded-full bg-slate-900 dark:bg-white shadow-xl border-none" hover={false}>
                                    <span className="text-white dark:text-slate-900 font-bold whitespace-nowrap">Verified</span>
                                </GlassCard>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Trust Section */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-40 space-y-20 max-w-7xl mx-auto"
            >
                <div className="text-center space-y-6">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{t('landing.trust_title')}</h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-bold text-xl">
                        {t('landing.trust_desc')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: ShieldCheck, title: "Bank-Grade Security", desc: "Your data is encrypted with AES-256 protocols, ensuring your financial records remain private and secure." },
                        { icon: Eye, title: "Total Transparency", desc: "Every transaction is recorded on an immutable ledger. Every member sees exactly where the money goes." },
                        { icon: Globe, title: "Community First", desc: "Built for Malawians, by Malawians. We understand the unique needs of local village banking groups." }
                    ].map((item, i) => (
                        <GlassCard key={i} className="p-8 text-left border-white/10" hover={true}>
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 text-slate-900 dark:text-white">
                                <item.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">{item.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                        </GlassCard>
                    ))}
                </div>
            </motion.div>

            {/* Registration CTA */}
            <div className="mt-40">
                <GlassCard className="p-12 sm:p-20 border-none bg-slate-900 dark:bg-white relative overflow-hidden" hover={false}>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px] -mr-48 -mt-48" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-600/20 rounded-full blur-[80px] -ml-32 -mb-32" />

                    <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                        <h2 className="text-4xl sm:text-6xl font-black text-white dark:text-slate-950 tracking-tighter">{t('landing.cta_title')}</h2>
                        <p className="text-lg text-slate-400 dark:text-slate-600 max-w-xl font-bold">
                            {t('landing.cta_desc')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
                            <Link href="/register" className="w-full sm:w-auto">
                                <Button className="h-16 px-12 rounded-2xl w-full text-lg font-bold bg-[#FFD700] text-slate-900 shadow-[0_0_40px_-10px_rgba(255,215,0,0.5)] hover:shadow-[0_0_60px_-10px_rgba(255,215,0,0.7)] hover:bg-[#FFE033] hover:scale-105 transition-all border border-yellow-300/50">
                                    {t('landing.create_first_group')}
                                </Button>
                            </Link>
                            <Link href="/login" className="w-full sm:w-auto">
                                <Button variant="outline" className="h-16 px-12 rounded-2xl border-white/20 dark:border-slate-950/20 text-white dark:text-slate-950 font-bold text-lg hover:bg-white/10 dark:hover:bg-slate-950/5 transition-all w-full backdrop-blur-md">
                                    {t('landing.member_login')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </main>
    )
}
