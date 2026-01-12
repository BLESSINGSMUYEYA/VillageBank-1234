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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-blue-500/30 font-sans">
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
                            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center">
                                <Target className="w-6 h-6 text-rose-500" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t('about_page.mission_title')}</h2>
                        </div>
                        <p className="text-lg text-slate-600 dark:text-slate-400 font-bold leading-relaxed border-l-4 border-rose-500 pl-6">
                            {t('about_page.mission_desc')}
                        </p>
                    </div>
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                                <Lightbulb className="w-6 h-6 text-amber-500" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t('about_page.vision_title')}</h2>
                        </div>
                        <p className="text-lg text-slate-600 dark:text-slate-400 font-bold leading-relaxed border-l-4 border-amber-500 pl-6">
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
                        <Heart className="w-16 h-16 text-rose-500 mx-auto fill-rose-500 animate-pulse" />
                        <h2 className="text-4xl font-black">{t('about_page.team_title')}</h2>
                        <p className="text-xl text-slate-300 font-bold">
                            {t('about_page.team_desc')}
                        </p>
                    </div>

                    {/* Background elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-600/20 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
                </motion.div>

            </main>

            <MarketingFooter />
        </div>
    )
}
