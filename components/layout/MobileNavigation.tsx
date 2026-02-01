'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useLanguage } from '@/components/providers/LanguageProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Users,
  Zap,
  Landmark,
  User,
  Shield,
  Settings,
  LogOut,
  Server,
  Megaphone
} from 'lucide-react'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState, memo } from 'react'

import { cn } from '@/lib/utils'
import { UBankLogo } from '@/components/ui/Logo'
import { AppLogo } from '@/components/ui/AppLogo'

// Interface for MobileNavigationProps removed as unreadNotifications was unused

export function MobileNavigation() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const { t } = useLanguage()
  const [isHidden, setIsHidden] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    if (latest > previous && latest > 50) {
      setIsHidden(true)
    } else {
      setIsHidden(false)
    }
  })

  // Define member-specific navigation
  const defaultNavigation = [
    { name: t('common.pulse'), href: '/dashboard', icon: Zap },
    { name: t('common.vault'), href: '/vault', icon: Landmark },
    { name: t('common.groups'), href: '/groups', icon: Users },
    { name: 'Personal', href: '/personal', icon: User },
  ]

  const adminNavigation = [
    { name: 'System', href: '/admin/system', icon: Server },
    { name: 'Marketing', href: '/admin/system/marketing', icon: Megaphone },
    { name: 'Verify', href: '/admin/verifications', icon: Shield },
    { name: 'Exit', href: '/dashboard', icon: LogOut },
  ]

  const isOnAdminPage = pathname?.startsWith('/admin')
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  // Use admin navigation if user is super admin AND on an admin page
  const navigation = (isSuperAdmin && isOnAdminPage) ? adminNavigation : defaultNavigation

  return (
    <div className="lg:hidden">
      {/* Mobile Header - Zen Mode (Hide on Scroll) */}
      <motion.div
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: -100, opacity: 0 }
        }}
        animate={isHidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-40 bg-white/60 dark:bg-slate-950/60 backdrop-blur-3xl border-b border-white/20 dark:border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
      >
        <div className="flex items-center justify-between p-4 px-5">
          <Link href="/dashboard" className="group">
            <AppLogo />
          </Link>

          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            {user && <NotificationCenter />}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all p-0 overflow-hidden border border-slate-100 dark:border-white/5">
                    <Avatar className="h-full w-full rounded-none">
                      <AvatarFallback className="font-black text-xs text-emerald-900 bg-emerald-50 dark:text-emerald-400 dark:bg-[#1B4332]/20">
                        {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 rounded-3xl p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-white/20 dark:border-white/10 shadow-2xl" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-4">
                    <p className="font-black text-sm text-[#1B4332] dark:text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="truncate text-[10px] text-slate-400 font-bold opacity-70">
                      {user?.email}
                    </p>
                    <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 w-fit tracking-wider">
                      {user?.role?.replace('_', ' ')}
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 mx-2" />
                  <div className="p-1 space-y-0.5">
                    <DropdownMenuItem asChild className="rounded-2xl focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:text-emerald-400 transition-colors">
                      <Link href="/profile" className="flex items-center p-3 font-bold text-sm text-slate-600 dark:text-slate-300">
                        <User className="mr-3 h-4 w-4 opacity-70" />
                        {t('common.profile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-2xl focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:text-emerald-400 transition-colors">
                      <Link href="/settings" className="flex items-center p-3 font-bold text-sm text-slate-600 dark:text-slate-300">
                        <Settings className="mr-3 h-4 w-4 opacity-70" />
                        {t('common.settings')}
                      </Link>
                    </DropdownMenuItem>

                    {user?.role === 'SUPER_ADMIN' && (
                      <DropdownMenuItem asChild className="rounded-2xl focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:text-emerald-400">
                        <Link href="/admin/system" className="flex items-center p-3 font-bold text-sm text-slate-600 dark:text-slate-300">
                          <Server className="mr-3 h-4 w-4 opacity-70" />
                          System Command
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {user?.role === 'SUPER_ADMIN' && (
                      <DropdownMenuItem asChild className="rounded-2xl focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:text-emerald-400">
                        <Link href="/admin/system/marketing" className="flex items-center p-3 font-bold text-sm text-slate-600 dark:text-slate-300">
                          <Megaphone className="mr-3 h-4 w-4 opacity-70" />
                          Marketing
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {(user?.role === 'REGIONAL_ADMIN' || user?.role === 'SUPER_ADMIN') && (
                      <>
                        <DropdownMenuItem asChild className="rounded-2xl focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:text-emerald-400">
                          <Link href="/admin/regional" className="flex items-center p-3 font-bold text-sm text-slate-600 dark:text-slate-300">
                            <Shield className="mr-3 h-4 w-4 opacity-70" />
                            {t('admin.regional')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-2xl focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:text-emerald-400">
                          <Link href="/admin/verifications" className="flex items-center p-3 font-bold text-sm text-slate-600 dark:text-slate-300">
                            <Shield className="mr-3 h-4 w-4 opacity-70" />
                            Verifications
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </div>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 mx-2" />
                  <div className="p-1">
                    <DropdownMenuItem asChild className="rounded-2xl focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-600">
                      <button className="w-full text-left flex items-center p-3 font-bold text-sm text-red-500" onClick={() => logout()}>
                        <LogOut className="mr-3 h-4 w-4" />
                        {t('common.logout')}
                      </button>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button size="sm" className="font-black rounded-xl bg-[#1B4332] text-white h-9 px-5 text-xs shadow-lg shadow-emerald-900/20">{t('common.sign_in')}</Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Spacer */}
      <div className="h-16" />

      {/* Mobile Bottom Navigation - Premium Dock */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-6 pb-6 pointer-events-none safe-area-bottom">
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2.5rem] p-1.5 pointer-events-auto mx-auto max-w-sm"
          >
            <div className="flex items-center justify-around">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "relative flex flex-col items-center justify-center flex-1 h-14 rounded-[1.75rem] transition-all duration-500 group",
                      isActive ? 'text-[#1B4332] dark:text-emerald-400' : 'text-slate-400 hover:text-slate-600'
                    )}
                  >
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="mobile-nav-pill"
                          className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-[1.75rem] z-0"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Icon with Hover/Active Animation */}
                    <div className="relative z-10 flex flex-col items-center group-active:scale-95 transition-transform duration-200">
                      <Icon className={cn(
                        "w-5 h-5 transition-all duration-500",
                        isActive ? 'stroke-[2.5px] scale-110' : 'stroke-[2px]'
                      )} />
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest mt-1.5 transition-all duration-500",
                        isActive ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
                      )}>
                        {item.name}
                      </span>
                    </div>

                    {/* Active Dot */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-dot"
                        className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#1B4332] dark:bg-emerald-400"
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
