'use client'

import { MobileNavigation } from '@/components/layout/MobileNavigation'
import { DesktopNavigation } from '@/components/layout/DesktopNavigation'
import { Footer } from '@/components/layout/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] relative selection:bg-banana selection:text-banana-foreground overflow-x-hidden">
            {/* Ambient Background Layer 1: Global Glow */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-banana/10 dark:bg-banana/5 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
            </div>

            {/* Ambient Background Layer 2: Mesh Gradient */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent_50%)]" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Mobile Navigation */}
                <MobileNavigation />

                {/* Desktop Header */}
                <DesktopNavigation />

                {/* Main Content with Transition */}
                <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:pt-8 pb-24 lg:pb-8 relative z-10 w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10, scale: 0.99 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 1.01 }}
                            transition={{
                                duration: 0.3,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </div>
    )
}
