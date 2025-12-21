'use client'

import { useUser, useAuth, SignInButton, SignUpButton, SignOutButton } from '@clerk/nextjs'
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
  Settings,
  LogOut,
  Shield,
  User
} from 'lucide-react'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'

export function DesktopNavigation() {
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

  const isActive = (href: string) => pathname === href

  return (
    <header className="hidden lg:flex bg-white/60 dark:bg-gray-900/60 backdrop-blur-md shadow-lg border-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                {t('common.dashboard')}
              </h1>
            </div>
            <nav className="hidden md:ml-6 md:flex md:space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-300 ${isActive(item.href)
                    ? 'bg-[#6c47ff] text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              ))}
              {adminNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-300 ${isActive(item.href)
                    ? 'bg-[#6c47ff] text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-3">
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
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="w-full cursor-pointer rounded-xl font-bold">
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
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="outline" className="rounded-2xl font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-[#6c47ff] hover:text-[#6c47ff] transition-colors">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-[#6c47ff] to-[#9d81ff] text-white rounded-2xl font-bold text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 shadow-lg hover:shadow-xl transition-all duration-300">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
