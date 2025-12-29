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

interface MobileNavigationProps {
  unreadNotifications?: number
}

export function MobileNavigation({ unreadNotifications = 0 }: MobileNavigationProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const pathname = usePathname()
  const { t } = useLanguage()

  // Define member-specific navigation
  const memberNavigation = [
    { name: t('common.dashboard'), href: '/dashboard', icon: Home },
    { name: t('common.groups'), href: '/groups', icon: Users },
    { name: t('common.contributions'), href: '/contributions', icon: DollarSign },
    { name: t('common.loans'), href: '/loans', icon: CreditCard },
  ]

  const adminNavigation: any[] = []

  // Logic to determine which links to show
  let displayedNavigation = memberNavigation

  if (user?.role === 'REGIONAL_ADMIN') {
    // Regional Admins ONLY see their admin page
    displayedNavigation = []
    adminNavigation.push(
      { name: t('admin.regional'), href: '/admin/regional', icon: Shield }
    )
  } else if (user?.role === 'SUPER_ADMIN') {
    // Super Admins ONLY see admin pages
    displayedNavigation = []
    adminNavigation.push(
      { name: t('admin.regional'), href: '/admin/regional', icon: Shield },
      { name: t('admin.system'), href: '/admin/system', icon: Settings }
    )
  }

  const allNavigation = [...displayedNavigation, ...adminNavigation]

  return (
    <div className="lg:hidden">
      {/* Mobile Header - Nano Glass */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-sm transition-all duration-300">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-sm">V</span>
          </div>
          <h1 className="text-xl font-black bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-900 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">Village Bank</h1>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {user && <NotificationCenter />}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-xl hover:bg-banana/10 transition-colors p-0">
                  <Avatar className="h-8 w-8 border border-border/50 rounded-lg">
                    <AvatarFallback className="font-black text-xs text-blue-900 bg-banana-soft dark:text-banana dark:bg-blue-900">
                      {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-black text-sm text-foreground">{user?.firstName} {user?.lastName}</p>
                    <p className="w-50 truncate text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {user?.role}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="w-full cursor-pointer rounded-lg font-bold">
                    <User className="mr-2 h-4 w-4" />
                    {t('common.profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="w-full cursor-pointer rounded-lg font-bold">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('common.settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <button className="w-full text-left flex items-center font-bold text-red-500" onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('common.logout')}
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-bold">Sign In</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Spacer for Fixed Header */}
      <div className="h-16" />

      {/* Mobile Bottom Navigation - Floating Glass Dock */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-6 pointer-events-none">
          <div className="bg-background/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-full px-2 py-2 pointer-events-auto mx-auto max-w-sm">
            <div className="flex items-center justify-around gap-1">
              {allNavigation.slice(0, 5).map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 group ${isActive
                      ? 'text-yellow-600 dark:text-banana'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-banana/10 rounded-full animate-in fade-in zoom-in duration-200" />
                    )}
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 stroke-[2.5px]' : ''}`} />
                    {isActive && (
                      <div className="absolute -bottom-1 w-1 h-1 bg-yellow-500 dark:bg-banana rounded-full" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
