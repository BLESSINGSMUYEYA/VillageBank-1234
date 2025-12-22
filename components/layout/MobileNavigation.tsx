'use client'

import { useUser, useAuth, SignInButton, SignUpButton, SignOutButton } from '@clerk/nextjs'
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
  const { user, isLoaded } = useUser()
  const pathname = usePathname()

  const { t } = useLanguage()

  const navigation = [
    { name: t('common.dashboard'), href: '/dashboard', icon: Home },
    { name: t('common.groups'), href: '/groups', icon: Users },
    { name: t('common.contributions'), href: '/contributions', icon: DollarSign },
    { name: t('common.loans'), href: '/loans', icon: CreditCard },
  ]

  const adminNavigation = []
  if (user?.publicMetadata?.role === 'REGIONAL_ADMIN' || user?.publicMetadata?.role === 'SUPER_ADMIN') {
    adminNavigation.push(
      { name: t('admin.regional'), href: '/admin/regional', icon: Shield }
    )
  }
  if (user?.publicMetadata?.role === 'SUPER_ADMIN') {
    adminNavigation.push(
      { name: t('admin.system'), href: '/admin/system', icon: Settings }
    )
  }

  const allNavigation = [...navigation, ...adminNavigation]

  return (
    <div className="lg:hidden">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md shadow-lg">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">Village Bank</h1>
        </div>

        <div className="flex items-center space-x-2">
          <LanguageSwitcher />
          {user && <NotificationCenter />}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#6c47ff] to-[#9d81ff] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <Avatar className="relative h-8 w-8 bg-white dark:bg-gray-800 rounded-full border-2 border-white dark:border-gray-950 shadow-xl overflow-hidden">
                      <AvatarFallback className="font-black bg-gradient-to-br from-[#6c47ff] to-[#9d81ff] bg-clip-text text-transparent">
                        {user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 border-none shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-black text-sm">{user?.fullName || user?.username || 'User'}</p>
                    <p className="w-50 truncate text-xs text-gray-500">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {user?.publicMetadata?.role as string || 'User'}
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
                  <SignOutButton>
                    <button className="w-full text-left">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('common.logout')}
                    </button>
                  </SignOutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="outline" size="sm" className="rounded-2xl font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-[#6c47ff] hover:text-[#6c47ff] transition-colors">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-[#6c47ff] to-[#9d81ff] text-white rounded-2xl font-bold text-sm h-8 px-3 shadow-lg hover:shadow-xl transition-all duration-300">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-6">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2rem] px-2 py-2">
          <div className="flex items-center justify-around gap-1">
            {allNavigation.slice(0, 5).map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-300 group ${isActive
                    ? 'text-[#6c47ff]'
                    : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                  {/* Background Glow for Active State */}
                  {isActive && (
                    <div className="absolute inset-0 bg-[#6c47ff]/10 rounded-2xl animate-in fade-in zoom-in duration-300" />
                  )}

                  <Icon className={`w-5 h-5 mb-1 transition-transform duration-300 group-active:scale-90 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'
                    }`} />

                  <span className={`text-[10px] font-medium tracking-wide truncate max-w-[64px] transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                    }`}>
                    {item.name}
                  </span>

                  {/* Dot indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 w-1 h-1 bg-[#6c47ff] rounded-full shadow-[0_0_8px_rgba(108,71,255,0.8)]" />
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
