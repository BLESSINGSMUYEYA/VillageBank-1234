'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import en from '../../dictionaries/en.json'
import ny from '../../dictionaries/ny.json'

type Language = 'en' | 'ny'
type Dictionary = typeof en

const dictionaries: Record<Language, any> = {
    en,
    ny
}

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en')
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const savedLang = localStorage.getItem('app-language') as Language
        if (savedLang && (savedLang === 'en' || savedLang === 'ny')) {
            setLanguageState(savedLang)
        }
        setIsLoaded(true)
    }, [])

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem('app-language', lang)
    }, [])

    const t = useCallback((key: string): string => {
        const keys = key.split('.')
        let result: any = dictionaries[language]

        for (const k of keys) {
            if (result && k in result) {
                result = result[k]
            } else {
                // Fallback to English if key missing in Chichewa
                if (language === 'ny') {
                    let fallbackResult: any = dictionaries['en']
                    for (const fk of keys) {
                        if (fallbackResult && fk in fallbackResult) {
                            fallbackResult = fallbackResult[fk]
                        } else {
                            return key
                        }
                    }
                    return typeof fallbackResult === 'string' ? fallbackResult : key
                }
                return key
            }
        }

        return typeof result === 'string' ? result : key
    }, [language])

    if (!isLoaded) {
        return null // Or a loader if preferred
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
