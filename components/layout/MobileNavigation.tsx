'use client'

import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Users, 
  DollarSign, 
  FileText, 
  BarChart3, 
  Settings, 
  User
} from 'lucide-react'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'

interface MobileNavigationProps {
  unreadNotifications?: number
}

export function MobileNavigation({ unreadNotifications = 0 }: MobileNavigationProps) {
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
