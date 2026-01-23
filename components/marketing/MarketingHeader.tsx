'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UBankLogo } from '@/components/ui/Logo'
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
                <div className="w-10 h-10 bg-[#D8F3DC] dark:bg-emerald-950/30 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform border border-emerald-100 dark:border-emerald-500/10">
                    <UBankLogo className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                    uBank
                </span>
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
                    <Button size="xl" className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-xl hover:scale-105 transition-all">
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
                    <SheetContent side="right" className="w-[300px] border-l border-white/10 bg-slate-950/95 backdrop-blur-xl">
                        <SheetTitle className="hidden">Mobile Navigation</SheetTitle>
                        <div className="flex flex-col h-full pt-10">
                            <div className="flex items-center gap-3 mb-10 px-2">
                                <div className="w-10 h-10 bg-[#D8F3DC] rounded-xl flex items-center justify-center shadow-lg border border-[#B7E4C7]">
                                    <UBankLogo className="w-6 h-6" />
                                </div>
                                <span className="text-2xl font-black text-white tracking-tighter">
                                    uBank
                                </span>
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
                                    <Button size="xl" className="w-full bg-emerald-600 text-white shadow-xl hover:bg-emerald-700 transition-all">
                                        {t('landing.launch_app')}
                                    </Button>
                                </Link>
                                <Link href="/register" className="block">
                                    <Button size="xl" variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                                        Create Account
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
