'use client'

import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/motions'
import { Network, Globe, TrendingUp } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'

export default function EcosystemPage() {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-blue-500/30 font-sans">
            <MarketingHeader />

            <main className="container mx-auto px-6 py-24">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto mb-20"
                >
                    <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {t('ecosystem_page.title')}
                    </motion.h1>
                    <motion.p variants={fadeUp} className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl font-bold">
                        {t('ecosystem_page.subtitle')}
                    </motion.p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {[
                        {
                            icon: Globe,
                            title: t('ecosystem_page.concept_title'),
                            desc: t('ecosystem_page.concept_desc')
                        },
                        {
                            icon: Network,
                            title: t('ecosystem_page.network_title'),
                            desc: t('ecosystem_page.network_desc')
                        },
                        {
                            icon: TrendingUp,
                            title: t('ecosystem_page.growth_title'),
                            desc: t('ecosystem_page.growth_desc')
                        }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.2 }}
                            className="p-10 rounded-[3rem] bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 flex flex-col items-center text-center group hover:bg-white dark:hover:bg-white/10 transition-colors"
                        >
                            <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/10 group-hover:scale-110 transition-transform">
                                <item.icon className="w-8 h-8 text-indigo-600 dark:text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{item.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Visual Map/Network Representation (Abstract) */}
                <div className="mt-32 max-w-4xl mx-auto">
                    <div className="aspect-[2/1] bg-slate-900 rounded-3xl relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />
                        <div className="relative z-10 text-center">
                            <span className="text-6xl font-black text-white/20 uppercase tracking-widest">Connected</span>
                        </div>
                    </div>
                </div>

            </main>

            <MarketingFooter />
        </div>
    )
}
