'use client'

import { Search, Mail } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { DesktopUserMenu } from './DesktopUserMenu'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'

export function DashboardHeader() {
    const { user } = useAuth()

    return (
        <header className="h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8 border-b border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
            {/* Search Bar - Responsive Width */}
            {/* Search Bar - Hidden/Removed */}
            <div className="flex-1" />

            {/* Right Side Actions */}
            <div className="flex items-center gap-3 sm:gap-6 ml-4">
                <div className="hidden xs:flex items-center gap-2">
                    <button className="hidden sm:flex w-10 h-10 items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                        <Mail className="w-5 h-5 text-slate-500" />
                    </button>

                    <NotificationCenter align="right" />
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-2 sm:gap-4 pl-3 sm:pl-6 border-l border-slate-200">
                    <Link href="/profile" className="hidden md:flex flex-col items-end hover:opacity-80 transition-opacity">
                        <span className="text-sm font-bold text-[#1B4332]">
                            {user?.firstName} {user?.lastName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium line-clamp-1 max-w-[120px]">
                            {user?.email}
                        </span>
                    </Link>
                    <DesktopUserMenu user={user} />
                </div>
            </div>
        </header>
    )
}
