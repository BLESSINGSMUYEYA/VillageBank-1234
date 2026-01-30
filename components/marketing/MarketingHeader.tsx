'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UBankLogo } from '@/components/ui/Logo'
import { AppLogo } from '@/components/ui/AppLogo'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function MarketingHeader() {
    const { t } = useLanguage()
    const pathname = usePathname()

    // Determine active link style
    const getLinkClass = (path: string) => cn(
        "text-label-caps transition-colors text-sm", // Explicitly added text-sm to match original size if label-caps is smaller
        pathname === path
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
    )

    const navItems = [
        { label: 'ecosystem', path: '/ecosystem' },
        { label: 'security', path: '/security' },
        { label: 'features', path: '/features' },
        { label: 'pricing', path: '/pricing' },
        { label: 'about', path: '/about' },
        { label: 'help', path: '/help' },
    ]

    return (
        <header className="container mx-auto px-6 py-8 flex items-center justify-between relative z-50">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                <AppLogo textClassName="text-2xl" />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
                <nav className="flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link key={item.path} href={item.path} className={getLinkClass(item.path)}>
                            {t(`landing.${item.label}` as any) || item.label}
                        </Link>
                    ))}
                </nav>
                <Link href="/login">
                    <Button className="h-11 rounded-xl px-6 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all">
                        {t('landing.launch_app')}
                    </Button>
                </Link>
            </div>

            {/* Mobile Nav Toggle */}
            <div className="lg:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl">
                            <Menu className="w-6 h-6 text-slate-900 dark:text-white" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] border-l border-white/10 bg-slate-950/80 backdrop-blur-xl">
                        <SheetTitle className="hidden">Mobile Navigation</SheetTitle>
                        <div className="flex flex-col h-full pt-10">
                            <div className="flex items-center gap-3 mb-10 px-2">
                                <AppLogo textClassName="text-2xl" theme="dark" />
                            </div>
                            <nav className="flex flex-col gap-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className={cn(
                                            "px-4 py-3 rounded-xl transition-all text-label-caps text-base", // Added text-base to slightly increase size for mobile usage if needed, or stick to utility
                                            pathname === item.path
                                                ? "text-white bg-white/10"
                                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        {t(`landing.${item.label}` as any) || item.label}
                                    </Link>
                                ))}
                            </nav>
                            <div className="mt-auto pb-8 space-y-4">
                                <Link href="/login" className="block">
                                    <Button size="xl" variant="premium" className="w-full">
                                        {t('landing.launch_app')}
                                    </Button>
                                </Link>
                                <Link href="/register" className="block">
                                    <Button size="xl" variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                                        Become a Member
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    )
}
