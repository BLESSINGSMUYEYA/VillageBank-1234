'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { 
  Menu, 
  Home, 
  Users, 
  DollarSign, 
  FileText, 
  BarChart3, 
  Settings, 
  User,
  Bell,
  LogOut
} from 'lucide-react'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'

interface MobileNavigationProps {
  unreadNotifications?: number
}

export function MobileNavigation({ unreadNotifications = 0 }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useUser()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Groups', href: '/groups', icon: Users },
    { name: 'Contributions', href: '/contributions', icon: DollarSign },
    { name: 'Loans', href: '/loans', icon: FileText },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="lg:hidden">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col h-full">
                {/* User Info */}
                <div className="p-4 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t space-y-2">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm font-medium">Notifications</span>
                    <NotificationCenter />
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      // Handle logout
                      window.location.href = '/sign-out'
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold">Village Banking</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <NotificationCenter />
          <Badge variant="outline" className="text-xs">
            {(user?.publicMetadata?.role as string) || 'MEMBER'}
          </Badge>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navigation.slice(0, 5).map((item) => {
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
