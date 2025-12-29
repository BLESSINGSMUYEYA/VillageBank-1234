import { MobileNavigation } from '@/components/layout/MobileNavigation'
import { DesktopNavigation } from '@/components/layout/DesktopNavigation'
import { Footer } from '@/components/layout/Footer'

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50 relative selection:bg-banana selection:text-banana-foreground">
            {/* Ambient Background Gradient */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-100/50 via-slate-50/20 to-transparent dark:from-blue-950/20 dark:via-slate-950/0 dark:to-transparent opacity-60 mix-blend-multiply dark:mix-blend-screen" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Mobile Navigation */}
                <MobileNavigation />

                {/* Desktop Header */}
                <DesktopNavigation />

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:pt-8 pb-16 lg:pb-8 animate-fade-in">
                    {children}
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </div>
    )
}
