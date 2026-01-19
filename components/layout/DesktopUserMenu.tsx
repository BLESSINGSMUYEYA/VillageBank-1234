'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useLanguage } from '@/components/providers/LanguageProvider'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Settings, LogOut, User, Shield, History } from 'lucide-react'

interface DesktopUserMenuProps {
    user: any
}

export function DesktopUserMenu({ user }: DesktopUserMenuProps) {
    const { logout } = useAuth()
    const { t } = useLanguage()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-xl hover:bg-banana/10 transition-colors">
                    <Avatar className="h-9 w-9 border border-border/50 rounded-lg shadow-sm">
                        <AvatarFallback className="font-black text-blue-900 bg-banana-soft dark:text-banana dark:bg-blue-900">
                            {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
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
                    <Link href="/profile" className="w-full cursor-pointer rounded-lg font-bold">
                        <User className="mr-2 h-4 w-4" />
                        {t('common.profile')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/activity" className="w-full cursor-pointer rounded-lg font-bold">
                        <History className="mr-2 h-4 w-4" />
                        {t('dashboard.recent_activity') || 'Activity'}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/settings" className="w-full cursor-pointer rounded-lg font-bold">
                        <Settings className="mr-2 h-4 w-4" />
                        {t('common.settings')}
                    </Link>
                </DropdownMenuItem>

                {/* Conditional Admin Links */}
                {(user?.role === 'REGIONAL_ADMIN' || user?.role === 'SUPER_ADMIN') && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/admin/regional" className="w-full cursor-pointer rounded-lg font-bold">
                                <Shield className="mr-2 h-4 w-4" />
                                Regional Admin
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}
                {user?.role === 'SUPER_ADMIN' && (
                    <DropdownMenuItem asChild>
                        <Link href="/admin/system" className="w-full cursor-pointer rounded-lg font-bold">
                            <Settings className="mr-2 h-4 w-4" />
                            System Admin
                        </Link>
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <button className="w-full text-left flex items-center font-bold text-red-500" onClick={() => logout()}>
                        <LogOut className="mr-2 h-4 w-4" />
                        {t('common.logout')}
                    </button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
