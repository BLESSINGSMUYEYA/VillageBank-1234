'use client'

import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/motions'
import { FileText, CheckCircle, Key, Shield, DollarSign, AlertCircle, RefreshCw } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'

export default function TermsPage() {
  const sections = [
    {
      icon: CheckCircle,
      title: '1. Acceptance of Terms',
      content: 'By accessing and using Village Banking services, you accept and agree to be bound by the terms and provision of this agreement.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      icon: Key,
      title: '2. Use License',
      content: 'Permission is granted to temporarily use Village Banking services for personal, non-commercial transitory viewing only.',
      color: 'text-teal-500',
      bg: 'bg-teal-500/10'
    },
    {
      icon: Shield,
      title: '3. Account Responsibilities',
      content: 'You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.',
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      icon: FileText,
      title: '4. Privacy Policy',
      content: 'Your privacy is important to us. Our Privacy Policy outlines how we collect, use, and protect your information.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      icon: DollarSign,
      title: '5. Financial Services',
      content: 'Village Banking provides group savings and loan services. All financial transactions are subject to applicable laws and regulations.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      icon: AlertCircle,
      title: '6. Limitation of Liability',
      content: 'In no event shall Village Banking or its suppliers be liable for any damages arising out of the use or inability to use our services.',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    },
    {
      icon: RefreshCw,
      title: '7. Changes to Terms',
      content: 'We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.',
      color: 'text-pink-500',
      bg: 'bg-pink-500/10'
    }
  ]

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
            className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto mb-20"
          >
            <motion.div variants={fadeUp} className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <FileText className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
              Terms of Service
              <span className="text-emerald-500">.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl font-bold">
              Please read these terms carefully before using our services.
            </motion.p>
          </motion.div>

          <div className="max-w-5xl mx-auto space-y-8">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-8">
                  <div className="flex items-start gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${section.bg}`}>
                      <section.icon className={`w-7 h-7 ${section.color}`} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{section.title}</h2>
                      <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">{section.content}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Acceptance Notice */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 max-w-3xl mx-auto"
          >
            <GlassCard className="p-12 text-center bg-emerald-600 dark:bg-emerald-600 border-none relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32" />
              <div className="relative z-10">
                <CheckCircle className="w-12 h-12 text-white mx-auto mb-6" />
                <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Agreement</h2>
                <p className="text-emerald-100 font-bold text-lg">
                  By using Village Banking, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them.
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </main>

        <MarketingFooter />
      </div>
    </div>
  )
}
