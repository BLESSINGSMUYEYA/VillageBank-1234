'use client'

import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/motions'
import { Heart, Target, Lightbulb } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'

export default function AboutPage() {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-emerald-500/30 font-sans overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-600/10 dark:bg-emerald-600/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] bg-teal-600/10 dark:bg-teal-600/20 rounded-full blur-[100px] animate-pulse-slow delay-700" />
                <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-emerald-400/10 dark:bg-emerald-400/20 rounded-full blur-[110px] animate-pulse-slow delay-1000" />
            </div>

            <div className="relative z-10">
                <MarketingHeader />

                <main className="container mx-auto px-6 py-24">
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto mb-32"
                    >
                        <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {t('about_page.title')}
                            <span className="text-emerald-500">.</span>
                        </motion.h1>
                        <motion.p variants={fadeUp} className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl font-bold">
                            {t('about_page.subtitle')}
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 gap-16 items-center mb-32"
                    >
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                                    <Target className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t('about_page.mission_title')}</h2>
                            </div>
                            <p className="text-lg text-slate-600 dark:text-slate-400 font-bold leading-relaxed border-l-4 border-emerald-500 pl-6">
                                {t('about_page.mission_desc')}
                            </p>
                        </div>
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center">
                                    <Lightbulb className="w-6 h-6 text-teal-500" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t('about_page.vision_title')}</h2>
                            </div>
                            <p className="text-lg text-slate-600 dark:text-slate-400 font-bold leading-relaxed border-l-4 border-teal-500 pl-6">
                                {t('about_page.vision_desc')}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-slate-900 dark:bg-white/5 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden"
                    >
                        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                            <Heart className="w-16 h-16 text-emerald-500 mx-auto fill-emerald-500 animate-pulse" />
                            <h2 className="text-4xl font-black">{t('about_page.team_title')}</h2>
                            <p className="text-xl text-slate-300 font-bold">
                                {t('about_page.team_desc')}
                            </p>
                        </div>

                        {/* Background elements */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-600/20 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
                    </motion.div>

                </main>

                <MarketingFooter />
            </div>
        </div>
    )
}
