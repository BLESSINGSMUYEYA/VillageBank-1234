'use client'

import React from 'react'
import Link from 'next/link' // Added Link
import { MobileNavigation } from '@/components/layout/MobileNavigation'
import { DesktopUserMenu } from '@/components/layout/DesktopUserMenu'
import { usePathname } from 'next/navigation'
import { GlassCard } from '@/components/ui/GlassCard'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { useAuth } from '@/components/providers/AuthProvider'
import { UBankLogo } from '@/components/ui/Logo' // Imported Logo
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher' // Imported LanguageSwitcher
import { NotificationCenter } from '@/components/notifications/NotificationCenter' // Imported NotificationCenter

export function DashboardHeader() {
    const { user } = useAuth();
    const { t } = useLanguage();

    return (
        <header className="hidden lg:block sticky top-0 z-40 w-full px-6 py-4 transition-all duration-300">
            <GlassCard
                className="relative rounded-2xl border-white/40 dark:border-white/5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl shadow-lg shadow-emerald-900/5 px-6 h-[72px] flex items-center justify-between overflow-visible"
                hover={false}
            >
                {/* Ambient Glow Effects within Header */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 opacity-50" />

                <div className="w-full h-full flex items-center justify-between">
                    {/* Left: Logo & Brand */}
                    <Link href="/dashboard" className="group relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#D8F3DC] rounded-xl flex items-center justify-center group-active:scale-95 transition-transform shadow-sm group-hover:shadow-md">
                                <UBankLogo className="w-6 h-6 text-[#2D6A4F]" />
                            </div>
                            <span className="text-xl font-bold text-[#1B4332] dark:text-white tracking-tight">uBank</span>
                        </div>
                    </Link>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />

                        <NotificationCenter />

                        <DesktopUserMenu user={user} />
                    </div>
                </div>
            </GlassCard>
        </header>
    )
}
