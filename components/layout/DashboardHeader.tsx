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
import { AppLogo } from '@/components/ui/AppLogo' // Imported AppLogo
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher' // Imported LanguageSwitcher
import { NotificationCenter } from '@/components/notifications/NotificationCenter' // Imported NotificationCenter

import { PersonalQRCard } from '@/components/personal/PersonalQRCard' // Imported PersonalQRCard

export function DashboardHeader() {
    const { user } = useAuth();
    const { t } = useLanguage();

    return (
        <header className="hidden lg:block sticky top-0 z-40 w-full px-6 py-4 transition-all duration-300">
            <GlassCard
                className="relative rounded-2xl border-white/40 dark:border-white/5 bg-white dark:bg-slate-950 shadow-lg shadow-emerald-900/5 px-6 h-[72px] flex items-center justify-between overflow-visible"
                hover={false}
            >
                {/* Ambient Glow Effects within Header */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 opacity-50" />

                <div className="w-full h-full flex items-center justify-between">
                    {/* Left: Logo & Brand */}
                    <Link href="/dashboard" className="group relative z-10">
                        <AppLogo />
                    </Link>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />

                        <NotificationCenter />

                        <PersonalQRCard user={user} />

                        <DesktopUserMenu user={user} />
                    </div>
                </div>
            </GlassCard>
        </header>
    )
}
