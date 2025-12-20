'use client'

import { useUser, useAuth, SignInButton, SignUpButton, SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'
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

interface MobileNavigationProps {
  unreadNotifications?: number
}

export function MobileNavigation({ unreadNotifications = 0 }: MobileNavigationProps) {
  const { user, isLoaded } = useUser()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Groups', href: '/groups', icon: Users },
    { name: 'Contributions', href: '/contributions', icon: DollarSign },
    { name: 'Loans', href: '/loans', icon: CreditCard },
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
          <h1 className="text-xl font-semibold text-gray-900">Village Banking</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <NotificationCenter />
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
              <SignInButton />
              <SignUpButton>
                <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm h-8 px-3 cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {allNavigation.slice(0, 5).map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center py-2 px-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="truncate max-w-full">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
