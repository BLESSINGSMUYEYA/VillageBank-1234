import { MobileNavigation } from '@/components/layout/MobileNavigation'
import { DesktopNavigation } from '@/components/layout/DesktopNavigation'
import { Footer } from '@/components/layout/Footer'

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
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
    )
}
