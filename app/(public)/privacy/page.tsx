'use client'

import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/motions'
import { Shield, Eye, Database, Cookie, UserCheck, Mail } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: 'Information We Collect',
      content: 'Village Banking collects information you provide directly to us, such as when you create an account, use our services, or contact us.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      items: [
        'Provide and maintain our services',
        'Process transactions and manage your account',
        'Send you technical notices and support messages',
        'Communicate with you about products, services, and promotional offers'
      ],
      color: 'text-teal-500',
      bg: 'bg-teal-500/10'
    },
    {
      icon: UserCheck,
      title: 'Information Sharing',
      content: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.',
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      icon: Shield,
      title: 'Data Security',
      content: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      icon: Cookie,
      title: 'Cookies and Tracking',
      content: 'We use cookies and similar tracking technologies to track activity on our service and hold certain information to enhance your experience.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      icon: UserCheck,
      title: 'Your Rights',
      items: [
        'Access and update your personal information',
        'Delete your account and personal data',
        'Opt-out of marketing communications',
        'Request a copy of your data'
      ],
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
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
              Privacy Policy
              <span className="text-emerald-500">.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl font-bold">
              Your privacy is important to us. This policy outlines how we collect, use, and protect your information.
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
                      {section.content && (
                        <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">{section.content}</p>
                      )}
                      {section.items && (
                        <ul className="space-y-3">
                          {section.items.map((item, j) => (
                            <li key={j} className="flex items-start gap-3 text-slate-600 dark:text-slate-400 font-bold">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 max-w-3xl mx-auto"
          >
            <GlassCard className="p-12 text-center bg-slate-900 dark:bg-white/5 border-none relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/20 rounded-full blur-[100px] -mr-32 -mt-32" />
              <div className="relative z-10">
                <Mail className="w-12 h-12 text-emerald-500 mx-auto mb-6" />
                <h2 className="text-3xl font-black text-white dark:text-slate-900 mb-4 tracking-tight">Contact Us</h2>
                <p className="text-slate-400 dark:text-slate-600 font-bold mb-6">
                  If you have any questions about this Privacy Policy, please contact us at
                </p>
                <a href="mailto:privacy@villagebanking.com" className="text-emerald-400 dark:text-emerald-600 font-black text-lg hover:underline">
                  privacy@villagebanking.com
                </a>
              </div>
            </GlassCard>
          </motion.div>
        </main>

        <MarketingFooter />
      </div>
    </div>
  )
}
