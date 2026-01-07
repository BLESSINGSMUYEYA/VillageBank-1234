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
    t: (key: string, variables?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en')
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const savedLang = localStorage.getItem('app-language') as Language
        if (savedLang && ['en', 'ny'].includes(savedLang)) {
            setLanguageState(savedLang)
        } else {
            // Detect browser language
            const browserLang = navigator.language.split('-')[0]
            if (['en', 'ny'].includes(browserLang)) {
                setLanguageState(browserLang as Language)
            }
        }
        setIsLoaded(true)
    }, [])

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem('app-language', lang)
    }, [])

    const t = useCallback((key: string, variables?: Record<string, string | number>): string => {
        const keys = key.split('.')
        let result: any = dictionaries[language]

        // Find the translation string
        for (const k of keys) {
            if (result && k in result) {
                result = result[k]
            } else {
                // Fallback to English
                if (language !== 'en') {
                    let fallbackResult: any = dictionaries['en']
                    for (const fk of keys) {
                        if (fallbackResult && fk in fallbackResult) {
                            fallbackResult = fallbackResult[fk]
                        } else {
                            return key
                        }
                    }
                    result = fallbackResult
                    break
                }
                return key
            }
        }

        if (typeof result !== 'string') return key

        // Replace variables if provided
        if (variables) {
            Object.entries(variables).forEach(([vKey, vValue]) => {
                result = (result as string).replace(`{${vKey}}`, vValue.toString())
            });
        }

        return result
    }, [language])

    // if (!isLoaded) {
    //     return null
    // }

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
