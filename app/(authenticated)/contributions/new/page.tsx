'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/PageHeader'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { motion } from 'framer-motion'
import { fadeIn, staggerContainer } from '@/lib/motions'
import { ArrowLeft } from 'lucide-react'
import SmartContributionForm from '@/components/contributions/SmartContributionForm'

function NewContributionPageContent() {
  const { t } = useLanguage()

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-8 pb-20 container mx-auto"
    >
      <motion.div variants={fadeIn}>
        <Link href="/contributions" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 dark:hover:text-banana transition-all duration-300 group mb-4">
          <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          {t('contributions.back_to_pulse')}
        </Link>
        <PageHeader
          title={t('contributions.make_contribution')}
          description="Receipt-First Contribution Protocol"
        />
      </motion.div>

      <SmartContributionForm />
    </motion.div>
  )
}

export default function NewContributionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewContributionPageContent />
    </Suspense>
  )
}
