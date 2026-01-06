'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useLanguage } from '@/components/providers/LanguageProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users,
  Zap,
  Landmark,
  User
} from 'lucide-react'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { DesktopUserMenu } from './DesktopUserMenu'
import { motion } from 'framer-motion'
import { itemFadeIn, staggerContainer } from '@/lib/motions'
import { UBankLogo } from '@/components/ui/Logo'
import { cn } from '@/lib/utils'

const NavigationLink = ({ item, isActive }: { item: any; isActive: boolean }) => (
  <motion.div variants={itemFadeIn}>
    <Link
      href={item.href}
      className={cn(
        "relative group px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
        isActive
          ? "text-blue-600 dark:text-banana"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {/* Active Background Indicator */}
      {isActive && (
        <motion.div
          layoutId="active-nav"
          className="absolute inset-0 bg-blue-500/10 dark:bg-banana/10 border-b-2 border-blue-500 dark:border-banana rounded-xl z-0"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}

      <item.icon className={cn(
        "w-4 h-4 relative z-10 transition-transform duration-300 group-hover:scale-110",
        isActive ? "stroke-[2.5px]" : ""
      )} />
      <span className="relative z-10 whitespace-nowrap">{item.name}</span>
    </Link>
  </motion.div>
)

export function DesktopNavigation() {
  const { user } = useAuth()
  const pathname = usePathname()
  const { t } = useLanguage()

  // Define member-specific navigation
  const memberNavigation = [
    { name: t('common.pulse'), href: '/dashboard', icon: Zap },
    { name: t('common.vault'), href: '/vault', icon: Landmark },
    { name: t('common.groups'), href: '/groups', icon: Users },
    { name: t('common.profile'), href: '/profile', icon: User },
  ]


  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col z-50">
      {/* Premium Glass Layer */}
      <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/60 backdrop-blur-2xl border-r border-white/20 dark:border-white/10 shadow-2xl" />

      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Logo Section - Integrated Design */}
        <div className="mb-10">
          <Link href="/dashboard" className="group">
            {/* Logo and text as one unified word */}
            <div className="flex items-end gap-0.5">
              <div className="flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                <UBankLogo className="w-7 h-7" />
              </div>
              <h1 className="text-lg font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent leading-none">
                Bank
              </h1>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none mt-1 block">
              {t('common.zen_edition')}
            </span>
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-2">
          {memberNavigation.map((item) => (
            <NavigationLink key={item.href} item={item} isActive={pathname === item.href} />
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-border/50 space-y-6">
          <div className="flex items-center justify-between px-2">
            <LanguageSwitcher />
            <NotificationCenter align="left" side="top" />
          </div>
          {user && (
            <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-white/10 overflow-hidden">
              <DesktopUserMenu user={user} />
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-black truncate text-foreground">{user.firstName}</p>
                <p className="text-[10px] font-bold text-muted-foreground truncate uppercase">{user.role?.replace('_', ' ')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
