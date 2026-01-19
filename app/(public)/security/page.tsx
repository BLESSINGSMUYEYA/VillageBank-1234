'use client'

import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/motions'
import { Shield, Lock, Server, Eye, Smartphone, Database } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'

export default function SecurityPage() {
    const { t } = useLanguage()

    const sections = [
        {
            icon: Lock,
            title: t('security_page.encryption_title'),
            desc: t('security_page.encryption_desc'),
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            icon: Eye,
            title: t('security_page.privacy_title'),
            desc: t('security_page.privacy_desc'),
            color: "text-teal-500",
            bg: "bg-teal-500/10"
        },
        {
            icon: Server,
            title: t('security_page.infra_title'),
            desc: t('security_page.infra_desc'),
            color: "text-green-500",
            bg: "bg-green-500/10"
        }
    ]

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-emerald-500/30 font-sans">
            <MarketingHeader />

            <main className="container mx-auto px-6 py-24">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto mb-32"
                >
                    <motion.div variants={fadeUp} className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
                        <Shield className="w-10 h-10 text-white" />
                    </motion.div>
                    <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {t('security_page.title')}
                    </motion.h1>
                    <motion.p variants={fadeUp} className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl font-bold">
                        {t('security_page.subtitle')}
                    </motion.p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {sections.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 transition-colors group"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${item.bg} ${item.color}`}>
                                <item.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{item.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Bento Grid Concept for additional security features */}
                <div className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-auto md:h-[500px]">
                    <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-slate-900 dark:bg-white/5 rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-3xl font-black text-white mb-4">Activity Logs</h4>
                            <p className="text-slate-400 font-bold max-w-sm">Every action is recorded in an immutable ledger, available for transparent audit by any member.</p>
                        </div>
                        <Database className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5" />
                    </div>

                    <div className="bg-emerald-600 rounded-3xl p-8 flex flex-col justify-between text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <Smartphone className="w-10 h-10 mb-4" />
                            <h4 className="text-xl font-black mb-2">Device Auth</h4>
                            <p className="text-emerald-100 text-sm font-bold">Biometric security integration.</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 flex flex-col justify-center items-center text-center border border-slate-200 dark:border-white/10">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white">24/7 Monitoring</h4>
                    </div>
                </div>

            </main>

            <MarketingFooter />
        </div>
    )
}
