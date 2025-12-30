'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useLanguage } from '@/components/providers/LanguageProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Home,
  Users,
  DollarSign,
  CreditCard,
  Shield,
  Settings,
  LogOut,
  User
} from 'lucide-react'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// Interface for MobileNavigationProps removed as unreadNotifications was unused

export function MobileNavigation() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const { t } = useLanguage()

  // Define member-specific navigation
  const memberNavigation = [
    { name: t('common.dashboard'), href: '/dashboard', icon: Home },
    { name: t('common.groups'), href: '/groups', icon: Users },
    { name: t('common.contributions'), href: '/contributions', icon: DollarSign },
    { name: t('common.loans'), href: '/loans', icon: CreditCard },
  ]

  const adminNavigation = []

  // Logic to determine which links to show
  const displayedNavigation = memberNavigation

  if (user?.role === 'REGIONAL_ADMIN') {
    adminNavigation.push(
      { name: t('admin.regional'), href: '/admin/regional', icon: Shield }
    )
  } else if (user?.role === 'SUPER_ADMIN') {
    adminNavigation.push(
      { name: t('admin.regional'), href: '/admin/regional', icon: Shield },
      { name: t('admin.system'), href: '/admin/system', icon: Settings }
    )
  }

  const allNavigation = [...displayedNavigation, ...adminNavigation]

  return (
    <div className="lg:hidden">
      {/* Mobile Header - Nano Glass */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between p-4 px-6">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 group-active:scale-95 transition-transform">
              <span className="text-white font-black text-sm">V</span>
            </div>
            <div>
              <h1 className="text-lg font-black bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-900 dark:from-white dark:to-blue-200 bg-clip-text text-transparent leading-none">Village Bank</h1>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none mt-1">Premium Member</p>
            </div>
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
                <Button size="sm" className="font-black rounded-xl bg-blue-600 text-white">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for Fixed Header */}
      <div className="h-16" />

      {/* Mobile Bottom Navigation - Floating Glass Dock */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-6 pointer-events-none">
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
