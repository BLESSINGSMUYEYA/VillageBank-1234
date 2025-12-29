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

  // Logic to determine which links to show
  let displayedNavigation = memberNavigation

  if (user?.role === 'REGIONAL_ADMIN') {
    // Regional Admins ONLY see their admin page
    displayedNavigation = []
    adminNavigation.push(
      { name: 'Regional Admin', href: '/admin/regional', icon: Shield }
    )
  } else if (user?.role === 'SUPER_ADMIN') {
    // Super Admins ONLY see admin pages
    displayedNavigation = []
    adminNavigation.push(
      { name: 'Regional Admin', href: '/admin/regional', icon: Shield },
      { name: 'System Admin', href: '/admin/system', icon: Settings }
    )
  }

  const isActive = (href: string) => pathname === href

  const NavigationLink = ({ item }: { item: any }) => (
    <Link
      key={item.name}
      href={item.href}
      className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${isActive(item.href)
        ? 'bg-banana/15 text-yellow-700 dark:text-banana shadow-sm'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
    >
      <item.icon className={`w-4 h-4 mr-2 ${isActive(item.href) ? 'stroke-[2.5px]' : ''}`} />
      {item.name}
    </Link>
  )

  return (
    <header className="hidden lg:flex sticky top-0 z-40 w-full backdrop-blur-xl bg-background/70 border-b border-border/50 support-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="shrink-0 flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
                <span className="text-white font-black text-lg">V</span>
              </div>
              <h1 className="text-xl font-black bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-900 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
                Village Bank
              </h1>
            </Link>
            <nav className="hidden md:flex items-center space-x-1">
              {displayedNavigation.map((item) => (
                <NavigationLink key={item.name} item={item} />
              ))}
              {adminNavigation.length > 0 && (
                <div className="h-6 w-px bg-border mx-2" />
              )}
              {adminNavigation.map((item) => (
                <NavigationLink key={item.name} item={item} />
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            {user && (
              <>
                <div className="h-6 w-px bg-border/50" />
                <NotificationCenter />
                <DesktopUserMenu user={user} />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
