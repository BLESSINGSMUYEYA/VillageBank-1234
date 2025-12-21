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
      { name: 'Regional Admin', href: '/admin/regional', icon: Shield }
    )
  }
  if (user?.publicMetadata?.role === 'SUPER_ADMIN') {
    adminNavigation.push(
      { name: 'System Admin', href: '/admin/system', icon: Settings }
    )
  }

  const allNavigation = [...navigation, ...adminNavigation]

  return (
    <div className="lg:hidden">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold text-gray-900">{t('common.dashboard')}</h1>
        </div>

        <div className="flex items-center space-x-2">
          <LanguageSwitcher />
          {user && <NotificationCenter />}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.fullName || user?.username || 'User'}</p>
                    <p className="w-50 truncate text-sm text-muted-foreground">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.publicMetadata?.role as string || 'User'}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="w-full cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <SignOutButton>
                    <button className="w-full text-left">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </button>
                  </SignOutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm h-8 px-3">
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
