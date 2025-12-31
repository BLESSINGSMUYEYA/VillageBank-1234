'use client'

import { useLanguage } from '@/components/providers/LanguageProvider'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage()

    const languages = [
        { id: 'en', label: 'English', region: 'Global', flag: '🇬🇧' },
        { id: 'ny', label: 'Chichewa', region: 'Malawi / Zambia', flag: '🇲🇼' },
        { id: 'bem', label: 'Bemba', region: 'Zambia / DRC', flag: '🇿🇲' },
        { id: 'fr', label: 'Français', region: 'DRC / Rwanda', flag: '🇫🇷' }
    ] as const

    const currentLang = languages.find(l => l.id === language) || languages[0]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-auto px-3 flex items-center gap-2 rounded-2xl hover:bg-white/40 dark:hover:bg-slate-900/40 border border-white/20 dark:border-white/5 shadow-sm transition-all group">
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
                        {currentLang.flag}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest hidden sm:inline-block">{currentLang.id}</span>
                    <Languages className="h-3.5 w-3.5 opacity-50 group-hover:rotate-12 transition-transform" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-3xl bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-2xl">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.id}
                        onClick={() => setLanguage(lang.id)}
                        className={cn(
                            "flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-colors mb-1 last:mb-0",
                            language === lang.id
                                ? "bg-blue-600 text-white dark:bg-banana dark:text-blue-950 font-black"
                                : "hover:bg-blue-50 dark:hover:bg-slate-900"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">{lang.flag}</span>
                            <div className="flex flex-col">
                                <span className="text-sm">{lang.label}</span>
                                <span className={cn(
                                    "text-[10px] opacity-70",
                                    language === lang.id ? "text-white/80 dark:text-blue-900/80" : "text-muted-foreground"
                                )}>
                                    {lang.region}
                                </span>
                            </div>
                        </div>
                        {language === lang.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-blue-900 animate-pulse" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
