'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useLanguage } from '@/components/providers/LanguageProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
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

  const adminNavigation = []

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
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b border-border shadow-sm">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl sm:text-2xl font-black text-blue-900 dark:text-blue-100">Village Bank</h1>
        </div>

        <div className="flex items-center space-x-2">
          <LanguageSwitcher />
          {user && <NotificationCenter />}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted/50 transition-colors">
                  <div className="relative group">
                    <Avatar className="relative h-8 w-8 bg-card border border-border">
                      <AvatarFallback className="font-black text-blue-700 dark:text-blue-300 dark:bg-blue-900">
                        {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 border border-border shadow-xl bg-card" align="end" forceMount>
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
                  <Link href="/profile" className="w-full cursor-pointer rounded-xl font-bold">
                    <User className="mr-2 h-4 w-4" />
                    {t('common.profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="w-full cursor-pointer rounded-xl font-bold">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('common.settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <button className="w-full text-left flex items-center" onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('common.logout')}
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="outline" size="sm" className="rounded-xl font-bold bg-card border-border hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-400 dark:hover:border-blue-400 transition-colors">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-blue-900 text-white dark:bg-blue-700 dark:hover:bg-blue-600 rounded-xl font-bold text-sm h-8 px-3 hover:bg-blue-800 transition-all duration-200 shadow-sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-6">
        <div className="bg-card border border-border shadow-xl rounded-[2rem] px-2 py-2">

          <div className="flex items-center justify-around gap-1">
            {allNavigation.slice(0, 5).map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-200 group ${isActive
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                >
                  {/* Background Glow for Active State */}
                  {isActive && (
                    <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/30 rounded-2xl animate-in fade-in zoom-in duration-200" />
                  )}

                  <Icon className={`w-5 h-5 mb-1 transition-transform duration-300 group-active:scale-90 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'
                    }`} />

                  <span className={`text-[10px] font-medium tracking-wide truncate max-w-[64px] transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                    }`}>
                    {item.name}
                  </span>

                  {/* Dot indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 w-1 h-1 bg-blue-700 dark:bg-blue-300 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
