'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useLanguage } from '@/components/providers/LanguageProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  DollarSign,
  CreditCard,
  Settings,
  Shield
} from 'lucide-react'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { DesktopUserMenu } from './DesktopUserMenu'
import { motion } from 'framer-motion'
import { itemFadeIn, staggerContainer } from '@/lib/motions'
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
    { name: t('common.dashboard'), href: '/dashboard', icon: Home },
    { name: t('common.groups'), href: '/groups', icon: Users },
    { name: t('common.contributions'), href: '/contributions', icon: DollarSign },
    { name: t('common.loans'), href: '/loans', icon: CreditCard },
  ]

  const adminNavigation: { name: string; href: string; icon: any }[] = []

  if (user?.role === 'REGIONAL_ADMIN') {
    adminNavigation.push(
      { name: 'Regional Admin', href: '/admin/regional', icon: Shield }
    )
  } else if (user?.role === 'SUPER_ADMIN') {
    adminNavigation.push(
      { name: 'Regional Admin', href: '/admin/regional', icon: Shield },
      { name: 'System Admin', href: '/admin/system', icon: Settings }
    )
  }

  return (
    <header className="hidden lg:flex sticky top-0 z-50 w-full">
      {/* Premium Glass Layer */}
      <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-sm" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="flex justify-between h-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-8"
          >
            <Link href="/dashboard" className="shrink-0 flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 transform group-hover:rotate-6 group-hover:scale-105 transition-all duration-300">
                <span className="text-white font-black text-xl">V</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent leading-none">
                  Village Bank
                </h1>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 leading-none mt-1">
                  Fintech ecosystem
                </span>
              </div>
            </Link>

            <motion.nav
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex items-center space-x-1"
            >
              {memberNavigation.map((item) => (
                <NavigationLink key={item.href} item={item} isActive={pathname === item.href} />
              ))}
              {adminNavigation.length > 0 && (
                <>
                  <div className="h-6 w-px bg-border/50 mx-2" />
                  {adminNavigation.map((item) => (
                    <NavigationLink key={item.href} item={item} isActive={pathname === item.href} />
                  ))}
                </>
              )}
            </motion.nav>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <LanguageSwitcher />
            {user && (
              <div className="flex items-center gap-4 pl-4 border-l border-border/50">
                <NotificationCenter />
                <DesktopUserMenu user={user} />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </header>
  )
}
