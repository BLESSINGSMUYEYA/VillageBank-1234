'use client'

import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/motions'
import { Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/providers/LanguageProvider'

export default function PricingPage() {
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
                        {t('pricing_page.title')}
                    </motion.h1>
                    <motion.p variants={fadeUp} className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl font-bold">
                        {t('pricing_page.subtitle')}
                    </motion.p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Free Tier */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-10 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 relative overflow-hidden group"
                    >
                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('pricing_page.free_tier_title')}</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-blue-600 dark:text-banana">{t('pricing_page.free_tier_price')}</span>
                                </div>
                                <p className="text-slate-500 font-bold mt-4">{t('pricing_page.free_tier_desc')}</p>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    t('pricing_page.feature_1'),
                                    'Mobile Access',
                                    'Personal Dashboard',
                                    'Secure Wallet'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-bold">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-600/20 flex items-center justify-center text-blue-600">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Button className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-lg hover:scale-105 transition-transform">
                                {t('pricing_page.cta')}
                            </Button>
                        </div>
                    </motion.div>

                    {/* Premium Tier */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-10 rounded-3xl bg-blue-600 dark:bg-blue-600 text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4">
                            <div className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-white/20">
                                Most Popular
                            </div>
                        </div>
                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-2xl font-black mb-2">{t('pricing_page.premium_tier_title')}</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black">{t('pricing_page.premium_tier_price')}</span>
                                </div>
                                <p className="text-blue-100 font-bold mt-4">{t('pricing_page.premium_tier_desc')}</p>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    t('pricing_page.feature_2'),
                                    t('pricing_page.feature_3'),
                                    'Automated Penalties',
                                    'Advanced Reports',
                                    'Priority Support'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-white font-bold">
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Button className="w-full h-14 rounded-2xl bg-white text-blue-600 font-black text-lg hover:scale-105 transition-transform shadow-2xl">
                                {t('landing.create_first_group')}
                            </Button>
                        </div>
                        {/* Background Decor */}
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    </motion.div>
                </div>
            </main>

            <MarketingFooter />
        </div>
    )
}
