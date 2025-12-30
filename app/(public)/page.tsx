'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Users, DollarSign, TrendingUp, Shield, Clock, Award, ArrowRight, Zap, Globe, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { staggerContainer, itemFadeIn, fadeIn, hoverScale } from '@/lib/motions'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/lib/utils'

export default function Home() {
    const { isAuthenticated, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && isAuthenticated) {
            router.push('/dashboard')
        }
    }, [isAuthenticated, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full animate-pulse" />
                    </div>
                </div>
            </div>
        )
    }

    if (isAuthenticated) {
        return null
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-blue-500/30 overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[100px] animate-pulse-slow delay-700" />
                <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-banana/10 dark:bg-banana/20 rounded-full blur-[110px] animate-pulse-slow delay-1000" />
            </div>

            <div className="relative z-10">
                {/* Navbar */}
                <header className="container mx-auto px-6 py-8 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                            <Zap className="w-6 h-6 text-white" fill="currentColor" />
                        </div>
                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                            VILLAGE<span className="text-blue-600">BANK</span>
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <nav className="flex items-center gap-6">
                            {['Ecosystem', 'Security', 'Features'].map((item) => (
                                <Link key={item} href="#" className="text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-banana transition-colors">
                                    {item}
                                </Link>
                            ))}
                        </nav>
                        <Link href="/login">
                            <Button className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black rounded-xl px-8 h-12 hover:scale-105 transition-all">
                                Launch App
                            </Button>
                        </Link>
                    </div>
                </header>

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
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-banana">The Future of Community Finance</span>
                        </motion.div>

                        {/* Main Title */}
                        <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] max-w-5xl mx-auto">
                            Modern Banking, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 bg-300% animate-shimmer">Localized Impact.</span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p variants={fadeIn} className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-bold leading-relaxed">
                            Empowering Malawian communities with a secure, transparent, and mobile-first ecosystem for village banking and collective growth.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link href="/register" className="w-full sm:w-auto">
                                <Button className="w-full sm:w-auto h-16 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all group">
                                    Start Moving Forward
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/login" className="w-full sm:w-auto">
                                <Button variant="outline" className="w-full sm:w-auto h-16 px-12 rounded-2xl border-2 border-slate-200 dark:border-white/10 dark:bg-white/5 font-black text-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
                                    Access Ledger
                                </Button>
                            </Link>
                        </motion.div>

                        {/* Stats Preview */}
                        <motion.div variants={fadeIn} className="pt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            {[
                                { label: 'Active Members', value: '12K+' },
                                { label: 'Managed Capital', value: '$2.4M' },
                                { label: 'Success Rate', value: '99.8%' },
                                { label: 'Community Groups', value: '450+' },
                            ].map((stat, i) => (
                                <div key={i} className="space-y-1">
                                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Features Grid */}
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
                                title: 'Circle Management',
                                desc: 'Dynamic group creation with automated bylaws and role-based governance.',
                                color: 'bg-blue-500'
                            },
                            {
                                icon: DollarSign,
                                title: 'Instant Liquidity',
                                desc: 'Frictionless loan deployment with automated eligibility verification.',
                                color: 'bg-emerald-500'
                            },
                            {
                                icon: TrendingUp,
                                title: 'Staking Protocol',
                                desc: 'Track every contribution with immutable ledger accuracy and yield insights.',
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

                    {/* Trust Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-40 space-y-16"
                    >
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Built on Absolute Trust.</h2>
                            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-bold">
                                We combine traditional communal values with state-of-the-art security protocols to protect your future.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {[
                                { icon: Shield, title: 'Bank-Grade Security', desc: 'SHA-256 encryption for every transaction and data point.' },
                                { icon: clock, title: 'Real-time Ledger', desc: 'Synchronized updates across all member devices instantly.' },
                                { icon: Award, title: 'Elite Interface', desc: 'Crafted for performance and ease across all Malawian networks.' }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-slate-950">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-black text-slate-900 dark:text-white tracking-tight">{item.title}</h4>
                                    <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-wider">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Registration CTA */}
                    <div className="mt-40">
                        <GlassCard className="p-12 sm:p-20 border-none bg-slate-900 dark:bg-white relative overflow-hidden" hover={false}>
                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-48 -mt-48" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -ml-32 -mb-32" />

                            <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                                <h2 className="text-4xl sm:text-6xl font-black text-white dark:text-slate-950 tracking-tighter">Ready to revolutionize <br /> your circle?</h2>
                                <p className="text-lg text-slate-400 dark:text-slate-600 max-w-xl font-bold">
                                    Join thousands of Malawians managing their community wealth with unparalleled efficiency.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                    <Link href="/register" className="w-full sm:w-auto">
                                        <Button className="h-16 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-2xl hover:scale-105 transition-all w-full">
                                            Create First Group
                                        </Button>
                                    </Link>
                                    <Link href="/login" className="w-full sm:w-auto">
                                        <Button variant="outline" className="h-16 px-12 rounded-2xl border-white/20 dark:border-slate-950/20 text-white dark:text-slate-950 font-black text-lg hover:bg-white/10 dark:hover:bg-slate-950/5 transition-all w-full">
                                            Member Login
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </main>

                <footer className="container mx-auto px-6 py-12 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <Zap className="w-6 h-6 text-blue-600" fill="currentColor" />
                        <span className="font-black text-slate-900 dark:text-white tracking-tighter">VILLAGE BANK</span>
                    </div>
                    <p className="text-slate-500 text-sm font-black uppercase tracking-widest">
                        © {new Date().getFullYear()} Malawian Financial Technologies.
                    </p>
                    <div className="flex items-center gap-6">
                        <Globe className="w-5 h-5 text-slate-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Chichewa / English</span>
                    </div>
                </footer>
            </div>
        </div>
    )
}

const clock = Clock // Fix for lucide icon casing inconsistency
