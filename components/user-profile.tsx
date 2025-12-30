'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { User, LogOut, LayoutDashboard, Shield } from 'lucide-react'
import Link from 'next/link'

export function UserProfile() {
  const { user, logout } = useAuth()

  if (!user) return null

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted/50 transition-colors focus-visible:ring-2 focus-visible:ring-banana/50">
          <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-banana/50 transition-all">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${initials}&background=random`} alt={fullName} />
            <AvatarFallback className="bg-banana/10 text-banana-700 dark:text-banana font-black">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2 rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl shadow-xl" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-black leading-none text-foreground">{fullName}</p>
            <p className="text-xs leading-none text-muted-foreground font-medium truncate">
              {user.email}
            </p>
            <div className="flex gap-2 mt-3">
              <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg px-2 py-0.5 font-bold uppercase tracking-wider border-none">
                {user.role}
              </Badge>
              {user.region && (
                <Badge variant="outline" className="text-[10px] border-banana/50 text-yellow-700 dark:text-yellow-400 rounded-lg px-2 py-0.5 font-bold uppercase tracking-wider">
                  {user.region}
                </Badge>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50 my-1" />
        <Link href="/dashboard">
          <DropdownMenuItem className="rounded-xl cursor-pointer p-3 focus:bg-banana/10 focus:text-banana-700 dark:focus:text-banana font-medium transition-colors">
            <LayoutDashboard className="mr-3 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/profile">
          <DropdownMenuItem className="rounded-xl cursor-pointer p-3 focus:bg-banana/10 focus:text-banana-700 dark:focus:text-banana font-medium transition-colors">
            <User className="mr-3 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        {(user.role === 'SUPER_ADMIN' || user.role === 'REGIONAL_ADMIN') && (
          <Link href="/admin/system">
            <DropdownMenuItem className="rounded-xl cursor-pointer p-3 focus:bg-banana/10 focus:text-banana-700 dark:focus:text-banana font-medium transition-colors">
              <Shield className="mr-3 h-4 w-4" />
              <span>Admin Panel</span>
            </DropdownMenuItem>
          </Link>
        )}
        <DropdownMenuSeparator className="bg-border/50 my-1" />
        <DropdownMenuItem onClick={() => logout()} className="rounded-xl cursor-pointer p-3 focus:bg-red-100 focus:text-red-700 dark:focus:bg-red-900/30 dark:focus:text-red-400 text-red-600 font-medium transition-colors">
          <LogOut className="mr-3 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
