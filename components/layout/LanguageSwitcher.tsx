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

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-12 px-0 flex items-center justify-center">
                    <Languages className="h-4 w-4 mr-1" />
                    <span className="text-xs font-bold uppercase">{language}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => setLanguage('en')}
                    className={language === 'en' ? 'bg-blue-50 font-bold' : ''}
                >
                    English
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setLanguage('ny')}
                    className={language === 'ny' ? 'bg-blue-50 font-bold' : ''}
                >
                    Chichewa
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
