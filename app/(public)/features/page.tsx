'use client'

import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/motions'
import { Settings, BarChart3, Smartphone, Bell, Users, Wallet } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'

export default function FeaturesPage() {
    const { t } = useLanguage()

    const featureList = [
        {
            icon: Settings,
            title: t('features_page.admin_tools'),
            desc: t('features_page.admin_tools_desc'),
            image: "/images/features/admin.png" // Placeholder
        },
        {
            icon: Smartphone,
            title: t('features_page.member_app'),
            desc: t('features_page.member_app_desc'),
            image: "/images/features/mobile.png"
        },
        {
            icon: BarChart3,
            title: t('features_page.analytics'),
            desc: t('features_page.analytics_desc'),
            image: "/images/features/analytics.png"
        },
        {
            icon: Bell,
            title: t('features_page.notifications'),
            desc: t('features_page.notifications_desc'),
            image: "/images/features/notifications.png"
        }
    ]

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
                        {t('features_page.title')}
                    </motion.h1>
                    <motion.p variants={fadeUp} className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl font-bold">
                        {t('features_page.subtitle')}
                    </motion.p>
                </motion.div>

                <div className="space-y-32">
                    {featureList.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className={`flex flex-col ${i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16`}
                        >
                            <div className="flex-1 space-y-6">
                                <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                    <feature.icon className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{feature.title}</h2>
                                <p className="text-lg text-slate-600 dark:text-slate-400 font-bold leading-relaxed">{feature.desc}</p>
                            </div>
                            <div className="flex-1">
                                <div className="aspect-video bg-slate-200 dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-white/10 flex items-center justify-center relative overflow-hidden group">
                                    {/* Abstract visual representation since we don't have real screenshots yet */}
                                    <div className="absolute inset-x-10 top-10 bottom-0 bg-white dark:bg-slate-950 rounded-t-2xl shadow-2xl border border-slate-200 dark:border-white/5 opacity-50 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-500" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>

            <MarketingFooter />
        </div>
    )
}
