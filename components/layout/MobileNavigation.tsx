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
  LogOut
} from 'lucide-react'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'
import { UBankLogo } from '@/components/ui/Logo'

// Interface for MobileNavigationProps removed as unreadNotifications was unused

export function MobileNavigation() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const { t } = useLanguage()

  // Define member-specific navigation
  const memberNavigation = [
    { name: t('common.pulse'), href: '/dashboard', icon: Zap },
    { name: t('common.vault'), href: '/vault', icon: Landmark },
    { name: t('common.groups'), href: '/groups', icon: Users },
    { name: t('common.profile'), href: '/profile', icon: User },
  ]

  const allNavigation = memberNavigation

  return (
    <div className="lg:hidden">
      {/* Mobile Header - Nano Glass */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between p-4 px-4">
          <Link href="/dashboard" className="group">
            {/* Logo and text as one unified word */}
            <div className="flex items-end gap-0.5">
              <div className="flex items-center justify-center group-active:scale-95 transition-transform">
                <UBankLogo className="w-6 h-6" />
              </div>
              <h1 className="text-lg font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent leading-none">Bank</h1>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none mt-1">{t('common.premium_member')}</p>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {user && <NotificationCenter />}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all p-0">
                    <Avatar className="h-9 w-9 border border-white/20 dark:border-white/10 rounded-xl">
                      <AvatarFallback className="font-black text-xs text-blue-900 bg-banana-soft dark:text-banana dark:bg-slate-800">
                        {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 rounded-2xl p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/20 dark:border-white/10" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-3">
                    <p className="font-black text-sm text-foreground">{user?.firstName} {user?.lastName}</p>
                    <p className="truncate text-xs text-muted-foreground font-bold opacity-70">
                      {user?.email}
                    </p>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:bg-banana/10 dark:text-banana w-fit">
                      {user?.role?.replace('_', ' ')}
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="rounded-xl focus:bg-blue-600 focus:text-white dark:focus:bg-banana dark:focus:text-blue-900">
                    <Link href="/profile" className="flex items-center p-2 font-bold">
                      <User className="mr-3 h-4 w-4" />
                      {t('common.profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl focus:bg-blue-600 focus:text-white dark:focus:bg-banana dark:focus:text-blue-900">
                    <Link href="/settings" className="flex items-center p-2 font-bold">
                      <Settings className="mr-3 h-4 w-4" />
                      {t('common.settings')}
                    </Link>
                  </DropdownMenuItem>

                  {/* Conditional Admin Links */}
                  {(user?.role === 'REGIONAL_ADMIN' || user?.role === 'SUPER_ADMIN') && (
                    <>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem asChild className="rounded-xl focus:bg-blue-600 focus:text-white dark:focus:bg-banana dark:focus:text-blue-900">
                        <Link href="/admin/regional" className="flex items-center p-2 font-bold">
                          <Shield className="mr-3 h-4 w-4" />
                          {t('admin.regional')}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {user?.role === 'SUPER_ADMIN' && (
                    <DropdownMenuItem asChild className="rounded-xl focus:bg-blue-600 focus:text-white dark:focus:bg-banana dark:focus:text-blue-900">
                      <Link href="/admin/system" className="flex items-center p-2 font-bold">
                        <Settings className="mr-3 h-4 w-4" />
                        {t('admin.system')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="rounded-xl focus:bg-red-500 focus:text-white">
                    <button className="w-full text-left flex items-center p-2 font-bold text-red-500" onClick={() => logout()}>
                      <LogOut className="mr-3 h-4 w-4" />
                      {t('common.logout')}
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button size="sm" className="font-black rounded-xl bg-blue-600 text-white">{t('common.sign_in')}</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for Fixed Header */}
      <div className="h-16" />

      {/* Mobile Bottom Navigation - Floating Glass Dock */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-8 sm:pb-10 pointer-events-none safe-area-bottom">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-2xl rounded-[32px] px-2 py-2 pointer-events-auto mx-auto max-w-sm"
          >
            <div className="flex items-center justify-around gap-1">
              {allNavigation.slice(0, 5).map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 group",
                      isActive
                        ? 'text-blue-600 dark:text-banana'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="mobile-dock-active"
                          className="absolute inset-x-1 inset-y-1 bg-blue-500/10 dark:bg-banana/10 border-b-2 border-blue-500 dark:border-banana rounded-2xl z-0"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>
                    <Icon className={cn(
                      "w-5 h-5 relative z-10 transition-transform duration-300",
                      isActive ? 'scale-110 stroke-[2.5px]' : 'group-active:scale-95'
                    )} />
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
