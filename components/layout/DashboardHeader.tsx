'use client'

import React from 'react'
import { Bell, Menu, Search, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { MobileNavigation } from '@/components/layout/MobileNavigation'
import { DesktopUserMenu } from '@/components/layout/DesktopUserMenu'
import { usePathname } from 'next/navigation'
import { GlassCard } from '@/components/ui/GlassCard'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { useAuth } from '@/components/providers/AuthProvider'
import { cn } from '@/lib/utils'

export function DashboardHeader() {
    const pathname = usePathname();
    const pathSegments = pathname.split('/').filter(Boolean);
    const { t } = useLanguage();
    const { user } = useAuth();

    return (
        <header className="hidden lg:block sticky top-0 z-40 w-full px-4 sm:px-8 py-4">
            <GlassCard className="rounded-2xl border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm px-4 h-16 flex items-center justify-between" hover={false}>
                {/* Left: Mobile Menu & Breadcrumbs */}
                <div className="flex items-center gap-4">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden shrink-0 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 border-r-0 w-[80vw] sm:w-[350px]">
                            <MobileNavigation />
                        </SheetContent>
                    </Sheet>
                    {/* Breadcrumbs (Desktop) */}
                    <div className="hidden md:flex items-center gap-2 text-sm">
                        <span className="text-slate-400 font-bold">uBank</span>
                        {pathSegments.map((segment, index) => (
                            <React.Fragment key={segment}>
                                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                                <span className={cn(
                                    "font-bold capitalize",
                                    index === pathSegments.length - 1 ? "text-slate-900 dark:text-white" : "text-slate-400"
                                )}>
                                    {segment}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Mobile Title (When Breadcrumbs are hidden) */}
                    <div className="md:hidden">
                        <span className="font-black text-slate-900 dark:text-white capitalize">
                            {pathSegments[pathSegments.length - 1] || 'Dashboard'}
                        </span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                        <Search className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                    </Button>

                    <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 mx-1" />

                    <DesktopUserMenu user={user} />
                </div>
            </GlassCard>
        </header>
    )
}
