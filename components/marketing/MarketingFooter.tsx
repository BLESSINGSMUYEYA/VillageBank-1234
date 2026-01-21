'use client'

import { UBankLogo } from '@/components/ui/Logo'
import { Globe } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/LanguageProvider'

export function MarketingFooter() {
    const { t } = useLanguage()

    return (
        <footer className="container mx-auto px-6 py-12 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
                <UBankLogo className="w-6 h-6" />
                <span className="font-black text-slate-900 dark:text-white tracking-tighter">uBank</span>
            </div>
            <p className="text-slate-500 text-sm font-black uppercase tracking-widest">
                {t('landing.copyright', { year: new Date().getFullYear().toString() })}
            </p>
            <div className="flex items-center gap-6">
                <Link href="/help" className="text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-black uppercase tracking-widest transition-colors">
                    Help Center
                </Link>
                <Globe className="w-5 h-5 text-slate-400" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Chichewa / English</span>
            </div>
        </footer>
    )
}
