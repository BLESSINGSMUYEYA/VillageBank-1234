'use client'

import Link from 'next/link'
import { Github, Mail, Download, ArrowRight, Twitter, Linkedin } from 'lucide-react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { UBankLogo } from '@/components/ui/Logo'
import { AppLogo } from '@/components/ui/AppLogo'

export function Footer() {
  const { showInstallPrompt, promptToInstall } = useInstallPrompt()
  const { t } = useLanguage()

  return (
    <footer className="border-t border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl mt-auto z-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 md:mb-14">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 space-y-5 md:space-y-6">
            <Link href="/" className="inline-block group">
              <div className="flex items-center gap-3">
                <AppLogo />
              </div>
            </Link>
            <p className="text-slate-500 text-sm sm:text-base max-w-sm leading-relaxed font-medium">
              {t('footer.desc')}
            </p>

            <div className="flex items-center gap-3 pt-2">
              {/* Install App Button */}
              {showInstallPrompt && (
                <Button
                  onClick={promptToInstall}
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-400 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 font-bold h-9 md:h-10 text-xs md:text-sm px-4"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('footer.install_app') || 'Install App'}
                </Button>
              )}

              <div className="flex items-center gap-2">
                <Link href="#" className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-[#1B4332] dark:hover:text-emerald-400 hover:scale-110 transition-all">
                  <Twitter className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
                <Link href="#" className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-[#1B4332] dark:hover:text-emerald-400 hover:scale-110 transition-all">
                  <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
                <Link href="#" className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-[#1B4332] dark:hover:text-emerald-400 hover:scale-110 transition-all">
                  <Github className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
              </div>

            </div>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-xs md:text-sm font-black text-[#1B4332] dark:text-white mb-5 md:mb-6 uppercase tracking-widest flex items-center gap-3">
              Platform
              <div className="h-px flex-1 bg-gradient-to-r from-emerald-500 to-transparent opacity-30" />
            </h4>
            <ul className="space-y-3 md:space-y-4">
              {[
                { label: 'common.dashboard', href: '/dashboard' },
                { label: 'common.groups', href: '/groups' },
                { label: 'common.contributions', href: '/vault' },
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="group flex items-center text-sm font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-emerald-500" />
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-xs md:text-sm font-black text-[#1B4332] dark:text-white mb-5 md:mb-6 uppercase tracking-widest flex items-center gap-3">
              Support
              <div className="h-px flex-1 bg-gradient-to-r from-emerald-500 to-transparent opacity-30" />
            </h4>
            <ul className="space-y-3 md:space-y-4">
              {[
                { label: 'footer.help_center', href: '/help' },
                { label: 'footer.privacy_policy', href: '/privacy' },
                { label: 'footer.terms_of_service', href: '/terms' },
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="group flex items-center text-sm font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-emerald-500" />
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 md:pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider text-center md:text-left">
            © {new Date().getFullYear()} uBank Financial. {t('footer.rights_reserved')}
          </p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] md:text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">{t('footer.systems_operational')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
