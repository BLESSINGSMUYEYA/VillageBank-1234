'use client'

import { MobileNavigation } from '@/components/layout/MobileNavigation'
import { DesktopNavigation } from '@/components/layout/DesktopNavigation'
import { Footer } from '@/components/layout/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'

import { DashboardHeader } from '@/components/layout/DashboardHeader'

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    return (
        <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#020617] relative selection:bg-banana selection:text-banana-foreground overflow-x-hidden">
            {/* Ambient Background Layer 1: Global Glow */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/5 dark:bg-emerald-500/5 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-600/5 dark:bg-teal-500/5 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
            </div>

            <div className="relative z-10 flex min-h-screen">
                {/* Desktop Sidebar */}
                <DesktopNavigation />

                {/* Content Area with Sidebar Offset */}
                <div className="flex-1 lg:pl-72 transition-all duration-300 flex flex-col min-h-screen">
                    {/* Header */}
                    <DashboardHeader />

                    {/* Main Content with Transition */}
                    <main className="px-4 sm:px-8 py-2 relative z-10 w-full flex-1">
                        {children}
                        <InstallPrompt />
                    </main>

                    {/* Footer */}
                    <Footer />
                </div>

                {/* Mobile Navigation (Floating or Bottom - keeping existing for now but hidden on large) */}
                <div className="lg:hidden">
                    <MobileNavigation />
                </div>
            </div>
        </div>
    )
}
