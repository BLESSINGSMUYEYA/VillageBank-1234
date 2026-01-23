'use client'

import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/motions'
import { Mail, Phone, Clock, MapPin, MessageSquare } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'

export default function ContactPage() {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      value: 'support@villagebanking.com',
      description: 'Send us an email anytime',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+260 123 456 789',
      description: 'Call us during office hours',
      color: 'text-teal-500',
      bg: 'bg-teal-500/10'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      value: 'Available Soon',
      description: 'Chat with our support team',
      color: 'text-green-500',
      bg: 'bg-green-500/10'
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
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
              Contact Us
              <span className="text-emerald-500">.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl font-bold">
              We&apos;re here to help with any questions about Village Banking services.
            </motion.p>
          </motion.div>

          {/* Contact Methods Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {contactMethods.map((method, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-8 text-center h-full">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${method.bg}`}>
                    <method.icon className={`w-8 h-8 ${method.color}`} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{method.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-4">{method.description}</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{method.value}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Office Hours Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <GlassCard className="p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                  <Clock className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Office Hours</h2>
                  <div className="space-y-2 text-slate-600 dark:text-slate-400 font-bold">
                    <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                    <p>Saturday: 9:00 AM - 1:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Location Hint */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                Serving Communities Across Malawi
              </span>
            </div>
          </motion.div>
        </main>

        <MarketingFooter />
      </div>
    </div>
  )
}
